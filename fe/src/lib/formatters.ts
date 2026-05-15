/**
 * Locale-aware formatting utilities for date, currency, and numbers
 * Supports Vietnamese (vi-VN) and English (en-US)
 */

/**
 * Get current locale code for Intl APIs
 */
export function getIntlLocale(language: string = 'vi'): string {
  const localeMap: Record<string, string> = {
    vi: 'vi-VN',
    en: 'en-US',
  };
  return localeMap[language] || 'vi-VN';
}

/**
 * Format currency in Vietnamese Dong (VND) or other currencies
 */
export function formatCurrency(
  amount: number,
  language: string = 'vi',
  currency: string = 'VND',
): string {
  const locale = getIntlLocale(language);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount);
}

/**
 * Format compact currency (e.g., 1.5M, 500K)
 */
export function formatCurrencyCompact(
  amount: number,
  language: string = 'vi',
): string {
  const locale = getIntlLocale(language);

  if (amount >= 1_000_000_000) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(amount / 1_000_000_000)} tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(amount / 1_000_000)} triệu`;
  }
  if (amount >= 1_000) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount / 1_000)}K`;
  }
  return formatCurrency(amount, language);
}

/**
 * Format date based on locale
 */
export function formatDate(
  date: Date | string | number,
  language: string = 'vi',
  options?: Intl.DateTimeFormatOptions,
): string {
  const locale = getIntlLocale(language);
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Format date with time
 */
export function formatDateTime(
  date: Date | string | number,
  language: string = 'vi',
): string {
  return formatDate(date, language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string | number,
  language: string = 'vi',
): string {
  const locale = getIntlLocale(language);
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day');
  if (Math.abs(diffDay) < 365) return rtf.format(Math.round(diffDay / 30), 'month');
  return rtf.format(Math.round(diffDay / 365), 'year');
}

/**
 * Format number with locale-specific separators
 */
export function formatNumber(
  value: number,
  language: string = 'vi',
  options?: Intl.NumberFormatOptions,
): string {
  const locale = getIntlLocale(language);
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(
  value: number,
  language: string = 'vi',
  decimals: number = 1,
): string {
  const locale = getIntlLocale(language);
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Vietnamese phone: +84 xxx xxx xxxx
  if (phone.startsWith('+84')) {
    const digits = phone.slice(3);
    if (digits.length === 9) {
      return `+84 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    if (digits.length === 10) {
      return `+84 ${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
  }
  return phone;
}
