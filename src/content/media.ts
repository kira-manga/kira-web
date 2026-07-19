import type { ImageAsset, Language, Theme } from '@/content/types';

export type AppScreenKey = 'discover' | 'mangaDetails' | 'settings';

const discoverVariants: Record<`${Language}-${Theme}`, string> = {
  'en-dark': '/assets/app-screens/discover/discover-en-dark.jpg',
  'en-light': '/assets/app-screens/discover/discover-en-light.jpg',
  'ar-dark': '/assets/app-screens/discover/discover-ar-dark.jpg',
  'ar-light': '/assets/app-screens/discover/discover-ar-light.jpg',
};

export const media = {
  brand: {
    logo: {
      src: '/assets/brand/kira-logo.svg',
      width: 467,
      height: 319,
      alt: { en: 'Kira Manga', ar: 'كيرا مانجا' },
    },
  },
  appScreens: {
    discover: {
      src: discoverVariants['en-dark'],
      width: 540,
      height: 1200,
      alt: { en: 'The real Kira Discover screen', ar: 'شاشة «اكتشف» الحقيقية في كيرا' },
      variants: discoverVariants,
    },
    mangaDetails: {
      src: '/assets/app-screens/details/manga-details.jpg',
      width: 588,
      height: 1280,
      alt: { en: 'The real Kira manga details screen', ar: 'شاشة تفاصيل المانجا الحقيقية في كيرا' },
    },
    settings: {
      src: '/assets/app-screens/settings/settings-dark.jpg',
      width: 540,
      height: 1200,
      alt: { en: 'The real Kira Settings screen', ar: 'شاشة إعدادات كيرا الحقيقية' },
    },
  } satisfies Record<AppScreenKey, ImageAsset & { variants?: Record<`${Language}-${Theme}`, string> }>,
} as const;

export const liveAppScreenSources = media.appScreens.discover.variants;
