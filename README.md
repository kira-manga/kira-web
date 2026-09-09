# Kira Web

Official [kiramanga.me](https://kiramanga.me) website, built with Next.js 16 standalone SSR, React 19,
and strict TypeScript. General site copy remains in `src/content`; tutorials, categories, ordering,
featured state, revisions, and tutorial media come from kira-backend.

## Local development

Run the backend on port 8080, then:

```sh
npm ci
KIRA_TUTORIAL_API_URL=http://localhost:8080 \
NEXT_PUBLIC_KIRA_API_URL=http://localhost:8080 \
npm run dev
```

`npm run verify` runs ESLint, TypeScript, the standalone production build, and structural checks.
Tutorial pages, homepage previews, metadata and sitemap render at request time over the validated
Data Cache in `src/lib/tutorial-api.ts`, not full-page ISR. Successful validated results have 60-second
revalidation; failed refreshes keep the last good data. A cold outage leaves the general site usable
with explicit tutorial unavailable states (and only static sitemap URLs), without caching the failure.
Malformed JSON/schema responses are rejected before caching and logged using only safe failure kinds.
Detail 404 is an authoritative, cached not-found result: a stale request may see the old tutorial,
but requests after the completed 404 refresh see not-found. Valid empty collections replace old data.
Stale failures can retry on later traffic; 60 seconds is not an outage backoff or global coalescing limit.

After building, `npm run test:tutorial-cache` exercises the actual standalone server and isolated cache
against a local synthetic backend (about two minutes, no additional build). It covers cold failures,
all four failed refresh modes, recovery, empty collections and archived details. The harness stops its
own servers and deletes its temporary runtime/cache. `npm run test:tutorial-cache -- --keys-only` is a
cheap cache-key check, including the unused server-side category query; it starts no servers.

The runtime image executes `.next/standalone/server.js` as the non-root `node` user on port 8080.
Mount a writable persistent volume at `/app/.next/cache`; the remaining filesystem is read-only.
`KIRA_TUTORIAL_API_URL` is the runtime internal Docker-network origin; builds do not fetch tutorial data
and `verify` rejects backend-dependent prerenders. `NEXT_PUBLIC_KIRA_API_URL` is baked at
build time and must be the public API origin used for browser media and CSP.

Security headers formerly owned by the static Nginx image now live in `next.config.mjs`. Host Nginx,
public domains, App/Universal Link association files, and non-tutorial screenshot copies remain.
