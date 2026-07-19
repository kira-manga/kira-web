import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { LocalizedText } from '@/components/ui/localized-text';
import { liveAppScreenSources } from '@/content/media';
import { siteConfig, siteCopy } from '@/content/site';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.metadata.title, template: `%s — ${siteConfig.name}` },
  description: siteConfig.metadata.description,
  applicationName: siteConfig.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.openGraphDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.shortDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: siteConfig.themeColor,
  colorScheme: 'dark light',
};

const preferenceScript = `(() => { try {
  const screenSources = ${JSON.stringify(liveAppScreenSources)};
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
  root.style.setProperty('--live-app-screen', 'url("' + screenSources[language + '-' + theme] + '")');
} catch (_) {}}
)();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="dark"
      data-lang="en"
      style={{ '--live-app-screen': `url("${liveAppScreenSources['en-dark']}")` } as CSSProperties}
      suppressHydrationWarning
    >
      <head><script dangerouslySetInnerHTML={{ __html: preferenceScript }} /></head>
      <body>
        <a className="skipLink" href="#main-content"><LocalizedText en={siteCopy.skipLink.en} ar={siteCopy.skipLink.ar} /></a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
