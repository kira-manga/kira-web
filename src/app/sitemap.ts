import type { MetadataRoute } from 'next';

import { siteConfig } from '@/content/site';
import { getTutorials } from '@/lib/tutorial-api';

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await getTutorials();
  const tutorialRoutes = result.status === 'ok' ? result.data.map(({ slug }) => `/tutorials/${slug}`) : [];
  const routes = ['', '/activate', '/tutorials', ...tutorialRoutes, '/guide', '/support', '/privacy', '/terms', '/takedown', '/data-deletion'];
  return routes.map((route, index) => ({
    url: `${siteConfig.url}${route}`,
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : route === '/activate' ? 0.9 : route.startsWith('/tutorials') ? 0.8 : 0.6,
  }));
}
