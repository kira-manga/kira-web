import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'out');
const requiredPages = ['index.html', 'activate/index.html', 'privacy/index.html', 'terms/index.html',
  'guide/index.html', 'tutorials/index.html', 'tutorials/getting-started/index.html',
  'tutorials/discover-manga/index.html', 'tutorials/read-offline/index.html',
  'tutorials/personalize-kira/index.html', 'support/index.html', 'takedown/index.html', 'data-deletion/index.html',
  '404.html'];

for (const page of requiredPages) {
  await access(path.join(output, page));
  const html = await readFile(path.join(output, page), 'utf8');
  if (!html.includes('<meta name="viewport"') || !html.includes('Kira Manga')) {
    throw new Error(`${page} is missing required responsive/canonical content`);
  }
}

const home = await readFile(path.join(output, 'index.html'), 'utf8');
for (const marker of ['All your manga.', 'None of the noise.', 'REAL BUILD', 'كل المانجا', 'manga-details.jpg', '/tutorials/']) {
  if (!home.includes(marker)) throw new Error(`Homepage is missing product marker: ${marker}`);
}

const tutorialHub = await readFile(path.join(output, 'tutorials/index.html'), 'utf8');
for (const marker of ['Learn Kira', 'Search tutorials', 'تعلّم كيرا', 'getting-started']) {
  if (!tutorialHub.includes(marker)) throw new Error(`Tutorial hub is missing marker: ${marker}`);
}

for (const asset of [
  'brand/kira-logo.svg',
  'fonts/gellix-regular.ttf',
  'fonts/gellix-semibold.ttf',
  'fonts/gellix-bold.ttf',
  'screens/discover-en-dark.jpg',
  'screens/discover-en-light.jpg',
  'screens/discover-ar-dark.jpg',
  'screens/discover-ar-light.jpg',
  'screens/manga-details.jpg',
  'screens/settings-dark.jpg',
]) {
  const details = await stat(path.join(output, asset));
  if (details.size > 160_000) throw new Error(`${asset} exceeds the 160 KB production asset budget`);
}

for (const asset of ['_headers', '_redirects', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest',
  'opengraph-image']) {
  await access(path.join(output, asset));
}

const headers = await readFile(path.join(output, '_headers'), 'utf8');
for (const header of ['Content-Security-Policy', 'X-Content-Type-Options', 'Permissions-Policy',
  '/opengraph-image', '/screens/*', '/brand/*', '/fonts/*', 'image/png', 'application/manifest+json', 'application/xml']) {
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
