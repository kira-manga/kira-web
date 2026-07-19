import process from 'node:process';

const base = new URL(process.argv[2] || 'https://kiramanga.me');
if (base.protocol !== 'https:') throw new Error('Production verification requires an HTTPS base URL');

async function expectResponse(path, expectedType) {
  const url = new URL(path, base);
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
  if (response.status !== 200) throw new Error(`${url} returned ${response.status}`);
  if (response.url.startsWith('http:')) throw new Error(`${url} ended on insecure HTTP`);
  const type = response.headers.get('content-type') || '';
  if (!type.toLowerCase().includes(expectedType)) {
    throw new Error(`${url} content-type was ${type}; expected ${expectedType}`);
  }
  return response;
}

for (const page of ['/activate', '/guide', '/privacy', '/terms', '/support', '/takedown', '/data-deletion']) {
  await expectResponse(page, 'text/html');
}

const whatsNew = await (await expectResponse('/whatsnew/35/whatsnew.json', 'application/json')).json();
if (!Array.isArray(whatsNew.features) || whatsNew.features.length === 0) {
  throw new Error('Deployed What\'s New document is empty or malformed');
}

const assetlinks = await (await expectResponse('/.well-known/assetlinks.json', 'application/json')).json();
const fingerprint = assetlinks?.[0]?.target?.sha256_cert_fingerprints?.[0] || '';
if (!/^[0-9A-F]{2}(?::[0-9A-F]{2}){31}$/i.test(fingerprint)) {
  throw new Error('Deployed assetlinks.json still has an invalid or placeholder fingerprint');
}
if (assetlinks[0].target.package_name !== 'me.manga.kira') {
  throw new Error('Deployed Android package name does not match me.manga.kira');
}

const aasa = await (await expectResponse('/.well-known/apple-app-site-association', 'application/json')).json();
if (aasa?.applinks?.details?.[0]?.appID !== '7CGZ2343AA.me.manga.kira') {
  throw new Error('Deployed AASA appID does not match the shipping iOS identifier');
}

const insecure = new URL(base);
insecure.protocol = 'http:';
const redirect = await fetch(insecure, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
if (![301, 302, 307, 308].includes(redirect.status)) {
  throw new Error(`HTTP origin did not redirect to HTTPS (status ${redirect.status})`);
}
const location = redirect.headers.get('location') || '';
if (!location.startsWith('https://')) throw new Error('HTTP redirect target is not HTTPS');

console.log(`TLS, redirects, pages, content types, and association identifiers passed for ${base.origin}`);
