'use client';

import { useSyncExternalStore } from 'react';

import { GlobeIcon, MoonIcon, SunIcon } from '@/components/icons';

type Theme = 'dark' | 'light';
type Language = 'en' | 'ar';

interface Preferences {
  theme: Theme;
  language: Language;
}

const defaultPreferences: Preferences = { theme: 'dark', language: 'en' };
const preferenceEvent = 'kira:preferences';

function readPreferences(): Preferences {
  if (typeof document === 'undefined') return defaultPreferences;
  return {
    theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
    language: document.documentElement.dataset.lang === 'ar' ? 'ar' : 'en',
  };
}

function applyPreferences(next: Preferences) {
  const root = document.documentElement;
  root.dataset.theme = next.theme;
  root.dataset.lang = next.language;
  root.lang = next.language;
  root.dir = next.language === 'ar' ? 'rtl' : 'ltr';
  root.style.setProperty('--live-app-screen', `url("${screenSources[`${next.language}-${next.theme}`]}")`);
  localStorage.setItem('kira-theme', next.theme);
  localStorage.setItem('kira-language', next.language);
  window.dispatchEvent(new CustomEvent(preferenceEvent, { detail: next }));
}

function preferenceSnapshot() {
  const { theme, language } = readPreferences();
  return `${theme}:${language}` as const;
}

function subscribePreferences(onStoreChange: () => void) {
  window.addEventListener(preferenceEvent, onStoreChange);
  return () => window.removeEventListener(preferenceEvent, onStoreChange);
}

export function useKiraPreferences() {
  const snapshot = useSyncExternalStore(subscribePreferences, preferenceSnapshot, () => 'dark:en');
  const [theme, language] = snapshot.split(':') as [Theme, Language];
  const preferences = { theme, language };

  const update = (next: Preferences) => {
    applyPreferences(next);
  };

  return { preferences, update };
}

export function PreferenceControls({ compact = false }: { compact?: boolean }) {
  const { preferences, update } = useKiraPreferences();
  const isDark = preferences.theme === 'dark';
  const isArabic = preferences.language === 'ar';

  return (
    <div className={compact ? 'preferenceControls preferenceControlsCompact' : 'preferenceControls'}>
      <button
        type="button"
        aria-label={isDark ? 'Use light theme' : 'Use dark theme'}
        aria-pressed={isDark}
        onClick={() => update({ ...preferences, theme: isDark ? 'light' : 'dark' })}
      >
        <span className="themeIcon themeIconMoon"><MoonIcon /></span>
        <span className="themeIcon themeIconSun"><SunIcon /></span>
      </button>
      <button
        type="button"
        className="languageToggle"
        aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
        aria-pressed={isArabic}
        onClick={() => update({ ...preferences, language: isArabic ? 'en' : 'ar' })}
      >
        <GlobeIcon /><span>{isArabic ? 'EN' : 'ع'}</span>
      </button>
    </div>
  );
}

const screenSources: Record<`${Language}-${Theme}`, string> = {
  'en-dark': '/screens/discover-en-dark.jpg',
  'en-light': '/screens/discover-en-light.jpg',
  'ar-dark': '/screens/discover-ar-dark.jpg',
  'ar-light': '/screens/discover-ar-light.jpg',
};

export function LiveAppScreen({ eager = false }: { eager?: boolean }) {
  return (
    <span
      className={eager ? 'liveAppScreen liveAppScreenEager' : 'liveAppScreen'}
      role="img"
      aria-label="Real Kira app Discover screen — شاشة اكتشف الحقيقية من تطبيق كيرا"
    />
  );
}
