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

### Tutorial transport limits

Each upstream operation has its own abort deadline covering both headers and body reads, and a
decoded response-byte ceiling. These server-only settings are read at runtime, before upstream access:

| Variable | Default / maximum | Accepted override |
| --- | --- | --- |
| `KIRA_TUTORIAL_TIMEOUT_MS` | `5000` ms | `100`–`5000` ms |
| `KIRA_TUTORIAL_MAX_RESPONSE_BYTES` | `2097152` bytes (2 MiB) | `4096`–`2097152` bytes |

Only absence selects a default. Supplied values must be decimal digits without leading zeros,
whitespace, signs, fractions or exponents; malformed/out-of-range values fail safely as `config`
before any upstream request. Timeout/oversize failures follow the same uncached unavailable or
stale-good path as other upstream failures. There are no retries. Detail 404 stays authoritative
without consuming its potentially endless body; unused bodies are aborted/cancelled rather than drained.

The cap counts actual decoded UTF-8 bytes before retaining or decoding each chunk, including chunked
and gzip responses. An oversized Content-Length permits early refusal only with absent/identity
Content-Encoding; it is not a substitute for the decoded stream count. Accepted existing cache entries
are not retroactively measured or invalidated when these limits change. Explicit abort signals bypass
render fetch deduplication: metadata/page callers can start separate operations for the same resource.

The backend has no aggregate catalog-byte ceiling, and valid large catalogs or 100-step tutorials can
exceed this limit. They fail safely, not by truncation; pagination/larger-catalog policy is outside this
transport change. Next's separate roughly 2 MiB **serialized cache-envelope/string-length** guard can
skip persistence even for a successfully accepted near-cap body. The byte cap is not a total-process
RSS, decompressor, cache-memory or concurrency bound. Deadlines depend on event-loop scheduling and
cannot preempt synchronous JSON parsing. These RSC functions receive no browser Request.signal, so
the private upstream deadline does not imply browser-disconnect cancellation.

### Tutorial regression checks

`npm run test:tutorial-transport` uses native fetch and one local HTTP fixture to check strict settings,
decoded fixed/chunked/gzip boundaries, stalled headers/dripped bodies, independent overlapping requests,
and peer closure before fixture teardown. It needs no Next build or external backend.

After building, `npm run test:tutorial-cache` exercises the actual standalone server and isolated cache
against a local synthetic backend (about two minutes, no additional build). It covers cold failures,
all four failed refresh modes, recovery, empty collections and archived details. The harness stops its
own servers and deletes its temporary runtime/cache. `npm run test:tutorial-cache -- --keys-only` is a
cheap cache-key check, including the unused server-side category query; it starts no servers.
`npm run test:tutorial-cache -- --transport-only` reuses that harness for cold timeout/oversize,
concurrent unseen-slug failures alongside healthy cached data, and stale-good/recovery after one real
60-second TTL (about one minute). It checks same-key positive/empty/404 replacements with small fixture
overrides, without replaying the longer legacy campaign. Both runtime modes require an existing build
and reuse the structural no-tutorial-prerender guard; neither needs a build-time backend stall probe.

The runtime image executes `.next/standalone/server.js` as the non-root `node` user on port 8080.
Mount a writable persistent volume at `/app/.next/cache`; the remaining filesystem is read-only.
`KIRA_TUTORIAL_API_URL` is the runtime internal Docker-network origin; builds do not fetch tutorial data
and `verify` rejects backend-dependent prerenders. `NEXT_PUBLIC_KIRA_API_URL` is baked at
build time and must be the public API origin used for browser media and CSP.

Security headers formerly owned by the static Nginx image now live in `next.config.mjs`. Host Nginx,
public domains, App/Universal Link association files, and non-tutorial screenshot copies remain.

## Public release verification

The protected manual deployment now requires a dependency-free public gate **after** SSH activation.
It checks the exact build-generated source revision, real route canonicals, app associations,
tutorial SSR availability and separate fresh, shape-validated public tutorial API responses.
An HTTP-200 homepage or stale-good Data Cache render alone cannot pass it. Empty tutorial collections
remain valid. This does not change the tutorial cache or server transport behavior above.

Run the same verifier for an explicitly selected deployed/recovered revision, with the same public
association inputs used for its build:

```sh
KIRA_WEB_SOURCE_REVISION="$EXPECTED_FULL_SOURCE_SHA" \
ANDROID_APP_SHA256_CERT_FINGERPRINT="$ANDROID_APP_SHA256_CERT_FINGERPRINT" \
npm run verify:production
```

Targets are fixed to `https://kiramanga.me` and `https://api.kiramanga.me`; there is no base-URL argument
or TLS bypass. Production builds require the full lowercase 40-hex `KIRA_WEB_SOURCE_REVISION` and
generate `/kira-release.json` only in standalone output, with `Cache-Control: no-store`. Development
builds without a SHA use `development`, which cannot pass the public gate. The marker binds **source
revision**, not image ID, reproducibility or tested-byte provenance.

`npm run test:deployment` uses only Node and OpenSSL: pure predicates/build-input checks and one owned
loopback HTTPS fixture plus its HTTP redirect listener. A disposable CA is trusted only by its owned
child; sockets/timers are closed, the child joined, and certificates/scratch removed immediately.
It needs no dependencies, Next build, Docker, external backend or public requests.

See [deployment limits and incident recovery](docs/DEPLOYMENT.md#public-gate-and-incident-hold).
A failed public gate leaves the deployment failed and emits an operator incident-hold notice; it
does **not** automatically roll back or establish on-call receipt. Freshness assumptions, installed
controls, retained known-public-good bytes and the real root recovery drill remain external gates.
