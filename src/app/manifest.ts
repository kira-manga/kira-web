import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kira Manga',
    short_name: 'Kira',
    description: 'A focused manga reader for Android and iOS.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e1014',
    theme_color: '#ff5b6e',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
