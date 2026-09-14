import http from 'node:http';
import https from 'node:https';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createBrotliDecompress, createGunzip, createInflate } from 'node:zlib';

import { identifiers, sourceRevision, validateProductionIdentifiers, validateSourceRevision } from './association-config.mjs';

const site = 'https://kiramanga.me';
const api = 'https://api.kiramanga.me';
const pages = ['/', '/tutorials/', '/activate/', '/guide/', '/privacy/', '/terms/', '/support/', '/takedown/', '/data-deletion/'];
const redirects = [301, 302, 303, 307, 308];
export const publicLimits = Object.freeze({
  requestMs: 10_000, runMs: 60_000, headerBytes: 16_384, redirects: 2,
  htmlBytes: 4 * 1024 * 1024, jsonBytes: 2 * 1024 * 1024,
  associationBytes: 128 * 1024, markerBytes: 1024, runBytes: 32 * 1024 * 1024,
});

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const string = (value) => typeof value === 'string' && value.length > 0;
const integer = (value) => Number.isInteger(value) && value >= 0;
const localized = (value) => object(value) && string(value.en) && string(value.ar);
const optional = (value, validate) => value === null || value === undefined || validate(value);
const array = (value, validate) => Array.isArray(value) && value.every(validate);
const keys = (value, expected) => object(value) && Object.keys(value).length === expected.length
  && expected.every((key) => Object.hasOwn(value, key));

// Read-only consumer-shape predicates: keep aligned with src/lib/tutorial-api.ts.
// No URL mapping, seed/count requirements or cross-endpoint snapshot comparison.
const category = (value) => object(value) && string(value.id) && string(value.slug)
  && localized(value.label) && ['book', 'search', 'download', 'settings'].includes(value.iconCode)
  && integer(value.position) && integer(value.revision);
const asset = (value) => object(value) && string(value.id) && string(value.url) && string(value.sha256)
  && ['image/jpeg', 'image/png'].includes(value.contentType) && integer(value.width) && integer(value.height);
const media = (value) => object(value) && asset(value.default) && localized(value.alt)
  && object(value.variants) && ['enLight', 'enDark', 'arLight', 'arDark'].every((key) => optional(value.variants[key], asset));
const step = (value) => object(value) && string(value.id) && localized(value.title) && localized(value.body)
  && optional(value.tip, localized) && optional(value.media, media);
const tutorial = (value) => object(value) && string(value.id) && string(value.slug) && category(value.category)
  && ['title', 'summary', 'introduction', 'duration', 'level'].every((key) => localized(value[key]))
  && media(value.cover) && array(value.steps, step) && value.steps.length > 0
  && integer(value.position) && integer(value.revision) && optional(value.featuredPosition, integer);
export const categoriesReady = (value) => array(value, category);
export const tutorialsReady = (value) => array(value, tutorial);

export function androidAssociationReady(value) {
  if (!Array.isArray(value) || value.length !== 1) return false;
  const entry = value[0];
  if (!keys(entry, ['relation', 'target']) || !array(entry.relation, (item) => item === 'delegate_permission/common.handle_all_urls')
    || entry.relation.length !== 1 || !keys(entry.target, ['namespace', 'package_name', 'sha256_cert_fingerprints'])) return false;
  const target = entry.target;
  return target.namespace === 'android_app' && target.package_name === identifiers.__ANDROID_PACKAGE_NAME__
    && Array.isArray(target.sha256_cert_fingerprints) && target.sha256_cert_fingerprints.length === 1
    && typeof target.sha256_cert_fingerprints[0] === 'string'
    && target.sha256_cert_fingerprints[0].toUpperCase() === identifiers.__ANDROID_SHA256_CERT_FINGERPRINT__.toUpperCase();
}

