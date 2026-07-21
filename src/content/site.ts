export const siteConfig = {
  name: 'Kira Manga',
  shortName: 'Kira',
  wordmarkSuffix: 'Manga',
  url: 'https://kiramanga.me',
  themeColor: '#0c0d11',
  metadata: {
    title: 'Kira Manga — Manga. Undisturbed.',
    description: 'A focused manga reader for Android and iOS with local libraries, offline chapters, backups, and multilingual reading tools.',
    openGraphDescription: 'Your library, offline chapters, backups, and multilingual reading tools in one focused manga reader.',
    shortDescription: 'A focused manga reader for Android and iOS.',
  },
  socialCard: {
    alt: 'Kira Manga — Your manga universe',
    eyebrow: 'Kira Manga',
    title: 'Your manga',
    accent: 'universe.',
    description: 'Discover. Collect. Read beyond the ordinary.',
  },
} as const;

export const siteCopy = {
  skipLink: { en: 'Skip to content', ar: 'انتقل إلى المحتوى' },
  navigation: [
    { href: '/#features', label: { en: 'Product', ar: 'المنتج' } },
    { href: '/#inside-kira', label: { en: 'Inside Kira', ar: 'داخل كيرا' } },
    { href: '/tutorials', label: { en: 'Tutorials', ar: 'الشروحات' } },
    { href: '/support', label: { en: 'Support', ar: 'الدعم' } },
  ],
  header: {
    navigationLabel: 'Main navigation',
    primaryLinksLabel: 'Primary links',
    menuLabel: 'Toggle navigation',
    cta: { en: 'Start reading', ar: 'ابدأ القراءة' },
  },
  preferences: {
    useLightTheme: 'Use light theme',
    useDarkTheme: 'Use dark theme',
    switchToEnglish: 'Switch to English',
    switchToArabic: 'التبديل إلى العربية',
    liveScreenAlt: 'Kira Discover screen — شاشة اكتشف في كيرا',
    languageToggle: { english: 'EN', arabic: 'ع' },
  },
  footer: {
    title: { en: 'Keep the story.\nLose the noise.', ar: 'احتفظ بالقصة.\nواترك الضوضاء.' },
    description: {
      en: 'A focused manga reader for discovery, offline chapters, and a library that stays yours.',
      ar: 'قارئ مانجا هادئ للاكتشاف والفصول دون إنترنت ومكتبة تبقى لك.',
    },
    productLabel: { en: 'Product', ar: 'المنتج' },
    legalLabel: { en: 'Legal', ar: 'قانوني' },
    productLinks: [
      { href: '/activate', label: { en: 'Start reading', ar: 'ابدأ القراءة' } },
      { href: '/tutorials', label: { en: 'Tutorials', ar: 'الشروحات' } },
      { href: '/guide', label: { en: 'Quick-start guide', ar: 'دليل البدء السريع' } },
      { href: '/support', label: { en: 'Support', ar: 'الدعم' } },
    ],
    legalLinks: [
      { href: '/privacy', label: { en: 'Privacy', ar: 'الخصوصية' } },
      { href: '/terms', label: { en: 'Terms', ar: 'الشروط' } },
      { href: '/takedown', label: { en: 'Takedown', ar: 'إزالة المحتوى' } },
      { href: '/data-deletion', label: { en: 'Data deletion', ar: 'حذف البيانات' } },
    ],
    bottomCta: { en: 'Start reading', ar: 'ابدأ القراءة' },
  },
  documents: {
    englishOnlyNotice: 'هذه الصفحة المرجعية متاحة حاليًا باللغة الإنجليزية لضمان دقة الإرشادات والنصوص القانونية.',
    onThisPage: { en: 'On this page', ar: 'في هذه الصفحة' },
    onThisPageLabel: 'On this page',
  },
  notFound: {
    eyebrow: '404',
    title: 'This page slipped between chapters.',
    description: 'The link may be outdated, or the page may have moved.',
    cta: 'Back to Kira',
  },
} as const;
