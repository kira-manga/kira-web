# Standalone SSR deployment

## Protected production entry point

`.github/workflows/deploy.yml` is **manual, current-main only**, with no source-ref input.
A main push runs `Web source checks`, not deployment. Use a fresh main dispatch only after
its exact SHA has a successful push/main run of `.github/workflows/verify.yml`, including the
actual `web-verify` job. PR/merge-ref checks, a same-named check from another workflow,
skipped/neutral jobs, ambiguous runs and deployment reruns are not promotion evidence.

The preflight job freezes the repository/source/deployment identity, resolved verification
workflow ID, run/attempt/job IDs, and enforced-policy SHA-256. Its log shows the non-sensitive
SHA/run/attempt/job/fingerprint for reviewer inspection. The separate job depends on successful
preflight and literal `environment: production`: **native non-self environment approval is the
authorization boundary; dispatch and a green preflight are not approval.** The original snapshot
must still match after approval and again after the image build, immediately before SSH.
Every check requires the dispatch SHA to remain current main. A changed policy, new CI attempt,
missing evidence or advanced main refuses the release; do not resume by rerunning a job or
replacing its snapshot. Resolve the cause and start a fresh dispatch.

The build still runs Dockerfile's production `npm run verify` and streams that same local
`kira-web:<full-sha>` image, without another image build, registry push or artifact handoff.
This workflow is not a public post-deployment health gate; that separate release work remains
necessary. Production concurrency is serialized without cancellation; transfer is bounded to
five minutes (plus termination grace), inside the 30-minute production job.

### Owner-installed controls (required, not installed by this repository)

This initial checker supports the following explicit **classic** main protection and native
environment policy on `kira-manga/kira-web` at github.com. Missing/null/unreadable or unsupported
configuration denies. Ruleset-only protection is not treated as an equivalent; do not weaken
controls merely to fit the checker—review any needed support extension first.

* `main`: require 1–6 PR approvals, dismiss stale approvals on new commits, require independent
  approval of the latest reviewable push, and have **empty user/team/app PR-review bypass lists**.
  Enforce these settings for administrators; disallow force pushes and deletion. Reviews must
  cover workflow/checker changes, not just application code.
* Require strict/up-to-date status checking. This narrow configuration has exactly the
  `web-verify` required context/check, with its source bound to **GitHub Actions app ID 15368**,
  never “any source”; the API's `contexts` and `checks` must agree. Install the real source-check
  workflow and allow its check to appear before selecting it in branch protection.
* `production`: disable administrator bypass; configure one native required-reviewer rule with
  `prevent_self_review:true` and 1–6 distinct explicit **User** reviewer IDs chosen by the owner.
  GitHub requires **one** listed reviewer to approve, not all. Teams, bots, timers and custom
  rules are not substitutes. API type `User` does not prove human control of an account; verify
  reviewer ownership independently.
* Choose custom deployment branch policies with `custom_branch_policies:true` and
  `protected_branches:false`; install exactly one policy **type `branch`, name `main`**. No tags,
  wildcards or extra refs. “Protected branches only” is not exact-main enforcement. The checker
  accepts the documented optional `{type:"branch_policy"}` native marker (including its optional
  `id`/`node_id` metadata) alongside, never instead of, the required-reviewer rule. Duplicate or
  unknown rule interpretations deny. Approval and the complete native ref-policy list are
  validated independently of that marker.

Policy fingerprints cover enforced values and stable repository/environment/ref/reviewer IDs,
not avatars or unrelated display metadata. A policy snapshot cannot prove uninterrupted
historical protection and does not make approval/revocation/transfer atomic.

### Read authority and production-only SSH binding

