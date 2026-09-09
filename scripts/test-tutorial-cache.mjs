import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { assertTutorialRuntimeBuild } from './assert-tutorial-runtime-build.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
assert.ok(process.argv.slice(2).every((arg) => arg === '--keys-only'), 'Only --keys-only is supported');

// Test the actual pure key builder without a Next mock, a new runner, or requiring
// Node's experimental TypeScript support. TypeScript is already a build dependency.
const keySource = await readFile(path.join(root, 'src/lib/tutorial-cache-key.ts'), 'utf8');
const keyCode = ts.transpileModule(keySource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { tutorialCacheKey: key, tutorialRequestPath: requestPath } = await import(
  `data:text/javascript;base64,${Buffer.from(keyCode).toString('base64')}`
);
const internal = 'http://internal.test';
const publicOrigin = 'https://public.test';
const list = { kind: 'tutorials' };
const requests = [list, { kind: 'categories' }, { kind: 'tutorial', slug: 'fixed' },
  { kind: 'tutorial', slug: 'fixed/other' }, { ...list, featured: true }, { ...list, featured: false },
  { ...list, category: 'one' }, { ...list, category: 'two' }, { ...list, category: 'one', featured: true }];
const keys = requests.map((request) => key(internal, publicOrigin, request));
assert.equal(new Set(keys).size, requests.length);
assert.notEqual(keys[0], key(`${internal}/other`, publicOrigin, list));
assert.notEqual(keys[0], key(internal, `${publicOrigin}/other`, list));
assert.deepEqual(JSON.parse(keys[0]), ['kira-tutorial-api', 1, 'tutorials', internal, publicOrigin,
  '/api/v1/tutorials', null, null, null]);
assert.equal(key(internal, publicOrigin, { kind: 'tutorials', featured: true, category: 'one' }),
  key(internal, publicOrigin, { category: 'one', featured: true, kind: 'tutorials' }));
assert.equal(requestPath({ kind: 'tutorial', slug: 'a/b?c' }), '/api/v1/tutorials/a%2Fb%3Fc');
assert.equal(requestPath({ ...list, category: 'a&b', featured: false }), '/api/v1/tutorials?category=a%26b&featured=false');
const originsA = ['http://internal.test/a,https://public.test/b', 'https://public.test/c'];
const originsB = ['http://internal.test/a', 'https://public.test/b,https://public.test/c'];
assert.equal(originsA.join(','), originsB.join(','), 'Fixture must collide under comma-joining');
assert.notEqual(key(...originsA, list), key(...originsB, list));
console.log('PASS cache keys: kind/version/origins/slug/query, deterministic tuple and delimiter isolation.');

if (!process.argv.includes('--keys-only')) await productionRegression();

async function productionRegression() {
  await assertTutorialRuntimeBuild(root);
  const { config: builtConfig } = JSON.parse(
    await readFile(path.join(root, '.next/required-server-files.json'), 'utf8'),
  );
  console.log('PASS cold-build artifacts: tutorial-dependent routes are not prerendered.');
  console.log('UNOBSERVED/external: custom404 hydrated browser rendering (this harness proves HTTP/cache behavior only).');
  const runtime = await mkdtemp(path.join(tmpdir(), 'kira-web-1-runtime-'));
  const abort = new AbortController();
  const stop = () => abort.abort(new Error('Tutorial cache regression interrupted'));
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  const deadline = setTimeout(() => abort.abort(new Error('Tutorial cache regression exceeded 240s')), 240_000);
  const bodyMarker = 'KIRALEAK';
  const api = {
    full: '/api/v1/tutorials', featured: '/api/v1/tutorials?featured=true',
    categories: '/api/v1/tutorial-categories', detail: '/api/v1/tutorials/steady-guide',
    archive: '/api/v1/tutorials/archive-guide',
  };
  const staticRoutes = ['/', '/activate', '/tutorials', '/guide', '/support', '/privacy', '/terms', '/takedown', '/data-deletion'];
  const unavailable = {
    home: 'Tutorial previews are temporarily unavailable.',
    library: 'Tutorials are temporarily unavailable.',
    detail: 'This tutorial is temporarily unavailable.',
  };
  let mode = 'network';
  let revision = 'A';
  const overrides = new Map();
  const upstreamRequests = [];
  let server;
  let serverExit;
  let serverLogs = '';
  let webOrigin;
  const localized = (value) => ({ en: value, ar: `AR ${value}` });
  const category = () => ({ id: 'category', slug: 'fixture-category', label: localized(`CACHE CATEGORY ${revision}`),
    iconCode: 'book', position: 0, revision: revision === 'A' ? 1 : 2 });
  function tutorial(slug, title) {
    return { id: slug, slug, category: category(), title: localized(title), summary: localized(`Summary ${title}`),
      introduction: localized(`Introduction ${title}`), duration: localized('2 minutes'), level: localized('Beginner'),
      cover: { default: { id: 'cover', url: '/api/v1/tutorial-media/cover', contentType: 'image/png',
        width: 10, height: 10, sha256: '0'.repeat(64) }, alt: localized('Fixture'), variants: {} },
      steps: [{ id: 'first-step', title: localized('First step'), body: localized('Fixture instructions') }],
      position: 0, featuredPosition: slug === 'featured-guide' ? 0 : null, revision: revision === 'A' ? 1 : 2 };
  }
  function payload(url) {
    if (url.pathname === api.categories) return [category()];
    const tutorials = [tutorial('steady-guide', `CACHE DETAIL ${revision}`),
      tutorial('featured-guide', `CACHE FEATURED ${revision}`),
      tutorial(`catalog-${revision.toLowerCase()}`, `CACHE CATALOG ${revision}`)];
    if (revision === 'A') tutorials.push(tutorial('archive-guide', 'CACHE ARCHIVE A'));
    if (url.pathname === api.full) {
      if (url.searchParams.get('featured') === 'true') return tutorials.filter((item) => item.featuredPosition !== null);
      return tutorials;
    }
    return tutorials.find((item) => url.pathname === `${api.full}/${item.slug}`);
  }
  const upstream = createServer((request, response) => {
    const currentMode = overrides.get(request.url) ?? mode;
    const record = { url: request.url, mode: currentMode, completed: false };
    upstreamRequests.push(record);
    response.once('finish', () => { record.status = response.statusCode; record.completed = true; });
    response.once('close', () => { record.completed = true; });
    if (currentMode === 'network') { response.destroy(); return; }
    response.setHeader('Content-Type', 'application/json');
    if (currentMode === 'http' || currentMode === 'not-found') {
      response.statusCode = currentMode === 'http' ? 503 : 404;
      response.end(bodyMarker);
      return;
    }
    if (currentMode === 'json') { response.end(`${bodyMarker} is not JSON`); return; }
    const url = new URL(request.url, 'http://fixture.test');
    let data = payload(url);
    if (data === undefined) { response.statusCode = 404; response.end('{}'); return; }
    if (currentMode === 'schema') {
      const malformed = (item) => url.pathname === api.categories
        ? { ...item, label: { en: bodyMarker } } // Required Arabic text is missing.
        : { ...item, title: localized(bodyMarker), steps: [] }; // A required array must be non-empty.
      data = Array.isArray(data) ? data.map(malformed) : malformed(data);
    }
    if (currentMode === 'empty') data = [];
    response.end(JSON.stringify(data));
  });

  async function until(label, assertion) {
    const end = Date.now() + 15_000;
    let lastError;
    while (Date.now() < end) {
      abort.signal.throwIfAborted();
      assert.equal(serverExit, undefined, `Standalone server exited: ${serverExit}`);
      try { return await assertion(); } catch (error) { lastError = error; }
      await delay(100, undefined, { signal: abort.signal });
    }
    throw new Error(`Timed out: ${label}`, { cause: lastError });
  }
  async function page(route) {
    const response = await fetch(`${webOrigin}${route}`, {
      // Request blocking metadata so title/status assertions do not depend on streaming bot policy.
      headers: { 'User-Agent': 'Twitterbot' },
      signal: AbortSignal.any([abort.signal, AbortSignal.timeout(10_000)]),
    });
    const text = await response.text(); // Drain the entire HTML, including metadata.
    assert.ok(!text.includes(bodyMarker), `Upstream body leaked into ${route}`);
    return { status: response.status, text: text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '') };
  }
  async function views(includeArchive = false) {
    const result = { home: await page('/'), library: await page('/tutorials/'), sitemap: await page('/sitemap.xml'),
      detail: await page('/tutorials/steady-guide/') };
    if (includeArchive) result.archive = await page('/tutorials/archive-guide/');
    return result;
  }
  const h1 = (html) => html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';
  const preview = (html) => html.match(/<section\b[^>]*\bid="tutorials"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
  const sitemapRoutes = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname).sort();
  function assertDetail(result, title, slug = 'steady-guide') {
    assert.equal(result.status, 200);
    assert.ok(h1(result.text).includes(title), 'Detail h1, not a navigation/Flight string, must be current');
    assert.ok(result.text.match(/<title>([^<]+)<\/title>/)?.[1].startsWith(`${title} — `), 'Detail metadata title must be current');
    assert.ok(result.text.includes(`name="description" content="Summary ${title}"`), 'Detail metadata description must be current');
    const canonicalTags = (result.text.match(/<link\b[^>]*>/gi) ?? [])
      .filter((tag) => /\srel\s*=\s*(["'])canonical\1(?=\s|\/?>)/i.test(tag));
    const canonicalHref = canonicalTags[0]?.match(/\shref\s*=\s*(["'])(.*?)\1/i)?.[2];
    const actualCanonical = canonicalHref === undefined ? '<missing>' : JSON.stringify(canonicalHref.slice(0, 200));
    const expectedPath = `/tutorials/${encodeURIComponent(slug)}${builtConfig.trailingSlash ? '/' : ''}`;
    const canonicalDiagnostic = `Detail canonical must retain pathname ${expectedPath}; actual (first 200 chars): ${actualCanonical}`;
    assert.equal(canonicalTags.length, 1, canonicalDiagnostic);
    let canonicalUrl;
    try {
      canonicalUrl = new URL(canonicalHref);
    } catch {
      assert.fail(canonicalDiagnostic);
    }
    assert.ok(
      ['http:', 'https:'].includes(canonicalUrl.protocol)
        && canonicalUrl.pathname === expectedPath && canonicalUrl.search === '' && canonicalUrl.hash === '',
      canonicalDiagnostic,
    );
    assert.ok(!result.text.includes(unavailable.detail));
  }
  function assertNotFound(result) {
    // Next may emit an empty SSR error shell; custom404 browser rendering is not observed here.
    const headings = [...result.text.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((match) => match[1]);
    const diagnostic = JSON.stringify({
      status: result.status,
      title: (result.text.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').slice(0, 200),
      headings: headings.slice(0, 4).map((heading) => heading.slice(0, 200)),
    });
    assert.equal(result.status, 404, `Negative detail status; actual (bounded): ${diagnostic}`);
    const robots = (result.text.match(/<meta\b[^>]*>/gi) ?? [])
      .filter((tag) => /\sname\s*=\s*(["'])robots\1(?=\s|\/?>)/i.test(tag));
    const noindex = robots.some((tag) => (tag.match(/\scontent\s*=\s*(["'])(.*?)\1/i)?.[2] ?? '')
      .split(/[\s,]+/).some((token) => token.toLowerCase() === 'noindex'));
    assert.ok(noindex, `Negative detail must include robots noindex; actual (bounded): ${diagnostic}`);
    assert.ok(!/<article\b/i.test(result.text), `Negative detail must not render a tutorial article; actual (bounded): ${diagnostic}`);
    assert.ok(!headings.some((heading) => /\bCACHE (?:DETAIL|ARCHIVE|FEATURED|CATALOG)\b/.test(heading)),
      `Negative detail must not retain a fixture heading; actual (bounded): ${diagnostic}`);
    assert.ok(!Object.values(unavailable).some((message) => result.text.includes(message)),
      `Negative detail must not render an unavailable fallback; actual (bounded): ${diagnostic}`);
  }
  function assertAvailable(result, value) {
    for (const name of ['home', 'library', 'sitemap']) assert.equal(result[name].status, 200);
    const home = preview(result.home.text);
    assert.ok(home.includes(`CACHE FEATURED ${value}`));
    assert.ok(!home.includes(`CACHE DETAIL ${value}`), 'Featured and full-list fixtures must remain distinct');
    assert.ok(!home.includes(unavailable.home));
    assert.ok(result.library.text.includes(`<h3>CACHE DETAIL ${value}</h3>`));
    assert.match(result.library.text, new RegExp(`<button\\b[^>]*>CACHE CATEGORY ${value}</button>`));
    assert.ok(!result.library.text.includes(unavailable.library));
    assert.ok(sitemapRoutes(result.sitemap.text).includes(`/tutorials/catalog-${value.toLowerCase()}`));
    assertDetail(result.detail, `CACHE DETAIL ${value}`);
  }
  async function cacheSnapshot() {
    // Read-only observation of Next 16.2.10's real persistent FETCH entries. Never
    // edit timestamps/entries or replace the cache implementation to accelerate tests.
    const directory = path.join(runtime, '.next/cache/fetch-cache');
    const files = await readdir(directory).catch((error) => { if (error.code === 'ENOENT') return []; throw error; });
    const entries = new Map();
    for (const file of files.sort()) {
      const entry = JSON.parse(await readFile(path.join(directory, file), 'utf8'));
      assert.equal(entry.kind, 'FETCH');
      assert.equal(entry.revalidate, 60);
      const value = JSON.parse(entry.data.body);
      assert.ok(value.status === 'ok' || value.status === 'not-found', 'Only validated/authoritative values may be cached');
      entries.set(file, value);
    }
    return entries;
  }
  function cacheDiagnostic(snapshot, groups = {}) {
    return JSON.stringify({ total: snapshot.size, entries: [...snapshot].slice(0, 12).map(([cacheKey, value]) => ({
      key: cacheKey.slice(0, 80), status: value.status,
      families: Object.keys(groups).filter((family) => groups[family].includes(cacheKey)),
      items: (Array.isArray(value.data) ? value.data : [value.data]).slice(0, 4).map((item) => ({
        slug: String(item?.slug ?? '').slice(0, 80),
        text: String(item?.title?.en ?? item?.label?.en ?? '').slice(0, 120),
        revision: String(item?.revision ?? '').slice(0, 20),
      })),
    })) });
  }
  let lastWarmDiagnostic;
  function warmCacheFamilies(snapshot) {
    const titles = { 'steady-guide': 'CACHE DETAIL A', 'archive-guide': 'CACHE ARCHIVE A',
      'featured-guide': 'CACHE FEATURED A', 'catalog-a': 'CACHE CATALOG A' };
    const tutorialA = (item) => typeof item?.slug === 'string' && Object.hasOwn(titles, item.slug)
      && item?.title?.en === titles[item.slug] && item?.revision === 1;
    const listA = (data, slugs) => Array.isArray(data) && data.length === slugs.length
      && data.every(tutorialA) && new Set(data.map((item) => item.slug)).size === slugs.length
      && data.every((item) => slugs.includes(item.slug));
    const predicates = {
      detail: (data) => tutorialA(data) && data.slug === 'steady-guide',
      archive: (data) => tutorialA(data) && data.slug === 'archive-guide',
      full: (data) => listA(data, Object.keys(titles)),
      featured: (data) => listA(data, ['featured-guide']),
      categories: (data) => Array.isArray(data) && data.length === 1 && data[0]?.slug === 'fixture-category'
        && data[0]?.label?.en === 'CACHE CATEGORY A' && data[0]?.revision === 1,
    };
    const groups = Object.fromEntries(Object.entries(predicates).map(([family, predicate]) => [family,
      [...snapshot].filter(([, value]) => value.status === 'ok' && predicate(value.data)).map(([cacheKey]) => cacheKey)]));
    const diagnostic = cacheDiagnostic(snapshot, groups);
    if (diagnostic !== lastWarmDiagnostic) console.log(`CACHE warm fixture classification (bounded): ${diagnostic}`);
    lastWarmDiagnostic = diagnostic;
    const classifiedKeys = Object.values(groups).flat();
    assert.ok(classifiedKeys.length === snapshot.size && new Set(classifiedKeys).size === snapshot.size,
      `Every warmed key must be ok and match exactly one fixture family; actual: ${diagnostic}`);
    for (const [family, cacheKeys] of Object.entries(groups)) {
      assert.ok(cacheKeys.length > 0, `Missing warmed fixture family ${family}; actual: ${diagnostic}`);
    }
    return groups;
  }
  async function failedRefreshes(start, logStart, kind, groups, families = Object.keys(api)) {
    let lastDiagnostic;
    await until(`completed ${kind} refreshes`, async () => {
      const failures = [...serverLogs.slice(logStart).matchAll(
        /revalidating cache with key:([\s\S]*?)-\[\]\s+[\s\S]*?Tutorial API unavailable \((network|http|json|schema)\)/g,
      )];
      const coverage = families.map((family) => ({ family, expected: groups[family].length,
        completed: upstreamRequests.slice(start).filter((request) => request.url === api[family]
          && request.mode === kind && request.completed).length,
        // Next logs this path only for stale hits. Preserve the complete callback/tuple/args identity,
        // not occurrence counts: separate compiled contexts may have separate physical keys.
        invocations: [...new Set(failures.filter((match) => match[2] === kind && match[1].includes(JSON.stringify(api[family])))
          .map((match) => `${match[1].trim()}-[]`))],
      }));
      const diagnostic = JSON.stringify(coverage.map(({ invocations, ...counts }) => ({ ...counts,
        distinct: invocations.length, invocations: invocations.slice(0, 4).map((value) => value.slice(0, 360)) })));
      if (diagnostic !== lastDiagnostic) console.log(`CACHE ${kind} refresh coverage (bounded): ${diagnostic}`);
      lastDiagnostic = diagnostic;
      for (const item of coverage) {
        assert.ok(item.completed >= item.expected, `Missing completed fixture responses; actual: ${diagnostic}`);
        assert.equal(item.invocations.length, item.expected, `Missing distinct sanitized Next rejections; actual: ${diagnostic}`);
      }
      assert.ok(!serverLogs.includes(bodyMarker), 'Raw JSON/schema response content leaked into server logs');
    });
  }

  try {
    const standalone = path.join(root, '.next/standalone');
    await cp(standalone, runtime, { recursive: true,
      filter: (source) => source !== path.join(standalone, '.next/cache') });
    await cp(path.join(root, '.next/static'), path.join(runtime, '.next/static'), { recursive: true });
    await listen(upstream);
    const upstreamOrigin = `http://127.0.0.1:${upstream.address().port}`;
    // Reserve an ephemeral port, then fail safely if another process wins the bind race.
    const reservation = createServer();
    await listen(reservation);
    const port = reservation.address().port;
    await new Promise((resolve) => reservation.close(resolve));
    webOrigin = `http://127.0.0.1:${port}`;
    server = spawn(process.execPath, ['server.js'], { cwd: runtime, env: {
      ...process.env, NODE_ENV: 'production', HOSTNAME: '127.0.0.1', PORT: String(port),
      KIRA_TUTORIAL_API_URL: upstreamOrigin, NEXT_TELEMETRY_DISABLED: '1',
    }, stdio: ['ignore', 'pipe', 'pipe'] });
    server.once('exit', (code, signal) => { serverExit = `${code}/${signal}`; });
    server.once('error', (error) => { serverExit = error.message; });
    const capture = (chunk) => { serverLogs += chunk.toString(); };
    server.stdout.on('data', capture);
    server.stderr.on('data', capture);
    await until('standalone startup', async () => assert.equal((await page('/robots.txt')).status, 200));

    for (const failure of ['network', 'http', 'json', 'schema', 'collection404']) {
      mode = failure === 'collection404' ? 'http' : failure;
      if (failure === 'collection404') for (const endpoint of [api.full, api.featured, api.categories]) overrides.set(endpoint, 'not-found');
      const start = serverLogs.length;
      const result = await views();
      for (const name of ['home', 'library', 'detail']) {
        assert.equal(result[name].status, 200);
        assert.ok(result[name].text.includes(unavailable[name]));
        assert.ok(result[name].text.includes('<main id="main-content">'), 'General site shell remains available');
      }
      assert.equal(result.sitemap.status, 200);
      assert.deepEqual(sitemapRoutes(result.sitemap.text), [...staticRoutes].sort());
      assert.equal((await cacheSnapshot()).size, 0, 'Cold failures, including collection404, must not seed cache');
      assert.ok(serverLogs.slice(start).includes(`Tutorial API unavailable (${mode})`));
      assert.ok(!serverLogs.includes(bodyMarker), 'Cold failure logged response content');
      overrides.clear();
    }
    console.log('PASS cold network/503/JSON/schema/collection404: explicit fallback, no poisoned cache or raw-body logs.');

    mode = 'ok';
    const warm = await views(true); // Same failed keys recover immediately, without any TTL wait.
    assertAvailable(warm, 'A');
    assertDetail(warm.archive, 'CACHE ARCHIVE A', 'archive-guide');
    const { positive, familyKeys } = await until('all five warmed fixture families before the cold missing detail', async () => {
      const snapshot = await cacheSnapshot();
      return { positive: snapshot, familyKeys: warmCacheFamilies(snapshot) };
    });
    const coldMissingStart = upstreamRequests.length;
    assertNotFound(await page('/tutorials/cold-missing/'));
    let lastColdDiagnostic;
    const initial = await until('only attributable cold negatives added; every warmed positive unchanged', async () => {
      const snapshot = await cacheSnapshot();
      const requests = upstreamRequests.slice(coldMissingStart);
      const added = [...snapshot].filter(([cacheKey]) => !positive.has(cacheKey));
      const diagnostic = `${cacheDiagnostic(snapshot, familyKeys)}; upstream=${JSON.stringify({ total: requests.length,
        entries: requests.slice(0, 12).map((request) => ({ ...request, url: String(request.url).slice(0, 200) })) })}`;
      if (diagnostic !== lastColdDiagnostic) console.log(`CACHE cold-negative attribution (bounded): ${diagnostic}`);
      lastColdDiagnostic = diagnostic;
      assert.ok(requests.length > 0 && requests.every((request) => request.url === '/api/v1/tutorials/cold-missing'
        && request.mode === 'ok' && request.completed && request.status === 404),
        `Only completed exact-endpoint404s may occur in the isolated cold interval; actual: ${diagnostic}`);
      for (const [cacheKey, value] of positive) {
        assert.deepEqual(snapshot.get(cacheKey), value, `Cold detail404 must preserve each positive; actual: ${diagnostic}`);
      }
      assert.ok(added.length > 0 && added.length <= requests.length,
        `Cold negative additions must be bounded by completed exact-endpoint404s; actual: ${diagnostic}`);
      for (const [, value] of added) assert.deepEqual(value, { status: 'not-found' }, `Unexpected cold addition; actual: ${diagnostic}`);
      assert.equal(snapshot.size, positive.size + added.length, `Cold detail404 must not remove keys; actual: ${diagnostic}`);
      return snapshot;
    });
    const coldNegatives = new Map([...initial].filter(([cacheKey]) => !positive.has(cacheKey)));
    console.log('PASS immediate cold recovery, distinct full/featured/category fixtures, and authoritative cold detail404.');
    console.log(`PASS cold detail404 HTTP/noindex: ${coldNegatives.size} attributable negative keys; all ${positive.size} positive keys unchanged.`);

    console.log('Waiting one real 61s expiry shared by all four failed refresh modes.');
    await delay(61_000, undefined, { signal: abort.signal });
    for (const failure of ['network', 'http', 'json', 'schema']) {
      mode = failure;
      const start = upstreamRequests.length;
      const logStart = serverLogs.length;
      assertAvailable(await views(true), 'A');
      await failedRefreshes(start, logStart, failure, familyKeys);
      assert.deepEqual(await cacheSnapshot(), initial, 'Failed refresh must not replace any accepted entry');
      // Not just the first stale response: request again after the failed callback completed.
      const laterStart = upstreamRequests.length;
      const laterLogStart = serverLogs.length;
      const later = await views(true);
      assertAvailable(later, 'A');
      assertDetail(later.archive, 'CACHE ARCHIVE A', 'archive-guide');
      await failedRefreshes(laterStart, laterLogStart, failure, familyKeys);
      assert.deepEqual(await cacheSnapshot(), initial);
      console.log(`PASS warm ${failure}: completed failed refreshes, unchanged persisted cache, later A HTML/metadata/sitemap.`);
    }

    mode = 'ok';
    revision = 'B';
    overrides.set(api.archive, 'not-found');
    await views(true); // First stale response is permitted to show A.
    let lastRecoveryDiagnostic;
    const acceptedB = await until('B replacements and authoritative archive404 at every original family key', async () => {
      const snapshot = await cacheSnapshot();
      const diagnostic = cacheDiagnostic(snapshot, familyKeys);
      if (diagnostic !== lastRecoveryDiagnostic) console.log(`CACHE same-key B replacement (bounded): ${diagnostic}`);
      lastRecoveryDiagnostic = diagnostic;
      assert.deepEqual([...snapshot.keys()], [...initial.keys()], 'Recovery must not be a new cache-key miss');
      for (const detailKey of familyKeys.detail) {
        assert.equal(snapshot.get(detailKey).data.title.en, 'CACHE DETAIL B');
        assert.equal(snapshot.get(detailKey).data.revision, 2);
      }
      for (const featuredKey of familyKeys.featured) assert.equal(snapshot.get(featuredKey).data[0].title.en, 'CACHE FEATURED B');
      for (const categoryKey of familyKeys.categories) assert.equal(snapshot.get(categoryKey).data[0].label.en, 'CACHE CATEGORY B');
      for (const fullKey of familyKeys.full) assert.ok(snapshot.get(fullKey).data.some((item) => item.slug === 'catalog-b'));
      for (const archiveKey of familyKeys.archive) assert.deepEqual(snapshot.get(archiveKey), { status: 'not-found' });
      for (const [cacheKey, value] of coldNegatives) assert.deepEqual(snapshot.get(cacheKey), value);
      return snapshot;
    });
    const recovered = await views(true);
    assertAvailable(recovered, 'B');
    assert.ok(!sitemapRoutes(recovered.sitemap.text).includes('/tutorials/catalog-a'));
    assertNotFound(recovered.archive);
    console.log('PASS same-key A→B detail/metadata and catalog/home recovery; completed A→404 archive replacement.');

    // Successful replacements refresh their TTL. One second shared interval is
    // necessary to prove B→empty and an expired negative entry surviving an outage.
    console.log('Waiting one real 61s expiry for successful-empty and stale-negative controls.');
    await delay(61_000, undefined, { signal: abort.signal });
    overrides.set(api.full, 'empty');
    overrides.set(api.featured, 'empty');
    overrides.set(api.detail, 'not-found');
    overrides.set(api.archive, 'http');
    const negativeStart = upstreamRequests.length;
    const negativeLogStart = serverLogs.length;
    await views(true);
    await failedRefreshes(negativeStart, negativeLogStart, 'http', familyKeys, ['archive']);
    let lastEmptyDiagnostic;
    await until('successful empties and B→404 overwrite old positive values', async () => {
      const snapshot = await cacheSnapshot();
      const diagnostic = cacheDiagnostic(snapshot, familyKeys);
      if (diagnostic !== lastEmptyDiagnostic) console.log(`CACHE same-key empty/negative replacement (bounded): ${diagnostic}`);
      lastEmptyDiagnostic = diagnostic;
      assert.deepEqual([...snapshot.keys()], [...initial.keys()], 'Empty/negative replacement must preserve the whole key set');
      for (const fullKey of familyKeys.full) assert.deepEqual(snapshot.get(fullKey), { status: 'ok', data: [] });
      for (const featuredKey of familyKeys.featured) assert.deepEqual(snapshot.get(featuredKey), { status: 'ok', data: [] });
      for (const detailKey of familyKeys.detail) assert.deepEqual(snapshot.get(detailKey), { status: 'not-found' });
      for (const archiveKey of familyKeys.archive) assert.deepEqual(snapshot.get(archiveKey), { status: 'not-found' });
      for (const [cacheKey, value] of coldNegatives) assert.deepEqual(snapshot.get(cacheKey), value);
      for (const categoryKey of familyKeys.categories) assert.deepEqual(snapshot.get(categoryKey), acceptedB.get(categoryKey));
    });
    const empty = await views(true);
    assert.equal(empty.library.status, 200);
    assert.ok(empty.library.text.includes('No guide matches that search.'));
    assert.ok(!empty.library.text.includes(unavailable.library), 'Valid empty is not an unavailable response');
    assert.deepEqual(sitemapRoutes(empty.sitemap.text), [...staticRoutes].sort());
    assert.ok(!preview(empty.home.text).includes('CACHE FEATURED'));
    assertNotFound(empty.detail);
    assertNotFound(empty.archive);
    assert.ok(!serverLogs.includes(bodyMarker));
    console.log('PASS successful empty replacement, B→404, and expired cached404 retained through later 503 (no resurrection).');
    console.log(`PASS production tutorial cache regression: one build reused; ${upstreamRequests.length} fixture requests.`);
  } catch (error) {
    console.error('Standalone output (last 6000 characters):\n', serverLogs.slice(-6000));
    throw error;
  } finally {
    clearTimeout(deadline);
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
    try {
      if (server?.pid && server.exitCode === null && server.signalCode === null) {
        const exited = once(server, 'exit');
        server.kill('SIGTERM');
        await Promise.race([exited, delay(2000)]);
        if (server.exitCode === null && server.signalCode === null) {
          server.kill('SIGKILL');
          await Promise.race([exited, delay(2000)]);
        }
      }
    } finally {
      const exitUnobserved = server?.pid && server.exitCode === null && server.signalCode === null;
      if (exitUnobserved) {
        process.exitCode = 1;
        console.error(`CLEANUP FAILED: standalone exit unobserved; PID=${server.pid}; retained runtime=${runtime}`);
        // Do not let an unresponsive child/its pipes keep this failed harness alive.
        // Retain its runtime for inspection rather than deleting files under a live PID.
        server.stdout.destroy();
        server.stderr.destroy();
        server.unref();
      }
      upstream.closeAllConnections();
      await new Promise((resolve) => upstream.close(resolve));
      if (exitUnobserved) {
        console.error('CLEANUP fixture stopped; standalone cleanup remains incomplete.');
      } else {
        await rm(runtime, { recursive: true, force: true });
        console.log('CLEANUP owned standalone/fixture stopped; isolated runtime/cache removed.');
      }
    }
  }
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
}
