import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kira Manga',
    short_name: 'Kira',
    description: 'A focused manga reader for Android and iOS.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f2e8',
    theme_color: '#f5c33d',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
