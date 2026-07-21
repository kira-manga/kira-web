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
The server boundary in `src/lib/tutorial-api.ts` validates backend responses and caches successful
fetches with 60-second revalidation. Cached tutorial pages remain available through temporary backend
failures; a cold outage leaves the general site usable and shows explicit tutorial unavailable states.

The runtime image executes `.next/standalone/server.js` as the non-root `node` user on port 8080.
Mount a writable persistent volume at `/app/.next/cache`; the remaining filesystem is read-only.
`KIRA_TUTORIAL_API_URL` is the internal Docker-network origin. `NEXT_PUBLIC_KIRA_API_URL` is baked at
build time and must be the public API origin used for browser media and CSP.

Security headers formerly owned by the static Nginx image now live in `next.config.mjs`. Host Nginx,
public domains, App/Universal Link association files, and non-tutorial screenshot copies remain.
