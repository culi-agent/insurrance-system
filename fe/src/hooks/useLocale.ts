import { useTranslation } from 'react-i18next';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatPercent,
  formatPhoneNumber,
} from '@/lib/formatters';

/**
 * Custom hook that combines i18n translation with locale-aware formatters
 * Usage:
 *   const { t, lang, fmt } = useLocale();
 *   fmt.currency(1500000)  → "1.500.000 ₫" (vi) or "1,500,000 VND" (en)
 *   fmt.date(new Date())   → "15/05/2026" (vi) or "05/15/2026" (en)
 */
export function useLocale() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'vi';

  const fmt = {
    currency: (amount: number, currency?: string) => formatCurrency(amount, lang, currency),
    currencyCompact: (amount: number) => formatCurrencyCompact(amount, lang),
    date: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, lang, options),
    dateTime: (date: Date | string | number) => formatDateTime(date, lang),
    relativeTime: (date: Date | string | number) => formatRelativeTime(date, lang),
    number: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(value, lang, options),
    percent: (value: number, decimals?: number) => formatPercent(value, lang, decimals),
    phone: formatPhoneNumber,
  };

  return { t, i18n, lang, fmt };
}