Provision repository Actions secret **`WEB_PRODUCTION_POLICY_READ_TOKEN`** as a single-repository,
read-only fine-grained token with **Administration:read** (plus GitHub's implicit metadata read),
expiration and owner-managed rotation. It must have no write privileges or other repository
access; a broad classic `repo` PAT is not an acceptable fallback. Full classic branch-protection
GET needs this capability—`GITHUB_TOKEN` has no Administration workflow permission.

Only policy-check steps receive that token, and the client sends it **only** to
`GET /repos/kira-manga/kira-web/branches/main/protection`. Ordinary `GITHUB_TOKEN` with
contents/actions/deployments read handles repository, main ref, workflow/run/attempt/jobs and
supported environment/ref-policy reads (the drift workflow needs no actions permission).
Verify actual endpoint capability under the workflow's identity; an owner's successful CLI
request is not proof. Missing scope, expiry, 403/404/rate limits or other API failure denies,
with no write-scope or alternate-token retry. The client is fixed to HTTPS `api.github.com`,
API version `2022-11-28`, no redirects/proxies, at most 20 GETs/60 seconds, 10 seconds per request,
2 MiB per response, and complete single-page listings of at most 100 entries. Candidate run and
job listings must each contain exactly one entry for this fixed single-job workflow.

Provision **new** secrets only on the protected **production environment**:

| Binding | Purpose |
| --- | --- |
| `WEB_PRODUCTION_SSH_PRIVATE_KEY` | New, restricted Web-only SSH authority for the existing gateway. |
| `WEB_PRODUCTION_SSH_KNOWN_HOSTS` | Independently verified, pinned gateway host key(s), including the port-qualified host for a non-default port. |

**No repository/organization binding with either name may exist.** Merely naming the environment
cannot prove scope: GitHub can fall back to broader same-named secrets. The source does not read
or certify secret storage. Production variables remain `SERVER3_HOST` (DNS name/IPv4, not IPv6),
`SERVER3_USER`, and optional `SERVER3_PORT` (decimal 1–65535, default 22).

SSH material is referenced only in the final transfer step, after the last recheck, written into
an owned per-run `mktemp` directory with restrictive modes, and removed on exit/failure/TERM/INT.
The child pipeline has no key values in its environment, no ambient SSH configuration/agent or
unrelated known-host fallback, and strict host-key checking. The command is only
`deploy web <full-lowercase-40-hex-sha>`. Do not use host-key discovery or change the gateway here.
Normal cleanup cannot handle a hard-killed runner; use GitHub-hosted ephemeral runners as wired.
Step-scoped tokens/keys are **not process isolation** from reviewed code, dependencies or actions
earlier on the same runner. The production job still builds code before it receives the SSH key.

### External bootstrap and legacy-authority retirement

Before enabling the new authority, the owner must separately authorize and verify this rollout:

1. Inventory old Web deployment keys/bindings and shared consumers. Retire/revoke the old Web
   `SERVER3_SSH_PRIVATE_KEY` authority and cancel pending legacy runs/approvals, coordinating any
   shared-key consumer migration rather than breaking unrelated deployments. Removing a secret
   name is not proof that already-acquired SSH authority has been revoked at the host.
2. Independently review the bootstrap main tip and install this workflow/checker through an
   owner-reviewed rollout, with the new SSH binding still disabled. Install and verify the native
   branch/environment controls above. Protection installed today cannot retroactively prove that
   an earlier unprotected main tip was reviewed; do not manufacture historical approval evidence.
3. Verify policy-token endpoint capabilities, explicit human reviewer ownership, production-only
   secret scope and restricted server3 gateway activation. Only then enable the new production
   SSH authority and perform an independently authorized fresh main dispatch/native approval.

**Pre-change workflow reruns execute old workflow code; these new checks cannot retrofit them.**
The new secret name prevents that code from requesting the new binding, but old authority must
actually be retired. Repository code/fixture tests do not establish any of these external facts.
Native approval, installed controls, token capability, bootstrap review, secret scope/retirement,
revocation races and installed server3 behavior remain **EXTERNAL VERIFICATION REQUIRED**.

### Offline regression and drift checks

For deployment-control-only changes, the focused standard-library batch is:

```sh
python3 -m unittest discover -s scripts/ci -p 'test_*.py'
```

It checks canned API policy/source/run/attempt/job metadata, preserved snapshots, actual checked-in
workflow boundaries, Bash syntax and a mocked Docker/gzip/SSH/timeout pipeline with owned-file
cleanup. It opens no sockets, runs no npm or Docker build and starts no services. Fixture success
is not native approval or installed-policy proof. Normal source-check CI additionally runs locked
`npm ci` and the existing `npm run verify`; control-only local review does not need an unchanged
Next/browser/image rebuild.

`production-policy.yml` checks the same native-policy predicate weekly and on main-only manual
dispatch, without production environment/SSH access, a build or policy writes. It detects failure
to meet the supported predicate, not a history of every valid owner configuration change. The
owner must monitor failures and restore required native controls or read capability, then repeat
the check. Never bypass the gate or automatically “repair” GitHub settings in CI.

## Image configuration and runtime

The `production` GitHub Environment must define the non-sensitive Actions variable
`ANDROID_APP_SHA256_CERT_FINGERPRINT`. Copy its value from Google Play Console under
**Protected with Play → Play Store protection → Manage Play app signing → App signing key
certificate → SHA-256 certificate fingerprint**. Do not use the upload-key certificate. The
deployment workflow always enables production validation and fails before deployment when the
variable is absent or malformed.

Build the immutable image with the production Android association values and public API origin:

```sh
docker build \
  --build-arg KIRA_WEB_PRODUCTION=true \
  --build-arg ANDROID_APP_SHA256_CERT_FINGERPRINT="$ANDROID_APP_SHA256_CERT_FINGERPRINT" \
  --build-arg NEXT_PUBLIC_KIRA_API_URL=https://api.kiramanga.me \
  -t kira-web:$GIT_SHA .
```

The runtime receives `KIRA_TUTORIAL_API_URL=http://backend:8080`, joins the proxy network shared with
the backend, runs as non-root on port 8080, has a 384 MiB limit, keeps its root filesystem read-only,
and mounts `kira-next-cache` at `/app/.next/cache`. Do not mount tutorial media into web.
The builder needs no internal backend: tutorial-dependent routes render at request time and the
build checks reject prerendered tutorial output. A cold runtime outage shows unavailable UI without
seeding that state into the cache; a warm outage retains validated data, including sitemap entries.
The 60-second Data Cache refresh is not full-page ISR or a retry backoff. Detail 404 replaces old
content after its refresh completes (the first stale request may still see the old tutorial).
Before release, run `npm run test:tutorial-cache` against the built standalone output to exercise
cold/warm outage, malformed data, recovery, empty collections and archive behavior locally.

Deploy over the restricted SSH gateway on port 22 only after the backend migration, idempotent seed,
and public tutorial/media parity checks pass. Then deploy web, retain the existing host Nginx virtual
hosts unchanged, and verify:

```sh
npm run verify:production -- https://kiramanga.me
curl -I https://kiramanga.me/tutorials/
curl -I https://api.kiramanga.me/api/v1/tutorials
```

Publish a temporary tutorial through Swagger/API, confirm drafts are absent, publish it, and verify a
new dynamic slug appears in the library and sitemap within about 60 seconds without rebuilding web.
Also test archive (public 404), rollback, Arabic/dark-light variants, and a brief backend outage after
warming the cache. Rollback activates the prior web image; the persistent cache may be retained or
discarded. Database migrations and tutorial revisions are forward-only.
