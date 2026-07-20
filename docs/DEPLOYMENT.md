# Production deployment runbook

Kira Web is built into an immutable Nginx image and streamed to server3 by GitHub Actions. Do not
paste secrets into commits, issues, or build logs.

## 1. Configure repository secrets and variables

Create a protected GitHub environment named `production`, then add:

| Kind | Name | Value/source |
|---|---|---|
| Secret | `SERVER3_SSH_PRIVATE_KEY` | Dedicated key restricted to the Kira deploy gateway |
| Secret | `SERVER3_KNOWN_HOSTS` | Pinned server3 host-key line |
| Secret | `ANDROID_APP_SHA256_CERT_FINGERPRINT` | Current release-certificate SHA-256; replace with the Play App Signing SHA-256 after enrollment |
| Variable | `SERVER3_HOST` | `213.130.144.21` |
| Variable | `SERVER3_PORT` | `22` |
| Variable | `SERVER3_USER` | `kira-deploy` |
| Variable | `ANDROID_PACKAGE_NAME` | `me.manga.kira` |
| Variable | `APPLE_TEAM_ID` | `7CGZ2343AA` |
| Variable | `IOS_BUNDLE_ID` | `me.manga.kira` |

Require a manual environment approval for production until the first launch is complete. While the
Android fingerprint secret is absent, the workflow deploys the website with a placeholder association
and Android App Links remain unverified. After the secret is added, malformed fingerprints fail the
build before deployment.

A non-debug release certificate is valid before Google Play enrollment, but App Links verify only for
apps signed by the fingerprint currently deployed. After enabling Play App Signing, replace the secret
with Play Console's app-signing fingerprint and redeploy the site before distributing the Play build.

## 2. DNS and TLS

`kiramanga.me` and `api.kiramanga.me` resolve to server3 (`213.130.144.21`); `www` is a CNAME to the
apex. Host Nginx redirects HTTP and `www` to `https://kiramanga.me`. The site and API use separate
virtual-host files and separate Let's Encrypt certificate lineages. Do not change MX, mail TXT, PTR,
mail ports, or mail firewall rules as part of a web deployment.

## 3. TLS and cache settings

1. Confirm `sudo nginx -t` passes before every host Nginx reload.
2. Use `certbot renew --dry-run` after changing certificate or challenge configuration.
3. Do not create a cache-everything rule for `/.well-known/*`. The committed one-hour cache header is
   deliberate; purge those two URLs after changing a certificate or app identifier.
4. Leave HSTS disabled for the first verified deployment. Enable it only after every required
   subdomain is HTTPS-ready and the owner accepts the long-lived browser commitment.

## 4. Deploy and verify

1. Run the workflow manually once from the protected `production` environment.
2. Confirm the build verifies the production association identifiers and deploys the exact Git SHA.
3. From a network outside server3, run:

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

## 5. Rollback

The server deploy command health-checks a new container and restores the previous image if activation
fails. To roll back a healthy but incorrect release, activate a retained image with the root-only
`/usr/local/sbin/kira-deploy` command. Do not change DNS during an ordinary content rollback. If an
association identifier is wrong, deploy the corrected image and retest both `/.well-known/` files.
