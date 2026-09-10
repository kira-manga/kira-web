import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { chmod, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, deflateSync, gzipSync } from 'node:zlib';

const self = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(self), '..');
const revision = 'a'.repeat(40);
const fingerprint = Array(32).fill('AB').join(':');
const fixtureEnv = {
  ...process.env, KIRA_WEB_PRODUCTION: 'false', KIRA_WEB_SOURCE_REVISION: revision,
  ANDROID_APP_SHA256_CERT_FINGERPRINT: fingerprint,
  ANDROID_PACKAGE_NAME: '', APPLE_TEAM_ID: '', IOS_BUNDLE_ID: '',
};
delete fixtureEnv.NODE_OPTIONS;
delete fixtureEnv.NODE_TLS_REJECT_UNAUTHORIZED;
let currentTest = 'bootstrap';

async function bounded(promise, milliseconds) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('fixture deadline')), milliseconds);
    })]);
  } finally { clearTimeout(timer); }
}

async function runChild(args, env) {
  const child = spawn(process.execPath, args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '', bytes = 0, expired = false;
  const timer = setTimeout(() => { expired = true; child.kill('SIGKILL'); }, 45_000);
  child.stdout.on('data', (chunk) => {
    bytes += chunk.length;
    if (bytes > 64 * 1024) { expired = true; child.kill('SIGKILL'); } else output += chunk;
  });
  child.stderr.on('data', (chunk) => {
    // Do not forward unexpected native errors/certificate details from the owned child.
    bytes += chunk.length;
    if (bytes > 64 * 1024) { expired = true; child.kill('SIGKILL'); }
  });
  try {
    const code = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', resolve); // Join before certificate/scratch removal, including on timeout.
    });
    process.stdout.write(output);
    assert.equal(expired, false);
    assert.equal(code, 0);
  } finally { clearTimeout(timer); }
}

async function parent() {
  // Pure build-input checks: no build/materialization or network access.
  currentTest = 'production source revision validation';
  for (const value of ['', 'development', 'a'.repeat(39), 'A'.repeat(40), 'z'.repeat(40), revision]) {
    const result = spawnSync(process.execPath, ['scripts/validate-build-env.mjs'], {
      cwd: root, env: { ...fixtureEnv, KIRA_WEB_PRODUCTION: 'true', KIRA_WEB_SOURCE_REVISION: value },
      timeout: 3000, maxBuffer: 16 * 1024,
    });
    assert.equal(result.status, value === revision ? 0 : 1);
  }
  // CLI refuses the obsolete origin argument before it can make any request.
  const cli = spawnSync(process.execPath, ['scripts/verify-deployment.mjs', 'https://not-a-target.invalid'], {
    cwd: root, env: fixtureEnv, timeout: 3000, maxBuffer: 16 * 1024,
  });
  assert.equal(cli.status, 1);
  assert.deepEqual(JSON.parse(cli.stdout), { status: 0, revision: 'invalid', path: '(configuration)', kind: 'configuration' });

  currentTest = 'disposable CA and owned fixture child';
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'kira-web-public-verifier-'));
  const mask = process.umask(0o077);
  try {
    const openssl = (args) => {
      const result = spawnSync('openssl', args, { cwd: scratch, timeout: 10_000, maxBuffer: 64 * 1024 });
      assert.equal(result.status, 0); // Never print key/certificate output.
    };
    openssl(['req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:P-256', '-nodes',
      '-keyout', 'ca.key', '-out', 'ca.pem', '-days', '1', '-subj', '/CN=Kira verifier fixture CA',
      '-addext', 'basicConstraints=critical,CA:TRUE']);
    openssl(['req', '-new', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:P-256', '-nodes',
      '-keyout', 'server.key', '-out', 'server.csr', '-subj', '/CN=kiramanga.me']);
    await writeFile(path.join(scratch, 'extensions'),
      'subjectAltName=DNS:kiramanga.me,DNS:api.kiramanga.me\nextendedKeyUsage=serverAuth\nbasicConstraints=CA:FALSE\n', { mode: 0o600 });
    openssl(['x509', '-req', '-in', 'server.csr', '-CA', 'ca.pem', '-CAkey', 'ca.key', '-CAcreateserial',
      '-out', 'server.pem', '-days', '1', '-extfile', 'extensions']);
    for (const file of await readdir(scratch)) await chmod(path.join(scratch, file), 0o600);
    await runChild([self, '--fixture', scratch], { ...fixtureEnv, NODE_EXTRA_CA_CERTS: path.join(scratch, 'ca.pem') });
  } finally {
    process.umask(mask);
    await rm(scratch, { recursive: true, force: true });
  }
  console.log('PASS: owned child joined; fixture certificates and scratch removed.');
}