export function appleAssociationReady(value) {
  if (!keys(value, ['applinks']) || !keys(value.applinks, ['apps', 'details'])
    || !Array.isArray(value.applinks.apps) || value.applinks.apps.length !== 0
    || !Array.isArray(value.applinks.details) || value.applinks.details.length !== 1) return false;
  const entry = value.applinks.details[0];
  return keys(entry, ['appID', 'components'])
    && entry.appID === `${identifiers.__APPLE_TEAM_ID__}.${identifiers.__IOS_BUNDLE_ID__}`
    && Array.isArray(entry.components) && entry.components.length === 2
    && ['/activate/*', '/activate'].every((match) => entry.components.some((component) => object(component)
      && component['/'] === match && Object.keys(component).every((key) => key === '/' || key === 'comment')));
}

class Failure extends Error {
  constructor(kind) { super(kind); this.kind = kind; }
}

function transportFailure(error) {
  if (error?.code === 'HPE_HEADER_OVERFLOW') return new Failure('headers-limit');
  if (/^(?:ERR_TLS_|CERT_|DEPTH_ZERO_|UNABLE_TO_|SELF_SIGNED_)/.test(error?.code ?? '')) return new Failure('tls');
  return new Failure('network'); // Never retain an upstream error, message, cause or certificate.
}

function assertFresh(headers) {
  const age = headers.age;
  if ((age !== undefined && (!/^\d+$/.test(age) || Number(age) !== 0))
    || /(?:^|,)\s*11[0-3]\s/.test(headers.warning ?? '')
    || /\bttl\s*=\s*-\d|\bfwd\s*=\s*"?stale\b/i.test(headers['cache-status'] ?? '')
    || /\b(?:stale|updating)\b/i.test(`${headers['x-cache'] ?? ''} ${headers['cf-cache-status'] ?? ''}`)) {
    throw new Failure('stale');
  }
}

const nativeRequest = (url, options, callback) => (url.protocol === 'https:' ? https : http).request(url, options, callback);

function assertTime(state, deadline) {
  if (performance.now() >= deadline) throw new Failure(deadline === state.deadline ? 'run-timeout' : 'request-timeout');
}

function readResponse(url, spec, state, deadline, request) {
  return new Promise((resolve, reject) => {
    let outgoing, incoming, decoder, timer, settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      // Destroy, never drain unused/error/oversize bodies or wait for peer cleanup.
      decoder?.destroy();
      incoming?.destroy();
      outgoing?.destroy();
      if (error) reject(error); else resolve(value);
    };
    try {
      assertTime(state, deadline);
      timer = setTimeout(() => finish(new Failure(deadline === state.deadline ? 'run-timeout' : 'request-timeout')),
        Math.max(1, deadline - performance.now()));
      outgoing = request(url, {
        method: 'GET', agent: false, rejectUnauthorized: true, maxHeaderSize: state.limits.headerBytes,
        headers: {
          Accept: spec.type ?? '*/*', 'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache, no-store, max-age=0', Pragma: 'no-cache',
          'User-Agent': 'kira-web-public-verifier',
        },
      }, (response) => {
        if (settled) { response.destroy(); return; }
        incoming = response;
        incoming.on('error', (error) => finish(transportFailure(error)));
        incoming.on('aborted', () => finish(new Failure('network')));
        try {
          assertTime(state, deadline);
          state.status = response.statusCode;
          const { headers } = response;
          for (const name of ['content-type', 'content-encoding', 'location', 'age']) {
            if (response.rawHeaders.filter((value, index) => index % 2 === 0 && value.toLowerCase() === name).length > 1) {
              throw new Failure('headers');
            }
          }
          if (spec.upgrade) {
            if (![301, 302, 307, 308].includes(response.statusCode)) throw new Failure('status');
            finish(null, { headers });
            return;
          }
          if (redirects.includes(response.statusCode)) {
            if (!spec.html) throw new Failure('redirect');
            finish(null, { headers, redirect: true });
            return;
          }
          if (response.statusCode !== 200) throw new Failure('status');
          if ((headers['content-type'] ?? '').split(';', 1)[0].trim().toLowerCase() !== spec.type) throw new Failure('content-type');
          if (spec.fresh) assertFresh(headers);
          const encoding = (headers['content-encoding'] ?? 'identity').trim().toLowerCase();
          const decoders = { gzip: createGunzip, deflate: createInflate, br: createBrotliDecompress };
          if (encoding !== 'identity' && !Object.hasOwn(decoders, encoding)) throw new Failure('encoding');
          if (encoding === 'identity' && /^\d+$/.test(headers['content-length'] ?? '')
            && Number(headers['content-length']) > spec.bytes) throw new Failure('body-limit');
          let bytes = 0;
          const chunks = [];
          decoder = encoding === 'identity' ? null : decoders[encoding]();
          const body = decoder ?? response;
          body.on('error', () => finish(new Failure('encoding')));
          body.on('data', (chunk) => {
            if (settled) return;
            try {
              assertTime(state, deadline);
              if (bytes + chunk.length > spec.bytes) throw new Failure('body-limit');
              if (state.bytes + chunk.length > state.limits.runBytes) throw new Failure('run-bytes');
              bytes += chunk.length;
              state.bytes += chunk.length;
              chunks.push(chunk); // Count decoded bytes before retaining each chunk.
            } catch (error) { finish(error); }
          });
          body.on('end', () => {
            if (settled) return;
            try {
              assertTime(state, deadline);
              finish(null, { body: Buffer.concat(chunks, bytes).toString('utf8') });
            } catch (error) { finish(error); }
          });
          if (decoder) response.pipe(decoder);
        } catch (error) { finish(error); }
      });
      outgoing.on('error', (error) => finish(transportFailure(error)));
      outgoing.end();
    } catch (error) { finish(error instanceof Failure ? error : transportFailure(error)); }
  });
}

