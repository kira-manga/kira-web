#!/usr/bin/env bash
# Only called after the final frozen-policy recheck in the production job.
set -euo pipefail
export LC_ALL=C
umask 077

fail() { printf '%s\n' "Web transfer refused: $1" >&2; exit 1; }

[[ ${REVISION:-} =~ ^[0-9a-f]{40}$ ]] || fail 'invalid full revision'
[[ ${DEPLOY_USER:-} =~ ^[a-z_][a-z0-9_-]{0,31}$ ]] || fail 'invalid SSH user'
[[ -n ${DEPLOY_HOST:-} && ${#DEPLOY_HOST} -le 253 &&
   $DEPLOY_HOST =~ ^([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)*[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$ ]] || fail 'invalid SSH host'
DEPLOY_PORT=${DEPLOY_PORT:-22}
[[ $DEPLOY_PORT =~ ^[1-9][0-9]{0,4}$ ]] && (( DEPLOY_PORT <= 65535 )) || fail 'invalid SSH port'
[[ -n ${DEPLOY_KEY:-} && ${#DEPLOY_KEY} -le 65536 &&
   -n ${PINNED_KNOWN_HOSTS:-} && ${#PINNED_KNOWN_HOSTS} -le 65536 ]] || fail 'missing SSH material'
[[ -n ${RUNNER_TEMP:-} && -d $RUNNER_TEMP ]] || fail 'missing runner temporary directory'

key_dir=''
cleanup() {
  if [[ -n $key_dir ]]; then rm -rf -- "$key_dir"; fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
key_dir=$(mktemp -d "$RUNNER_TEMP/kira-web-ssh.XXXXXXXX")
printf '%s\n' "$DEPLOY_KEY" > "$key_dir/key"
printf '%s\n' "$PINNED_KNOWN_HOSTS" > "$key_dir/known_hosts"
chmod 600 "$key_dir/key" "$key_dir/known_hosts"
# Do not pass the secret values to Docker/gzip/SSH as environment variables.
unset DEPLOY_KEY PINNED_KNOWN_HOSTS BASH_ENV ENV SSH_AUTH_SOCK

# Bound the whole pipeline, not just the SSH connection. The inner shell receives
# validated data as positional arguments, never interpolated executable shell text.
if ! timeout --signal=TERM --kill-after=10s 5m \
  bash --noprofile --norc -euo pipefail -c '
    docker save "kira-web:$1" | gzip -9 | \
      ssh -F /dev/null -i "$2/key" -p "$3" \
        -o BatchMode=yes -o IdentitiesOnly=yes -o IdentityAgent=none \
        -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$2/known_hosts" \
        -o GlobalKnownHostsFile=/dev/null -o UpdateHostKeys=no \
        -o PasswordAuthentication=no -o KbdInteractiveAuthentication=no \
        -o ForwardAgent=no -o ClearAllForwardings=yes -o PermitLocalCommand=no \
        -o ConnectTimeout=15 -o ConnectionAttempts=1 \
        -o ServerAliveInterval=15 -o ServerAliveCountMax=3 \
        "$4@$5" "deploy web $1"
  ' kira-web-transfer "$REVISION" "$key_dir" "$DEPLOY_PORT" "$DEPLOY_USER" "$DEPLOY_HOST"; then
  fail 'image transfer failed'
fi
