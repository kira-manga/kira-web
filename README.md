# Kira Web

Official website for [kiramanga.me](https://kiramanga.me), built with Next.js 16, React 19, and TypeScript. It presents the Kira Manga reader, hosts activation and support guidance, publishes policy drafts, and serves the Android App Links and Apple Universal Links association files.

## Local development

Requires Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. The site uses the App Router and server components, then exports to plain static files for Cloudflare Pages.

```sh
npm run lint       # Next.js Core Web Vitals rules
npm run typecheck  # strict TypeScript check
npm run build      # static production-mode Next.js build
npm run check      # validate generated routes, metadata, and app links
npm run verify     # run the complete local quality gate
npm run preview    # serve the generated out/ directory on port 4173
```

## Routes and assets

- `/`, `/tutorials`, `/tutorials/[slug]`, `/guide`, `/support`, and `/activate`
- `/privacy`, `/terms`, `/takedown`, and `/data-deletion`
- `/.well-known/assetlinks.json`
- `/.well-known/apple-app-site-association`
- `/whatsnew/35/whatsnew.json`

Pages live in `src/app/`, shared UI in `src/components/`, tutorial copy in `src/content/tutorials.ts`, public deployment files in `public/`, and deployment checks in `scripts/`. Homepage sections are isolated under `src/components/home/`. A small client preference controller synchronizes dark/light theme, English/Arabic copy, RTL direction, and the matching authentic app screenshot; preferences persist locally. The tutorial library provides client-side search and category filters while every tutorial still exports as a static route.

Official branding lives in `public/brand/`. `public/screens/` contains genuine captures from the installed Android app, resized and compressed for web delivery without visual reconstruction. `npm run check` enforces a 160 KB per-asset budget and validates product content, routes, metadata, security headers, and app-link files.

## Production configuration

The Android signing fingerprint is intentionally not committed. A production build fails unless it receives the Play **app signing key** SHA-256 fingerprint:

```sh
KIRA_WEB_PRODUCTION=true \
ANDROID_APP_SHA256_CERT_FINGERPRINT='AA:BB:...:FF' \
npm run build
```

Optional variables are `APPLE_TEAM_ID`, `IOS_BUNDLE_ID`, and `ANDROID_PACKAGE_NAME`; committed defaults match the current app identifiers. Do not substitute an upload-key fingerprint for the Play app-signing fingerprint.

Pushes to `main` run lint, typecheck, a production-gated build, structural checks, and a Cloudflare Pages deployment of `out/`. Configure the protected GitHub `production` environment before enabling deployment. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Release blockers

The policy pages accurately preserve unresolved owner/legal placeholders. Before a public launch, supply monitored support/privacy/takedown contacts, complete legal review, confirm Firebase retention and complaint authorization, and add the real Android fingerprint. Never commit Cloudflare tokens, signing material, or private app backups.
