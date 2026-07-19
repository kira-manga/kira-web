import process from 'node:process';

export const production = process.env.KIRA_WEB_PRODUCTION === 'true';

export const identifiers = {
  '__ANDROID_PACKAGE_NAME__': process.env.ANDROID_PACKAGE_NAME || 'me.manga.kira',
  '__ANDROID_SHA256_CERT_FINGERPRINT__':
    process.env.ANDROID_APP_SHA256_CERT_FINGERPRINT
      || 'REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT',
  '__APPLE_TEAM_ID__': process.env.APPLE_TEAM_ID || '7CGZ2343AA',
  '__IOS_BUNDLE_ID__': process.env.IOS_BUNDLE_ID || 'me.manga.kira',
};

export function validateProductionIdentifiers() {
  if (!production) return;

  const fingerprint = identifiers.__ANDROID_SHA256_CERT_FINGERPRINT__;
  if (!/^[0-9A-F]{2}(?::[0-9A-F]{2}){31}$/i.test(fingerprint)) {
    throw new Error(
      'ANDROID_APP_SHA256_CERT_FINGERPRINT must be 32 colon-separated SHA-256 bytes',
    );
  }

  if (!/^[A-Z0-9]{10}$/.test(identifiers.__APPLE_TEAM_ID__)) {
    throw new Error('APPLE_TEAM_ID must be a 10-character Apple Team ID');
  }

  for (const key of ['__ANDROID_PACKAGE_NAME__', '__IOS_BUNDLE_ID__']) {
    if (!/^[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z0-9_-]+)+$/.test(identifiers[key])) {
      throw new Error(`${key} is not a valid application identifier`);
    }
  }
}
