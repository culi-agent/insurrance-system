/**
 * Backend i18n - Simple translation for error messages
 * Supports Vietnamese (vi) and English (en)
 * Language is determined from Accept-Language header or user preference
 */

import vi from './locales/vi.json';
import en from './locales/en.json';

type Locale = 'vi' | 'en';
type TranslationMap = Record<string, string>;

const translations: Record<Locale, TranslationMap> = {
  vi: vi as TranslationMap,
  en: en as TranslationMap,
};

const DEFAULT_LOCALE: Locale = 'vi';

/**
 * Get translation for a key
 * Supports interpolation: t('error.password_min', { min: 8 }, 'en')
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
  locale: string = DEFAULT_LOCALE,
): string {
  const lang = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const translation = translations[lang][key] || translations[DEFAULT_LOCALE][key] || key;

  if (!params) return translation;

  return Object.entries(params).reduce(
    (result, [paramKey, paramValue]) =>
      result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue)),
    translation,
  );
}

/**
 * Parse Accept-Language header to determine preferred locale
 */
export function getLocaleFromHeader(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, quality] = lang.trim().split(';q=');
      return { code: code.split('-')[0].toLowerCase(), quality: quality ? parseFloat(quality) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of languages) {
    if (isValidLocale(code)) return code;
  }

  return DEFAULT_LOCALE;
}

function isValidLocale(locale: string): locale is Locale {
  return locale === 'vi' || locale === 'en';
}

export { DEFAULT_LOCALE };
export type { Locale };
