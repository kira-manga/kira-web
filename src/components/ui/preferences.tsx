'use client';

import { useSyncExternalStore } from 'react';

import { GlobeIcon, MoonIcon, SunIcon } from '@/components/ui/icons';
import { liveAppScreenSources, media, type AppScreenKey } from '@/content/media';
import { siteCopy } from '@/content/site';
import type { Language, Theme } from '@/content/types';

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
  root.style.setProperty('--live-app-screen', `url("${liveAppScreenSources[`${next.language}-${next.theme}`]}")`);
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
        aria-label={isDark ? siteCopy.preferences.useLightTheme : siteCopy.preferences.useDarkTheme}
        aria-pressed={isDark}
        onClick={() => update({ ...preferences, theme: isDark ? 'light' : 'dark' })}
      >
        <span className="themeIcon themeIconMoon"><MoonIcon /></span>
        <span className="themeIcon themeIconSun"><SunIcon /></span>
      </button>
      <button
        type="button"
        className="languageToggle"
        aria-label={isArabic ? siteCopy.preferences.switchToEnglish : siteCopy.preferences.switchToArabic}
        aria-pressed={isArabic}
        onClick={() => update({ ...preferences, language: isArabic ? 'en' : 'ar' })}
      >
        <GlobeIcon /><span>{isArabic ? siteCopy.preferences.languageToggle.english : siteCopy.preferences.languageToggle.arabic}</span>
      </button>
    </div>
  );
}

export function LiveAppScreen({ eager = false }: { eager?: boolean }) {
  return (
    <span
      className={eager ? 'liveAppScreen liveAppScreenEager' : 'liveAppScreen'}
      role="img"
      aria-label={siteCopy.preferences.liveScreenAlt}
    />
  );
}

export function AppScreen({ screen, eager = false }: { screen: AppScreenKey; eager?: boolean }) {
  const { preferences } = useKiraPreferences();
  const asset = media.appScreens[screen];
  const source = asset.variants[`${preferences.language}-${preferences.theme}`];

  return (
    <span
      className={eager ? 'liveAppScreen liveAppScreenEager' : 'liveAppScreen'}
      role="img"
      aria-label={asset.alt[preferences.language]}
      style={{ backgroundImage: `url("${source}")` }}
    />
  );
}
