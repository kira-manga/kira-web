import type { ImageAsset, Language, Theme } from '@/content/types';

export type AppScreenKey = 'discover' | 'history' | 'library' | 'mangaDetails' | 'notifications' | 'settings';
export type AppScreenVariants = Record<`${Language}-${Theme}`, string>;

const discoverVariants: AppScreenVariants = {
  'en-dark': '/assets/app-screens/discover/discover-en-dark.jpeg',
  'en-light': '/assets/app-screens/discover/discover-en-light.jpeg',
  'ar-dark': '/assets/app-screens/discover/discover-ar-dark.jpeg',
  'ar-light': '/assets/app-screens/discover/discover-ar-light.jpeg',
};

const historyVariants: AppScreenVariants = {
  'en-dark': '/assets/app-screens/history/history-en-dark.jpeg',
  'en-light': '/assets/app-screens/history/history-en-light.jpeg',
  'ar-dark': '/assets/app-screens/history/history-ar-dark.jpeg',
  'ar-light': '/assets/app-screens/history/history-ar-light.jpeg',
};

const libraryVariants: AppScreenVariants = {
  'en-dark': '/assets/app-screens/library/library-en-dark.jpeg',
  'en-light': '/assets/app-screens/library/library-en-light.jpeg',
  'ar-dark': '/assets/app-screens/library/library-ar-dark.jpeg',
  'ar-light': '/assets/app-screens/library/library-ar-light.jpeg',
};

const mangaDetailsVariants: AppScreenVariants = {
  'en-dark': '/assets/app-screens/details/manga-details-en-dark.jpeg',
  'en-light': '/assets/app-screens/details/manga-details-en-light.jpeg',
  'ar-dark': '/assets/app-screens/details/manga-details-ar-dark.jpeg',
  'ar-light': '/assets/app-screens/details/manga-details-ar-light.jpeg',
};

const notificationsVariants: AppScreenVariants = {
  'en-dark': '/assets/app-screens/notifications/notifications-en-dark.jpeg',
  'en-light': '/assets/app-screens/notifications/notifications-en-light.jpeg',
  'ar-dark': '/assets/app-screens/notifications/notifications-ar-dark.jpeg',
  'ar-light': '/assets/app-screens/notifications/notifications-ar-light.jpeg',
};

const settingsVariants: AppScreenVariants = {
  'en-dark': '/assets/app-screens/settings/settings-en-dark.jpeg',
  'en-light': '/assets/app-screens/settings/settings-en-light.jpeg',
  'ar-dark': '/assets/app-screens/settings/settings-ar-dark.jpeg',
  'ar-light': '/assets/app-screens/settings/settings-ar-light.jpeg',
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
      src: discoverVariants['en-light'],
      width: 589,
      height: 1280,
      alt: { en: 'Kira Discover screen', ar: 'شاشة «اكتشف» في كيرا' },
      variants: discoverVariants,
    },
    history: {
      src: historyVariants['en-dark'],
      width: 589,
      height: 1280,
      alt: { en: 'Kira reading history screen', ar: 'شاشة سجل القراءة في كيرا' },
      variants: historyVariants,
    },
    library: {
      src: libraryVariants['en-dark'],
      width: 589,
      height: 1280,
      alt: { en: 'Kira library screen', ar: 'شاشة المكتبة في كيرا' },
      variants: libraryVariants,
    },
    mangaDetails: {
      src: mangaDetailsVariants['en-light'],
      width: 589,
      height: 1280,
      alt: { en: 'Kira manga details screen', ar: 'شاشة تفاصيل المانجا في كيرا' },
      variants: mangaDetailsVariants,
    },
    notifications: {
      src: notificationsVariants['en-dark'],
      width: 589,
      height: 1280,
      alt: { en: 'Kira notifications screen', ar: 'شاشة الإشعارات في كيرا' },
      variants: notificationsVariants,
    },
    settings: {
      src: settingsVariants['en-dark'],
      width: 589,
      height: 1280,
      alt: { en: 'Kira Settings screen', ar: 'شاشة إعدادات كيرا' },
      variants: settingsVariants,
    },
  } satisfies Record<AppScreenKey, ImageAsset & { variants: AppScreenVariants }>,
} as const;

export const liveAppScreenSources = media.appScreens.discover.variants;
