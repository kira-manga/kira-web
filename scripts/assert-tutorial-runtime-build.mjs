import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function assertTutorialRuntimeBuild(root) {
  const manifest = JSON.parse(await readFile(path.join(root, '.next/prerender-manifest.json'), 'utf8'));
  const routes = [...Object.keys(manifest.routes), ...Object.keys(manifest.dynamicRoutes)];
  for (const route of routes) {
    const pathname = route === '/' ? route : route.replace(/\/$/, '');
    assert.ok(
      pathname !== '/' && pathname !== '/sitemap.xml' && pathname !== '/tutorials' && !pathname.startsWith('/tutorials/'),
      `Backend-dependent route was prerendered: ${route}`,
    );
  }
  for (const artifact of ['index.html', 'tutorials.html', 'sitemap.xml.body']) {
    await assert.rejects(
      access(path.join(root, '.next/server/app', artifact)),
      { code: 'ENOENT' },
      `Backend-dependent prerender artifact exists: ${artifact}`,
    );
  }
}
