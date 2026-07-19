import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'out');
const port = Number(process.env.PORT || 4173);
const types = new Map([
  ['.css', 'text/css; charset=utf-8'], ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
]);

createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const clean = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  let file = path.resolve(root, clean || 'index.html');
  if (!file.startsWith(root)) {
    response.writeHead(400).end('Bad request');
    return;
  }
  try {
    if (statSync(file).isDirectory()) file = path.join(file, 'index.html');
    const extension = path.extname(file);
    const contentType = clean === '.well-known/apple-app-site-association'
      ? 'application/json; charset=utf-8'
      : clean === 'opengraph-image'
        ? 'image/png'
        : types.get(extension) || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Kira Web: http://127.0.0.1:${port}`);
});
