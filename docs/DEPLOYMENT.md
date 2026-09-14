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
The same dispatch SHA is passed as `KIRA_WEB_SOURCE_REVISION` to the build and to a required public
verification step **after successful transfer**. A successful local health check/SSH exit is not
public release acceptance. Production concurrency is serialized without cancellation; transfer
is bounded to five minutes (plus termination grace), inside the 30-minute production job.

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

SSH material is referenced only in the transfer step, after the last recheck, written into
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

## Public gate and incident hold

### What the required gate establishes

The dependency-free Node 22 step runs `node scripts/verify-deployment.mjs` after activation, with
only non-sensitive revision/association inputs: no policy token, GitHub token or SSH key is passed
to it. Native success-only ordering, non-self approval and the immediately-pre-SSH policy recheck
remain intact. There is no continue-on-error, automatic retry, success override or rollback step.
Failure stays nonzero; a separate failure-only Actions annotation/summary calls for operator action.

The verifier has fixed site/API origins, no CLI origin/proxy/limit override, and normal TLS
certificate/hostname validation. It checks:

* Generated `/kira-release.json`: direct JSON 200 matching the exact expected full lowercase
  40-hex source SHA. Only the standalone materializer writes it; no committed placeholder passes.
  Its top-level path avoids the one-hour association cache rule and has an explicit no-store
  response header. This is **source-revision identity, not image attestation or reproducibility**.
* `/`, `/tutorials/`, `/activate/`, `/guide/`, `/privacy/`, `/terms/`, `/support/`, `/takedown/`,
  `/data-deletion/`: HTML 200 and that route's canonical metadata, not a homepage fallback. Only
  same-origin HTTPS canonical slash redirects are allowed, with no credentials, query or fragment;
  no response-selected admin/media/other path is requested. HTTP `/` must redirect to the exact
  production HTTPS origin root, not just any HTTPS site.
* `/whatsnew/35/whatsnew.json`: direct JSON 200 and the existing nonempty-features requirement.
* Both well-known associations: **direct HTTPS 200, no redirect**, actual application/json media
  type (optional parameters), exact Android relation/namespace/package/fingerprint set and Apple
  appID/empty apps list/activation components. Fingerprint case and explanatory Apple comments
  do not change semantics; additional grants, exclusions, query/fragment constraints or broader
  paths fail. The expected inputs use the build's same effective defaults for empty optional
  variables: `me.manga.kira`, `7CGZ2343AA`, `me.manga.kira`. The existing structural build check
  still enforces these shipping package/appID values; optional variables do not waive that check.
* The tutorial index SSR marker must say available, using **both** existing `status === 'ok'`
  results. Separate direct JSON 200 GETs to `https://api.kiramanga.me/api/v1/tutorial-categories`
  and `/api/v1/tutorials` validate every entry and nested consumer-required field. Empty arrays
  are valid; there is no seed count, cross-endpoint snapshot equality, media fetch or mutation.

Correct association JSON does not certify Play signing-key provenance, Apple CDN refresh,
associated-domain entitlements or physical Android/iOS link handling; those remain external checks.

Every request sends `Cache-Control: no-cache, no-store, max-age=0` and `Pragma: no-cache`. The marker
and both direct API probes additionally use a unique per-run `kira_verify` query value, without
conditional validators. They reject positive/malformed Age, stale/revalidation warnings 110–113,
negative Cache-Status TTL/forwarded-stale evidence and known STALE/UPDATING cache-status markers.
This conservative refusal does not reject the backend's `max-age=60, stale-if-error=86400` policy
by itself. **Absent stale headers do not prove current-origin freshness or intermediary compliance.**
Installed CDN/proxy query/revalidation behavior remains an external assumption. A stale-good Next
render cannot replace these probes, but a noncompliant intermediary may still conceal an outage.

Fixed verifier limits (not runtime tutorial-transport settings):

| Resource | Limit |
| --- | --- |
| Whole operation, including redirects and progressing body | 10 seconds |
| Entire sequential run | 60 seconds; workflow step backstop 2 minutes |
| Response headers | 16 KiB per response |
| HTML / ordinary JSON decoded body | 4 MiB / 2 MiB |
| Each association / source marker decoded body | 128 KiB / 1 KiB |
| Aggregate retained decoded response bytes | 32 MiB per run |
| HTML redirects | At most 2, same route/origin; all JSON probes are direct |

Unused/excess bodies and decoders are destroyed, not drained. Actual decoded chunks are counted
before retention, including gzip/deflate/Brotli; Content-Length is only an identity-body early
refusal optimization. Requests are finite (at most 34 including canonical redirects), with no
retries. Event-loop timers cannot preempt synchronous parsing; these bounds are not RSS,
decompressor working memory, exact-wire-byte or global concurrency guarantees. Safe receipts
contain only fixed path, HTTP status (0 before headers), expected revision and failure kind—never
upstream bodies, redirect targets, exception messages or certificate details.

