# Standalone SSR deployment

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
