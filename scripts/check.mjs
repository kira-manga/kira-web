import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'out');
const requiredPages = ['index.html', 'activate/index.html', 'privacy/index.html', 'terms/index.html',
  'guide/index.html', 'support/index.html', 'takedown/index.html', 'data-deletion/index.html',
  '404.html'];

for (const page of requiredPages) {
  await access(path.join(output, page));
  const html = await readFile(path.join(output, page), 'utf8');
  if (!html.includes('<meta name="viewport"') || !html.includes('Kira Manga')) {
    throw new Error(`${page} is missing required responsive/canonical content`);
  }
}

const home = await readFile(path.join(output, 'index.html'), 'utf8');
for (const marker of ['Discover', 'Popular now', 'Latest updates', 'Read offline']) {
  if (!home.includes(marker)) throw new Error(`Homepage is missing product marker: ${marker}`);
}

for (const asset of ['_headers', '_redirects', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest',
  'opengraph-image']) {
  await access(path.join(output, asset));
}

const headers = await readFile(path.join(output, '_headers'), 'utf8');
for (const header of ['Content-Security-Policy', 'X-Content-Type-Options', 'Permissions-Policy',
  '/opengraph-image', 'image/png', 'application/manifest+json', 'application/xml']) {
  if (!headers.includes(header)) throw new Error(`_headers is missing ${header}`);
}

const whatsNew = JSON.parse(await readFile(path.join(output, 'whatsnew/35/whatsnew.json'), 'utf8'));
if (!Array.isArray(whatsNew.features) || whatsNew.features.length === 0) {
  throw new Error('whatsnew/35/whatsnew.json must contain at least one feature');
}

const assetlinks = JSON.parse(await readFile(path.join(output, '.well-known/assetlinks.json'), 'utf8'));
if (assetlinks?.[0]?.target?.package_name !== 'me.manga.kira') {
  throw new Error('assetlinks.json package_name does not match the Android applicationId');
}
if (!assetlinks[0].relation.includes('delegate_permission/common.handle_all_urls')) {
  throw new Error('assetlinks.json is missing handle_all_urls relation');
}

const aasa = JSON.parse(await readFile(path.join(output, '.well-known/apple-app-site-association'), 'utf8'));
const detail = aasa?.applinks?.details?.[0];
if (detail?.appID !== '7CGZ2343AA.me.manga.kira') {
  throw new Error('AASA appID does not match project.yml and the committed Apple team');
}
if (!JSON.stringify(detail.components).includes('/activate/*')) {
  throw new Error('AASA does not cover the /activate route');
}

const sourceTree = await readFile(path.join(root, 'public/.well-known/assetlinks.json'), 'utf8');
if (!sourceTree.includes('__ANDROID_SHA256_CERT_FINGERPRINT__')) {
  throw new Error('The source association file must retain its documented fingerprint token');
}

console.log('Next.js pages, metadata, security headers, and association files are structurally valid.');
