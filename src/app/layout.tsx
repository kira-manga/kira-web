import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

import './globals.css';

const siteUrl = 'https://kiramanga.me';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Kira Manga — Your manga, your way', template: '%s — Kira Manga' },
  description: 'A focused manga reader for Android and iOS with local libraries, offline chapters, backups, and multilingual reading tools.',
  applicationName: 'Kira Manga',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Kira Manga',
    title: 'Kira Manga — Your manga, your way',
    description: 'Your library, offline chapters, backups, and multilingual reading tools in one focused manga reader.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kira Manga — Your manga, your way',
    description: 'A focused manga reader for Android and iOS.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0e1014',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skipLink" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
