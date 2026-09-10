import type { Language, LocalizedCountMessages } from '@/content/types';

const plurals = {
  en: new Intl.PluralRules('en'),
  ar: new Intl.PluralRules('ar'),
};
const numbers = {
  en: new Intl.NumberFormat('en'),
  ar: new Intl.NumberFormat('ar', { numberingSystem: 'arab' }),
};

// Counts are nonnegative integer collection lengths, not arbitrary numeric input.
export function formatTutorialCount(count: number, language: Language, messages: LocalizedCountMessages): string {
  const category = plurals[language].select(count);
  const template = language === 'ar'
    ? messages.ar[category]
    : messages.en[category === 'one' ? 'one' : 'other'];
  return template.replace('{count}', numbers[language].format(count));
}
