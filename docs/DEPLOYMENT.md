# Production deployment runbook

This is an owner-operated runbook. Values in angle brackets are not known to the repository and must
be obtained from the relevant console. Do not paste secrets into commits, issues, or build logs.

## 1. Create the independent project

1. Use the independent `kira-web` repository.
2. Keep this project separate from the Kira app and backend Gradle builds.
3. Protect `main` and require the build/check job before merge.
4. In Cloudflare Pages, create a project named `kira-web` for the same account that will own the
   domain. The workflow deploys the already-built `out/` directory, so no dashboard build command is
   required.

## 2. Configure repository secrets and variables

Create a protected GitHub environment named `production`, then add:

| Kind | Name | Value/source |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | Scoped token with Pages edit/deploy permission for this account only |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| Secret | `ANDROID_APP_SHA256_CERT_FINGERPRINT` | Play Console **app signing key** SHA-256 fingerprint |
| Variable | `ANDROID_PACKAGE_NAME` | `me.manga.kira` |
| Variable | `APPLE_TEAM_ID` | `7CGZ2343AA` |
| Variable | `IOS_BUNDLE_ID` | `me.manga.kira` |

Require a manual environment approval for production until the first launch is complete. The build
fails before deployment if the Android fingerprint is absent or malformed.

## 3. Attach the custom domain and replace old DNS

The domain currently has evidence of an old GitHub Pages setup and an invalid certificate. In the
authoritative DNS provider:

1. Record the existing zone before changing it.
2. In Cloudflare Pages → `kira-web` → Custom domains, add `kiramanga.me`, then add
   `www.kiramanga.me` if the `www` alias is desired.
3. Remove old GitHub Pages records for the website only: any apex `A`/`AAAA` records pointing to
   GitHub Pages and any `www` CNAME pointing to `<owner>.github.io`. Do not remove mail (`MX`), TXT,
   or unrelated subdomain records.
4. If Cloudflare is authoritative DNS, allow Pages to create the proxied apex record. Confirm the
   dashboard shows a proxied `CNAME`/flattened record for `@` to `<kira-web-project>.pages.dev` and a
   proxied `CNAME` for `www` to the same target.
5. If another provider remains authoritative, create the exact CNAME/ALIAS target shown by the Pages
   custom-domain wizard. Apex CNAME support varies; use that provider's ALIAS/ANAME flattening or move
   authoritative DNS to Cloudflare. Do not invent the target before the Pages project exists.
6. Wait until both custom domains show **Active** and Cloudflare shows an issued edge certificate.

The committed `_redirects` rule canonicalizes `www` to the apex. Cloudflare must proxy the request for
that rule and the security headers to apply.

## 4. TLS and cache settings

1. Cloudflare SSL/TLS mode: **Full (strict)**.
2. Enable **Always Use HTTPS** and automatic HTTPS rewrites only after the custom-domain certificate is
   active.
3. Keep Universal SSL enabled. Do not use Flexible SSL.
4. Do not create a cache-everything rule for `/.well-known/*`. The committed one-hour cache header is
   deliberate; purge those two URLs after changing a certificate or app identifier.
5. Leave HSTS disabled for the first verified deployment. Enable it only after every required
   subdomain is HTTPS-ready and the owner accepts the long-lived browser commitment.

## 5. Deploy and verify

1. Run the workflow manually once from the protected `production` environment.
2. Confirm the build log says the production association identifiers passed and that Pages reports a
   deployment URL.
3. From a network outside the Cloudflare account, run:

   ```sh
   npm run verify:production -- https://kiramanga.me
   ```

4. Also inspect headers directly:

   ```sh
   curl -I https://kiramanga.me/.well-known/assetlinks.json
   curl -I https://kiramanga.me/.well-known/apple-app-site-association
   ```

   Both must return `200`, no cross-domain redirect, and `Content-Type: application/json`.

5. Open `/guide` and `/whatsnew/35/whatsnew.json`; the latter must return `200` with
   `Content-Type: application/json` so the in-app What's New client can decode it.
6. Validate Android App Links with a Play/internal build signed by the fingerprint in `assetlinks`.
7. Validate iOS Universal Links from Notes/Messages on a physical device with the installed build.
   Typing the URL directly into Safari's address bar is not a sufficient Universal Link test.
8. Validate `kiramanga://activate` as the explicit fallback on both platforms.

## 6. Rollback

Cloudflare Pages retains prior deployments. Roll back the Pages deployment first; do not change DNS
during an ordinary content rollback. If a certificate/identifier association is wrong, deploy the
correct files, purge only the two `/.well-known/` URLs, and retest. DNS rollback is a last resort and
must restore the recorded pre-change values exactly.