`node scripts/test-verify-deployment.mjs` / `npm run test:deployment` checks this contract with pure
predicates and one native loopback TLS fixture, including valid empties, wrong identity/policies,
direct-only and canonical redirects, trust/hostname refusal, stale-good SSR versus live failures,
freshness directives, decoded/aggregate caps, progressing-body deadlines and peer cancellation
before teardown. It uses a disposable child-only CA and immediately joins/cleans its owned child,
servers, sockets, timers and files. It performs no public requests, installs or Next/Docker builds.
Source CI runs it before dependency installation; the normal affected build still checks generated
marker materialization and the no-tutorial-prerender guard.

### Mandatory approval checklist and failure procedure

**This is an operational incident hold, not an automatic machine latch.** Before every production
approval the operator must inspect the prior public-verification/recovery receipt, confirm there
is no unresolved hold and identify the retained known-public-good image/archive/source tuple.
Workflow-level non-cancelling concurrency serializes these releases, but cannot constrain external
root changes or enforce that checklist. A receiver-successful/local-healthy `previous` entry is
not automatically a public-good release.

On a public gate failure:

1. Treat activation as potentially still active. The failed deployment stays failed; no rollback
   was attempted. Confirm actual on-call receipt and assign the incident; an Actions annotation or
   summary is **not** evidence that anyone was paged or responded.
2. Freeze new dispatches, approvals, ordinary root Web activations and image/archive pruning.
   Cancel/reconcile queued and legacy-approved work. Preserve both the failed candidate and the
   last **known-public-good** immutable image/archive/source tuple and their receipts. A later
   successful activation could rotate/prune that predecessor; do not resume while the hold remains.
3. Separately authorize diagnosis of DNS/TLS/public routing, API availability and actual host state.
   Changing the Web image does not necessarily fix these failures. Do not guess a mutable tag or
   perform a tutorial/database rollback, delete an archive, clear a pending marker or bypass guards.
4. If immutable image recovery is appropriate, an authorized **root** operator must first verify
   the installed Backend24 receiver/adoption state and reconcile actual container `.Image`,
   `images.env`, `/opt/kira/releases/web/activation` and the retained content-addressed
   `/opt/kira/releases/web/<archive-sha256>.tar.gz`. Select the known-public-good recorded tuple,
   not merely whichever entry is named `previous`. Only then, under that separate authority,
   the candidate normal-state command is:

   ```sh
   # Exact recorded immutable ID: sha256: followed by its full 64-hex image ID, never a tag.
   sudo /usr/local/sbin/kira-deploy activate web "$KNOWN_PUBLIC_GOOD_IMAGE_ID"
   ```

   This is **not** available through the restricted Web SSH gateway. It uses ordinary
   unhealthy/unowned/drift/missing-archive/pending guards and may refuse recovery; abnormal state
   requires separately authorized reconciliation. No new gateway command/privilege is supplied here.
5. Verify actual image, health and persisted records after authorized recovery. Run the **same
   public verifier**, with the recovered full source SHA and that build's association inputs, and
   retain its passing receipt before lifting the hold or resuming approval/pruning. A legacy image
   without the source marker cannot be given an invented passing receipt; handle bootstrap under
   separate review rather than bypassing this check.

**Unresolved recovery dependency / EXTERNAL VERIFICATION REQUIRED:** Backend24's candidate root
activation command has command-stub fixture coverage, but its integration/installation and a real
root restoration after locally successful, publicly failed B are not proved by this Web change.
An automatic failed-activation restoration exercise is not the same as that explicit root command.
Retained compatible public-good bytes, installed controls/hold discipline, authorized root access,
actual on-call receipt, public probes and a real recovery/public-reverification drill are release
gates still requiring external evidence. Documentation or a green local fixture does not discharge
them, establish automatic rollback, or close the recovery obligation.

## Image configuration and runtime

The `production` GitHub Environment must define the non-sensitive Actions variable
`ANDROID_APP_SHA256_CERT_FINGERPRINT`. Copy its value from Google Play Console under
**Protected with Play → Play Store protection → Manage Play app signing → App signing key
certificate → SHA-256 certificate fingerprint**. Do not use the upload-key certificate. The
deployment workflow always enables production validation and fails before deployment when the
variable is absent or malformed.

Build the immutable image with the exact full lowercase source SHA, production Android association
values and public API origin (the protected workflow supplies the SHA rather than accepting input):

```sh
docker build \
  --build-arg KIRA_WEB_PRODUCTION=true \
  --build-arg KIRA_WEB_SOURCE_REVISION="$GIT_SHA" \
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
KIRA_WEB_SOURCE_REVISION="$EXPECTED_FULL_SOURCE_SHA" \
ANDROID_APP_SHA256_CERT_FINGERPRINT="$ANDROID_APP_SHA256_CERT_FINGERPRINT" \
npm run verify:production
```

In a separately authorized parity exercise, publish a temporary tutorial through Swagger/API, confirm drafts are absent, publish it, and verify a
new dynamic slug appears in the library and sitemap within about 60 seconds without rebuilding web.
Also test archive (public 404), rollback, Arabic/dark-light variants, and a brief backend outage after
warming the cache. These mutations are not part of the read-only public gate. Image recovery follows
the incident procedure and conditional guards above, not a guessed prior tag. Database migrations
and tutorial revisions are forward-only.
