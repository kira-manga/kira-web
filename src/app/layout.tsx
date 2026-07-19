import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { LocalizedText } from '@/components/localized-text';

import './globals.css';

const siteUrl = 'https://kiramanga.me';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Kira Manga — Manga. Undisturbed.', template: '%s — Kira Manga' },
  description: 'A focused manga reader for Android and iOS with local libraries, offline chapters, backups, and multilingual reading tools.',
  applicationName: 'Kira Manga',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Kira Manga',
    title: 'Kira Manga — Manga. Undisturbed.',
    description: 'Your library, offline chapters, backups, and multilingual reading tools in one focused manga reader.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kira Manga — Manga. Undisturbed.',
    description: 'A focused manga reader for Android and iOS.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0e1014',
  colorScheme: 'dark light',
};

const preferenceScript = `(() => { try {
  const params = new URLSearchParams(location.search);
  const requestedTheme = params.get('theme');
  const requestedLanguage = params.get('lang');
  const storedTheme = localStorage.getItem('kira-theme');
  const storedLanguage = localStorage.getItem('kira-language');
  const theme = requestedTheme === 'light' || requestedTheme === 'dark'
    ? requestedTheme
    : storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const language = requestedLanguage === 'ar' || requestedLanguage === 'en'
    ? requestedLanguage
    : storedLanguage === 'ar' ? 'ar' : 'en';
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.lang = language;
  root.lang = language;
  root.dir = language === 'ar' ? 'rtl' : 'ltr';
  root.style.setProperty('--live-app-screen', 'url("/screens/discover-' + language + '-' + theme + '.jpg")');
} catch (_) {}}
)();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" data-lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: preferenceScript }} /></head>
      <body>
        <a className="skipLink" href="#main-content"><LocalizedText en="Skip to content" ar="انتقل إلى المحتوى" /></a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
