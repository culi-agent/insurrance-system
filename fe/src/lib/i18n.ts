import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import vi from '@/locales/vi.json';
import en from '@/locales/en.json';

/**
 * i18n configuration using react-i18next
 * Supports Vietnamese (vi) and English (en)
 * Auto-detects user language from browser/localStorage
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    fallbackLng: 'vi',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app_language',
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
