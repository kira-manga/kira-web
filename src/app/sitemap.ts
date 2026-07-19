import type { MetadataRoute } from 'next';

import { tutorials } from '@/content/tutorials';

export const dynamic = 'force-static';

const routes = ['', '/activate', '/tutorials', ...tutorials.map(({ slug }) => `/tutorials/${slug}`), '/guide', '/support', '/privacy', '/terms', '/takedown', '/data-deletion'];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route, index) => ({
    url: `https://kiramanga.me${route}`,
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : route === '/activate' ? 0.9 : route.startsWith('/tutorials') ? 0.8 : 0.6,
  }));
}
