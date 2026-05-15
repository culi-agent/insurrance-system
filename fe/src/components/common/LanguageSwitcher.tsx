import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Language switcher component
 * Allows users to switch between Vietnamese and English
 */

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'buttons', className = '' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Update HTML lang attribute
    document.documentElement.lang = langCode;
  };

  if (variant === 'dropdown') {
    return (
      <select
        value={currentLang}
        onChange={(e) => handleChange(e.target.value)}
        className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        aria-label="Chọn ngôn ngữ / Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`} role="group" aria-label="Chọn ngôn ngữ / Select language">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={`px-2.5 py-1 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
            currentLang === lang.code
              ? 'bg-primary-100 text-primary-700 border border-primary-300'
              : 'text-gray-600 hover:bg-gray-100 border border-transparent'
          }`}
          aria-pressed={currentLang === lang.code}
          aria-label={`${lang.name}${currentLang === lang.code ? ' (đang chọn / selected)' : ''}`}
        >
          <span aria-hidden="true">{lang.flag}</span>
          <span className="ml-1">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
