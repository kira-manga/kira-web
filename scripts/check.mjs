import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const standalone = path.join(root, '.next/standalone');

for (const file of ['server.js', 'package.json', 'public/.well-known/assetlinks.json',
  'public/.well-known/apple-app-site-association', 'public/assets/brand/kira-logo.svg']) {
  await access(path.join(standalone, file));
}
await access(path.join(root, '.next/static'));

const tutorialSource = await readFile(path.join(root, 'src/content/tutorials.ts'), 'utf8');
for (const forbidden of ['getting-started', 'discover-manga', 'read-offline', 'personalize-kira', 'getTutorial(']) {
  if (tutorialSource.includes(forbidden)) throw new Error(`Static tutorial catalog marker remains: ${forbidden}`);
}

const policyFiles = [
  'privacy.ts',
  'terms.ts',
  'support.ts',
  'takedown.ts',
  'data-deletion.ts',
];
const policySources = await Promise.all(policyFiles.map(async (file) => ({
  file,
  source: await readFile(path.join(root, 'src/content/pages', file), 'utf8'),
})));
const policyCorpus = policySources.map(({ source }) => source).join('\n');
for (const marker of [
  'placeholder(',
  '[OWNER',
  '[LEGAL',
  '[PRIVACY',
  'LEGAL NAME',
  'MAILING ADDRESS',
  'GOVERNING LAW',
  'GOVERNING LAW/FORUM',
]) {
  if (policyCorpus.toUpperCase().includes(marker.toUpperCase())) {
    throw new Error(`Unresolved or removed policy marker remains: ${marker}`);
  }
}
const contactEmail = 'abdelrahmanfahmy.dev@gmail.com';
for (const { file, source } of policySources) {
  if (!source.includes(contactEmail)) throw new Error(`${file} is missing the canonical contact email`);
  const unexpectedEmails = source.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
    ?.filter((email) => email.toLowerCase() !== contactEmail) ?? [];
  if (unexpectedEmails.length) throw new Error(`${file} contains a non-canonical contact email`);
}
for (const file of ['privacy.ts', 'terms.ts', 'takedown.ts', 'data-deletion.ts']) {
  const source = policySources.find((entry) => entry.file === file)?.source ?? '';
  if (!source.includes('July 1, 2026')) throw new Error(`${file} has an inconsistent effective date`);
}
for (const marker of [
  'at least 13 years old',
  'does not currently provide user accounts',
  'does not upload them to Kira servers',
  'retained for 90 days',
]) {
  if (!policyCorpus.includes(marker)) throw new Error(`Required policy statement is missing: ${marker}`);
}
if (!policyCorpus.includes('Within two business days')) {
  throw new Error('Support response-time statement is missing');
}

const apiSource = await readFile(path.join(root, 'src/lib/tutorial-api.ts'), 'utf8');
for (const marker of ['revalidate: 60', '/api/v1/tutorial-categories', '/api/v1/tutorials', 'status: \'unavailable\'']) {
  if (!apiSource.includes(marker)) throw new Error(`Tutorial API boundary is missing: ${marker}`);
}

for (const asset of [
  'assets/brand/kira-logo.svg',
  'assets/fonts/gellix-regular.ttf',
  'assets/fonts/gellix-semibold.ttf',
  'assets/fonts/gellix-bold.ttf',
  'assets/app-screens/discover/discover-en-dark.jpeg',
  'assets/app-screens/discover/discover-en-light.jpeg',
  'assets/app-screens/discover/discover-ar-dark.jpeg',
  'assets/app-screens/discover/discover-ar-light.jpeg',
  'assets/app-screens/history/history-en-dark.jpeg',
  'assets/app-screens/history/history-en-light.jpeg',
  'assets/app-screens/history/history-ar-dark.jpeg',
  'assets/app-screens/history/history-ar-light.jpeg',
  'assets/app-screens/library/library-en-dark.jpeg',
  'assets/app-screens/library/library-en-light.jpeg',
  'assets/app-screens/library/library-ar-dark.jpeg',
  'assets/app-screens/library/library-ar-light.jpeg',
  'assets/app-screens/details/manga-details-en-dark.jpeg',
  'assets/app-screens/details/manga-details-en-light.jpeg',
  'assets/app-screens/details/manga-details-ar-dark.jpeg',
  'assets/app-screens/details/manga-details-ar-light.jpeg',
  'assets/app-screens/notifications/notifications-en-dark.jpeg',
  'assets/app-screens/notifications/notifications-en-light.jpeg',
  'assets/app-screens/notifications/notifications-ar-dark.jpeg',
  'assets/app-screens/notifications/notifications-ar-light.jpeg',
  'assets/app-screens/settings/settings-en-dark.jpeg',
  'assets/app-screens/settings/settings-en-light.jpeg',
  'assets/app-screens/settings/settings-ar-dark.jpeg',
  'assets/app-screens/settings/settings-ar-light.jpeg',
]) {
  const details = await stat(path.join(standalone, 'public', asset));
  if (details.size > 160_000) throw new Error(`${asset} exceeds the 160 KB production asset budget`);
}

const assetlinks = JSON.parse(await readFile(path.join(standalone, 'public/.well-known/assetlinks.json'), 'utf8'));
if (assetlinks?.[0]?.target?.package_name !== 'me.manga.kira') throw new Error('assetlinks.json package_name is invalid');
const aasa = JSON.parse(await readFile(path.join(standalone, 'public/.well-known/apple-app-site-association'), 'utf8'));
if (aasa?.applinks?.details?.[0]?.appID !== '7CGZ2343AA.me.manga.kira') throw new Error('AASA appID is invalid');

const sourceTree = await readFile(path.join(root, 'public/.well-known/assetlinks.json'), 'utf8');
if (!sourceTree.includes('__ANDROID_SHA256_CERT_FINGERPRINT__')) {
  throw new Error('The source association file must retain its documented fingerprint token');
}

console.log('Standalone Next.js server, tutorial API boundary, assets, and associations are structurally valid.');