function sameSite(url) {
  return url.origin === site && !url.username && !url.password;
}
const routePath = (value) => value === '/' ? '/' : value.replace(/\/$/, '');

// Only inspect real link/div tags, not strings inside Next's script payloads or comments.
// This deliberately recognizes the current metadata/SSR output, not arbitrary HTML schemas.
function htmlTags(html) {
  const markup = html.replace(/<!--[\s\S]*?(?:-->|$)|<(script|style|textarea|title)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, '');
  return [...markup.matchAll(/<(link|div)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi)].map((match) => {
    const attributes = {};
    for (const attr of match[0].matchAll(/\s+([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/g)) {
      const key = attr[1].toLowerCase();
      if (Object.hasOwn(attributes, key)) throw new Failure('html');
      attributes[key] = attr[2] ?? attr[3] ?? attr[4];
    }
    return { tag: match[1].toLowerCase(), attributes };
  });
}

function assertPage(html, pathname) {
  const tags = htmlTags(html);
  const canonicals = tags.filter(({ tag, attributes }) => tag === 'link' && attributes.rel?.toLowerCase() === 'canonical');
  if (canonicals.length !== 1) throw new Failure('route');
  let canonical;
  try { canonical = new URL(canonicals[0].attributes.href); } catch { throw new Failure('route'); }
  if (!sameSite(canonical) || canonical.search || canonical.hash || routePath(canonical.pathname) !== routePath(pathname)) throw new Failure('route');
  if (pathname === '/tutorials/') {
    const markers = tags.filter(({ tag, attributes }) => tag === 'div' && Object.hasOwn(attributes, 'data-kira-tutorials'));
    if (markers.length !== 1 || markers[0].attributes['data-kira-tutorials'] !== 'available') throw new Failure('tutorial-ssr');
  }
}

// Test-only injection uses native loopback TLS with normal certificate validation.
// The production CLI has no origin, proxy, request, budget or retry override.
export async function verifyDeployment({ request = nativeRequest, limits = publicLimits } = {}) {
  const state = { limits, deadline: performance.now() + limits.runMs, bytes: 0, status: 0 };
  const revision = /^[0-9a-f]{40}$/.test(sourceRevision) ? sourceRevision : 'invalid';
  const receipts = [];
  let currentPath = '(configuration)';
  const receipt = (kind) => receipts.push({ status: state.status, revision, path: currentPath, kind });
  try {
    validateProductionIdentifiers(true);
    validateSourceRevision(true);
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new Failure('configuration');
  } catch {
    receipt('configuration');
    return { ok: false, receipts };
  }
  const nonce = randomBytes(16).toString('hex');
  const check = async (origin, pathname, spec, validate) => {
    currentPath = pathname;
    state.status = 0;
    const deadline = Math.min(state.deadline, performance.now() + limits.requestMs);
    let url = new URL(pathname, origin);
    if (spec.fresh) url.searchParams.set('kira_verify', nonce);
    let response;
    for (let hops = 0; ; hops++) {
      response = await readResponse(url, spec, state, deadline, request);
      if (!response.redirect) break;
      if (hops >= limits.redirects) throw new Failure('redirect-limit');
      let target;
      try { target = new URL(response.headers.location, url); } catch { throw new Failure('redirect'); }
      // Canonical slash redirects only; never probe response-selected admin/media paths.
      if (!response.headers.location || !sameSite(target) || target.search || target.hash
        || routePath(target.pathname) !== routePath(pathname)) throw new Failure('redirect');
      url = target;
    }
    validate(response);
    assertTime(state, deadline); // Parsing is bounded by bytes but cannot be preempted by timers.
    receipt('ok');
  };
  const json = (origin, pathname, bytes, validate, kind, fresh = false) => check(origin, pathname,
    { type: 'application/json', bytes, fresh }, ({ body }) => {
      let value;
      try { value = JSON.parse(body); } catch { throw new Failure('json'); }
      if (!validate(value)) throw new Failure(kind);
    });
  try {
    await json(site, '/kira-release.json', limits.markerBytes, (value) => keys(value, ['sourceRevision'])
      && value.sourceRevision === sourceRevision, 'revision', true);
    for (const page of pages) {
      await check(site, page, { html: true, type: 'text/html', bytes: limits.htmlBytes }, ({ body }) => assertPage(body, page));
    }
    await json(site, '/whatsnew/35/whatsnew.json', limits.jsonBytes,
      (value) => object(value) && Array.isArray(value.features) && value.features.length > 0, 'schema');
    await json(site, '/.well-known/assetlinks.json', limits.associationBytes, androidAssociationReady, 'association');
    await json(site, '/.well-known/apple-app-site-association', limits.associationBytes, appleAssociationReady, 'association');
    await json(api, '/api/v1/tutorial-categories', limits.jsonBytes, categoriesReady, 'schema', true);
    await json(api, '/api/v1/tutorials', limits.jsonBytes, tutorialsReady, 'schema', true);
    await check('http://kiramanga.me', '/', { upgrade: true }, ({ headers }) => {
      let target;
      try { target = new URL(headers.location); } catch { throw new Failure('http-upgrade'); }
      if (!sameSite(target) || target.pathname !== '/' || target.search || target.hash) throw new Failure('http-upgrade');
    });
    return { ok: true, receipts };
  } catch (error) {
    receipt(error instanceof Failure ? error.kind : 'internal');
    return { ok: false, receipts };
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = process.argv.length === 2 ? await verifyDeployment() : {
    ok: false, receipts: [{ status: 0, revision: 'invalid', path: '(configuration)', kind: 'configuration' }],
  };
  // Flush only safe receipts, then terminate this CLI (including pending native DNS work).
  process.stdout.on('error', () => process.exit(1));
  process.stdout.write(`${result.receipts.map((item) => JSON.stringify(item)).join('\n')}\n`, () => process.exit(result.ok ? 0 : 1));
}
