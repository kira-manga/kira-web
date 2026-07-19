import type { MetadataRoute } from 'next';

import { siteConfig } from '@/content/site';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.metadata.shortDescription,
    start_url: '/',
    display: 'standalone',
    background_color: siteConfig.themeColor,
    theme_color: siteConfig.themeColor,
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
