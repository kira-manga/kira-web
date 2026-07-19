import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { identifiers, production } from './association-config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'out');

for (const relativePath of [
  '.well-known/assetlinks.json',
  '.well-known/apple-app-site-association',
]) {
  const file = path.join(output, relativePath);
  let contents = await readFile(file, 'utf8');
  for (const [token, value] of Object.entries(identifiers)) {
    contents = contents.replaceAll(token, value);
  }
  await writeFile(file, contents);
}

console.log(`Materialized ${production ? 'production' : 'development'} app associations.`);