async function fixture(scratch) {
  const { verifyDeployment, publicLimits, categoriesReady, tutorialsReady, androidAssociationReady, appleAssociationReady } = await import('./verify-deployment.mjs');
  const { identifiers, production } = await import('./association-config.mjs');
  assert.equal(production, false); // Standalone verification still forces production validation.
  assert.equal(identifiers.__ANDROID_PACKAGE_NAME__, 'me.manga.kira');
  assert.equal(identifiers.__APPLE_TEAM_ID__, '7CGZ2343AA');
  const localized = { en: 'Fixture', ar: 'تجربة' };
  const category = { id: 'opaque', slug: ' ', label: localized, iconCode: 'book', position: 0, revision: 1 };
  const asset = { id: 'opaque', url: '/media/not-fetched', sha256: 'opaque', contentType: 'image/png', width: 0, height: 1 };
  const media = { default: asset, alt: localized, variants: { enLight: null, arDark: asset } };
  const tutorial = {
    id: 'opaque', slug: 'sample', category, title: localized, summary: localized, introduction: localized,
    duration: localized, level: localized, cover: media,
    steps: [{ id: 'step', title: localized, body: localized, tip: null, media }],
    position: 0, revision: 1, featuredPosition: null,
  };
  const android = [{ relation: ['delegate_permission/common.handle_all_urls'], target: {
    namespace: 'android_app', package_name: 'me.manga.kira', sha256_cert_fingerprints: [fingerprint.toLowerCase()],
  } }];
  const apple = { applinks: { apps: [], details: [{ appID: '7CGZ2343AA.me.manga.kira', components: [
    { '/': '/activate', comment: 'Comments and component/key order are not policy.' }, { '/': '/activate/*' },
  ] }] } };
  currentTest = 'read-only predicates and exact association semantics';
  assert.equal(categoriesReady([]), true);
  assert.equal(tutorialsReady([]), true);
  assert.equal(categoriesReady([category]), true);
  assert.equal(tutorialsReady([tutorial]), true);
  const optional = structuredClone(tutorial);
  optional.cover.variants = {};
  delete optional.steps[0].tip;
  delete optional.steps[0].media;
  delete optional.featuredPosition;
  optional.revision = 2 ** 54; // Match Number.isInteger consumer behavior, not a new safe-integer policy.
  assert.equal(tutorialsReady([optional]), true);
  for (const mutate of [
    (v) => { v.title.ar = ''; }, (v) => { v.steps = []; }, (v) => { v.steps[0].tip = {}; },
    (v) => { v.steps[0].body.en = ''; }, (v) => { v.steps[0].media.default.sha256 = ''; },
    (v) => { delete v.cover.variants; }, (v) => { v.cover.variants.enDark = {}; },
    (v) => { v.cover.default.contentType = 'image/webp'; }, (v) => { v.cover.default.width = 0.5; },
    (v) => { v.cover.alt.ar = ''; }, (v) => { v.category.iconCode = 'other'; },
    (v) => { v.category.revision = -1; }, (v) => { v.featuredPosition = -1; },
  ]) {
    const invalid = structuredClone(tutorial);
    mutate(invalid);
    assert.equal(tutorialsReady([tutorial, invalid]), false); // Validate every entry, including nested data.
  }
  assert.equal(categoriesReady([category, { ...category, position: '0' }]), false);
  assert.equal(androidAssociationReady(android), true);
  assert.equal(appleAssociationReady(apple), true);
  for (const mutate of [
    (v) => { v[0].relation = ['other']; }, (v) => { v[0].relation.push('other'); },
    (v) => { v[0].target.namespace = 'web'; }, (v) => { v[0].target.package_name = 'other.app'; },
    (v) => { v[0].target.sha256_cert_fingerprints = [Array(32).fill('CD').join(':')]; },
    (v) => { v[0].target.sha256_cert_fingerprints.push(fingerprint); }, (v) => { v.push(v[0]); },
  ]) {
    const invalid = structuredClone(android); mutate(invalid); assert.equal(androidAssociationReady(invalid), false);
  }
  for (const mutate of [
    (v) => { v.applinks.apps = ['unexpected']; }, (v) => { v.applinks.details[0].appID = 'OTHER.app'; },
    (v) => { v.applinks.details.push(v.applinks.details[0]); },
    (v) => { v.applinks.details[0].components.pop(); },
    (v) => { v.applinks.details[0].components[0]['/'] = '/*'; },
    (v) => { v.applinks.details[0].components[0].exclude = true; },
    (v) => { v.applinks.details[0].components[0]['?'] = { code: '*' }; },
    (v) => { v.applinks.details[0].components[0]['#'] = 'only'; },
  ]) {
    const invalid = structuredClone(apple); mutate(invalid); assert.equal(appleAssociationReady(invalid), false);
  }
  identifiers.__ANDROID_SHA256_CERT_FINGERPRINT__ = 'placeholder';
  let requests = 0;
  const invalidConfig = await verifyDeployment({ request: () => { requests++; throw new Error('must not request'); } });
  identifiers.__ANDROID_SHA256_CERT_FINGERPRINT__ = fingerprint;
  assert.equal(requests, 0);
  assert.equal(invalidConfig.receipts.at(-1).kind, 'configuration');
  console.log('PASS: consumer-shape predicates, effective defaults and forced association validation.');

  const page = (pathname, available = 'available') => '<!doctype html><html><head>'
    + `<link rel="canonical" href="https://kiramanga.me${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}" />`
    + `</head><body><div${pathname === '/tutorials/' ? ` data-kira-tutorials="${available}"` : ''}>Fixture</div></body></html>`;
  const defaults = (url) => {
    if (url.protocol === 'http:') return { status: 308, headers: { Location: 'https://kiramanga.me/' }, body: '', open: true };
    const json = url.pathname === '/kira-release.json' ? { sourceRevision: revision }
      : url.pathname === '/.well-known/assetlinks.json' ? android
        : url.pathname === '/.well-known/apple-app-site-association' ? apple
          : url.pathname === '/whatsnew/35/whatsnew.json' ? { features: ['fixture'] }
            : url.pathname === '/api/v1/tutorial-categories' ? [category]
              : url.pathname === '/api/v1/tutorials' ? [tutorial] : undefined;
    return {
      status: 200, headers: { 'Content-Type': json === undefined ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8' },
      body: json === undefined ? page(url.pathname) : JSON.stringify(json),
    };
  };
  const sockets = new Set(), timers = new Set();
  let records = [], scenario = {}, cases = 0;
  const schedule = (response, callback, milliseconds, repeat = false) => {
    const timer = (repeat ? setInterval : setTimeout)(() => {
      if (!repeat) timers.delete(timer);
      callback();
    }, milliseconds);
    timers.add(timer);
    response.once('close', () => { clearTimeout(timer); clearInterval(timer); timers.delete(timer); });
  };
  const handler = (request, response) => {
    const url = new URL(request.url, `${request.socket.encrypted ? 'https' : 'http'}://${request.headers.host}`);
    const plan = defaults(url);
    scenario.modify?.(plan, url);
    const record = { url, headers: request.headers, method: request.method, cancelled: false, drips: 0, bytes: 0 };
    record.closed = new Promise((resolve) => response.once('close', () => {
      record.cancelled = !response.writableEnded;
      resolve();
    }));
    records.push(record);
    if (plan.stall) return;
    const send = () => {
      let body = Buffer.from(plan.body);
      record.bytes = url.protocol === 'http:' || plan.status !== 200 ? 0 : body.length;
      if (plan.encoding) {
        body = { gzip: gzipSync, deflate: deflateSync, br: brotliCompressSync }[plan.encoding](body);
        plan.headers['Content-Encoding'] = plan.encoding;
        plan.headers['Content-Length'] = String(body.length);
      }
      response.writeHead(plan.status, plan.headers);
      response.write(body);
      if (plan.drip) schedule(response, () => { record.drips++; response.write(' '); }, 10, true);
      else if (!plan.open) response.end();
    };
    if (plan.delay) schedule(response, send, plan.delay); else send();
  };
  const secure = https.createServer({ key: await readFile(path.join(scratch, 'server.key')), cert: await readFile(path.join(scratch, 'server.pem')) }, handler);
  const insecure = http.createServer(handler);
  for (const server of [secure, insecure]) {
    server.on('connection', (socket) => { sockets.add(socket); socket.once('close', () => sockets.delete(socket)); });
    server.on('tlsClientError', () => {}); // Expected trust/hostname refusals, never print certificates.
  }
  const listen = (server) => new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const request = (url, options, callback) => {
    assert.ok(['https://kiramanga.me', 'https://api.kiramanga.me', 'http://kiramanga.me'].includes(url.origin));
    const tls = url.protocol === 'https:';
    return (tls ? https : http).request({
      ...options, hostname: '127.0.0.1', port: (tls ? secure : insecure).address().port,
      path: `${url.pathname}${url.search}`, headers: { ...options.headers, Host: url.host },
      servername: scenario.badHostname ? 'wrong.invalid' : url.hostname,
      ...(scenario.untrusted ? { ca: [] } : {}),
    }, callback);
  };
  const check = async (name, options = {}, kind = 'ok', failedPath) => {
    currentTest = name;
    scenario = options;
    records = [];
    const start = performance.now();
    const result = await verifyDeployment({ request, limits: { ...publicLimits, requestMs: 1000, runMs: 5000, ...options.limits } });
    assert.equal(result.ok, kind === 'ok');
    assert.equal(result.receipts.at(-1).kind, kind);
    if (failedPath) assert.equal(result.receipts.at(-1).path, failedPath);
    if (kind === 'ok') assert.equal(result.receipts.length, 16);
    for (const receipt of result.receipts) {
      assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'path', 'revision', 'status']);
      assert.equal(receipt.revision, revision);
      assert.equal(JSON.stringify(receipt).includes('DO_NOT_LOG_FIXTURE_BODY'), false);
    }
    await bounded(Promise.all(records.map((record) => record.closed)), 500);
    await bounded(Promise.all([...sockets].map((socket) => new Promise((resolve) => socket.once('close', resolve)))), 500);
    assert.equal(timers.size, 0);
    if (options.cancel) assert.ok(records.some((record) => record.url.pathname === options.cancel && record.cancelled));
    if (options.progress) assert.ok(records.some((record) => record.drips >= 2));
    if (options.limits?.requestMs || options.limits?.runMs) assert.ok(performance.now() - start < 2000);
    cases++;
    console.log(`PASS: ${name}`);
    return records;
  };
  const at = (pathname, change) => ({ modify: (plan, url) => { if (url.pathname === pathname) change(plan, url); } });
  const jsonAt = (pathname, value) => at(pathname, (plan) => { plan.body = JSON.stringify(value); });
  try {
    await listen(secure); await listen(insecure);
    const healthy = await check('healthy exact release, routes, associations and nonempty APIs');
    const fresh = healthy.filter((record) => ['/kira-release.json', '/api/v1/tutorials', '/api/v1/tutorial-categories'].includes(record.url.pathname));
    assert.equal(fresh.length, 3);
    const nonce = fresh[0].url.searchParams.get('kira_verify');
    assert.match(nonce, /^[0-9a-f]{32}$/);
    for (const record of fresh) {
      assert.equal(record.method, 'GET');
      assert.equal(record.url.searchParams.get('kira_verify'), nonce);
      assert.equal(record.headers['cache-control'], 'no-cache, no-store, max-age=0');
      assert.equal(record.headers.pragma, 'no-cache');
      assert.equal(record.headers['if-none-match'], undefined);
      assert.equal(record.headers['if-modified-since'], undefined);
    }
    const empty = await check('empty arrays remain ready and per-run nonce changes', { modify: (plan, url) => {
      if (url.hostname === 'api.kiramanga.me') plan.body = '[]';
    } });
    assert.notEqual(empty[0].url.searchParams.get('kira_verify'), nonce);
    await check('independently fetched catalog counts need not agree', jsonAt('/api/v1/tutorial-categories', []));
    for (const [name, options, kind, pathname] of [
      ['wrong source SHA', jsonAt('/kira-release.json', { sourceRevision: 'b'.repeat(40) }), 'revision', '/kira-release.json'],
      ['missing source SHA', jsonAt('/kira-release.json', {}), 'revision', '/kira-release.json'],
      ['missing route', at('/guide/', (p) => { p.status = 404; }), 'status', '/guide/'],
      ['homepage fallback cannot impersonate another route', at('/privacy/', (p) => { p.body = page('/'); }), 'route', '/privacy/'],
      ['deceptive HTML media type', at('/', (p) => { p.headers['Content-Type'] = 'text/html-not-really'; }), 'content-type', '/'],
      ['unavailable SSR despite healthy API fixtures', at('/tutorials/', (p) => { p.body = page('/tutorials/', 'unavailable'); }), 'tutorial-ssr', '/tutorials/'],
      ['script or comment does not provide SSR readiness', at('/tutorials/', (p) => {
        p.body = page('/tutorials/').replace(' data-kira-tutorials="available"', '')
          + '<script>"<div data-kira-tutorials=\"available\">"</script><!-- <div data-kira-tutorials="available"> -->';
      }), 'tutorial-ssr', '/tutorials/'],
      ['empty What\'s New remains invalid', jsonAt('/whatsnew/35/whatsnew.json', { features: [] }), 'schema', '/whatsnew/35/whatsnew.json'],
      ['wrong valid-looking fingerprint', jsonAt('/.well-known/assetlinks.json', [{ ...android[0], target: {
        ...android[0].target, sha256_cert_fingerprints: [Array(32).fill('CD').join(':')],
      } }]), 'association', '/.well-known/assetlinks.json'],
      ['wrong Apple activation policy', jsonAt('/.well-known/apple-app-site-association', { applinks: { apps: [], details: [{
        appID: '7CGZ2343AA.me.manga.kira', components: [{ '/': '/*' }, { '/': '/activate' }],
      }] } }), 'association', '/.well-known/apple-app-site-association'],
      ['stale-good SSR cannot hide live API outage', at('/api/v1/tutorials', (p) => { p.status = 503; p.body = 'DO_NOT_LOG_FIXTURE_BODY'; }), 'status', '/api/v1/tutorials'],
      ['stale-good SSR cannot hide malformed JSON', at('/api/v1/tutorials', (p) => { p.body = 'DO_NOT_LOG_FIXTURE_BODY'; }), 'json', '/api/v1/tutorials'],
      ['stale-good SSR cannot hide malformed nested second entry', jsonAt('/api/v1/tutorials', [tutorial, { ...tutorial, cover: { ...media, variants: { enDark: {} } } }]), 'schema', '/api/v1/tutorials'],
      ['malformed second category', jsonAt('/api/v1/tutorial-categories', [category, { ...category, label: { en: 'only' } }]), 'schema', '/api/v1/tutorial-categories'],
      ['deceptive JSON media type', at('/api/v1/tutorials', (p) => { p.headers['Content-Type'] = 'text/application/json'; }), 'content-type', '/api/v1/tutorials'],
    ]) await check(name, options, kind, pathname);

    for (const pathname of ['/.well-known/assetlinks.json', '/.well-known/apple-app-site-association', '/api/v1/tutorials', '/api/v1/tutorial-categories']) {
      await check(`direct-only ${pathname}`, { ...at(pathname, (p) => {
        p.status = 307; p.headers.Location = pathname; p.open = true;
      }), cancel: pathname }, 'redirect', pathname);
    }
    await check('same-route HTTPS slash redirect cancels unused body', { ...at('/privacy/', (p) => {
      p.status = 308; p.headers.Location = '/privacy'; p.open = true;
    }), cancel: '/privacy/' });
    for (const target of ['https://other.invalid/privacy/', 'http://kiramanga.me/privacy/', 'https://user@kiramanga.me/privacy/',
      'https://kiramanga.me:444/privacy/', '/api/admin/anything', '/privacy/?unexpected=1']) {
      await check('reject noncanonical redirect target', at('/privacy/', (p) => { p.status = 302; p.headers.Location = target; }), 'redirect', '/privacy/');
    }
    await check('redirect loop bound', at('/privacy/', (p) => { p.status = 302; p.headers.Location = '/privacy/'; }), 'redirect-limit', '/privacy/');
    for (const target of ['https://other.invalid/', 'https://kiramanga.me/guide/', 'https://user@kiramanga.me/', 'https://kiramanga.me/?x=1', 'http://kiramanga.me/']) {
      await check('HTTP must upgrade to the exact HTTPS origin root', { modify: (p, url) => {
        if (url.protocol === 'http:') p.headers.Location = target;
      }, cancel: '/' }, 'http-upgrade', '/');
    }
    await check('TLS hostname mismatch', { badHostname: true }, 'tls', '/kira-release.json');
    await check('untrusted TLS chain', { untrusted: true }, 'tls', '/kira-release.json');
    for (const headers of [{ Age: '1' }, { Age: 'unknown' }, { Warning: '110 cache "Response is stale"' },
      { Warning: '111 cache "Revalidation failed"' }, { 'Cache-Status': 'edge; hit; ttl=-1' }, { 'CF-Cache-Status': 'STALE' }]) {
      await check('reject explicit stale API evidence', at('/api/v1/tutorials', (p) => { Object.assign(p.headers, headers); }), 'stale', '/api/v1/tutorials');
    }
    await check('stale source marker refused', at('/kira-release.json', (p) => { p.headers.Age = '60'; }), 'stale', '/kira-release.json');
    await check('fresh response may advertise backend stale-if-error policy', at('/api/v1/tutorials', (p) => {
      p.headers.Age = '0'; p.headers['Cache-Control'] = 'public, max-age=60, stale-if-error=86400';
    }));

    const padded = (value, bytes) => value + ' '.repeat(bytes - Buffer.byteLength(value));
    await check('exact decoded marker cap', at('/kira-release.json', (p) => { p.body = padded(p.body, publicLimits.markerBytes); }));
    for (const encoding of [undefined, 'gzip', 'deflate', 'br']) {
      await check('decoded extra byte cancels before fixture teardown', { ...at('/kira-release.json', (p) => {
        p.body = padded(p.body, publicLimits.markerBytes + 1); p.open = true; p.encoding = encoding;
        // Chunked identity; compressed Content-Length must not replace the decoded count.
      }), cancel: '/kira-release.json' }, 'body-limit', '/kira-release.json');
      if (encoding) await check(`valid ${encoding} response`, at('/kira-release.json', (p) => { p.encoding = encoding; }));
    }
    await check('AASA exact 128 KiB decoded ceiling', at('/.well-known/apple-app-site-association', (p) => { p.body = padded(p.body, publicLimits.associationBytes); }));
    await check('AASA extra byte refused', at('/.well-known/apple-app-site-association', (p) => { p.body = padded(p.body, publicLimits.associationBytes + 1); }), 'body-limit');
    await check('JSON exact 2 MiB decoded ceiling', at('/api/v1/tutorials', (p) => { p.body = padded(p.body, publicLimits.jsonBytes); }));
    await check('HTML exact 4 MiB decoded ceiling', at('/privacy/', (p) => { p.body = padded(p.body, publicLimits.htmlBytes); }));
    const aggregate = healthy.reduce((total, record) => total + record.bytes, 0);
    await check('exact aggregate decoded cap', { limits: { runBytes: aggregate } });
    await check('aggregate extra byte refused', { limits: { runBytes: aggregate - 1 } }, 'run-bytes');
    await check('oversized headers refused', { ...at('/kira-release.json', (p) => {
      p.headers['X-Oversized'] = 'x'.repeat(publicLimits.headerBytes); p.open = true;
    }), cancel: '/kira-release.json' }, 'headers-limit');
    await check('headers deadline and peer cancellation', { ...at('/kira-release.json', (p) => { p.stall = true; }),
      limits: { requestMs: 120 }, cancel: '/kira-release.json' }, 'request-timeout');
    await check('progressing body cannot reset whole-operation deadline', { ...at('/', (p) => { p.drip = true; }),
      limits: { requestMs: 120 }, cancel: '/', progress: true }, 'request-timeout');
    await check('redirects share one operation deadline', { modify: (p, url) => {
      if (url.pathname === '/privacy/' || url.pathname === '/privacy') {
        p.delay = 80;
        if (url.pathname === '/privacy/') { p.status = 308; p.headers.Location = '/privacy'; }
      }
    }, limits: { requestMs: 120 }, cancel: '/privacy' }, 'request-timeout');
    await check('entire run deadline', { modify: (p) => { p.delay = 45; }, limits: { requestMs: 500, runMs: 130 } }, 'run-timeout');
    assert.equal(sockets.size, 0);
    console.log(`PASS: ${cases} native TLS cases; all peer sockets and writer timers closed before teardown.`);
  } finally {
    for (const timer of timers) { clearTimeout(timer); clearInterval(timer); }
    timers.clear();
    for (const socket of sockets) socket.destroy();
    await bounded(Promise.all([secure, insecure].map((server) => new Promise((resolve) => server.close(resolve)))), 1000);
  }
}

try {
  if (process.argv[2] === '--fixture') await fixture(process.argv[3]); else await parent();
} catch {
  console.log(`FAIL: ${currentTest} (fixture assertion/setup; no raw response or TLS error logged)`);
  process.exitCode = 1;
}
