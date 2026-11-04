import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { createLocaleMatcher } from '@euler/ui-core/i18n';
import enResources from './locales/en.json';
import zhHansResources from './locales/zh-Hans.json';

const STORAGE_KEY = 'entrance.locale';

// Locale negotiation is shared with the rest of the org via @euler/ui-core
// (antd-free, so it fits this consumer-facing app). The array order drives
// any language switcher; `en` is the fallback.
const matcher = createLocaleMatcher(['zh-Hans', 'en'], 'en');
const SUPPORTED_LOCALES = matcher.supportedLocales;
const DEFAULT_LOCALE = matcher.defaultLocale;

function readStoredLocale(): string | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return matcher.isSupported(stored) ? stored : null;
  } catch {
    return null;
  }
}

function pickInitial(): string {
  const stored = readStoredLocale();
  if (stored) return stored;
  const requested = typeof navigator !== 'undefined'
    ? (navigator.languages ?? [navigator.language].filter(Boolean))
    : [];
  return matcher.resolveLocale(requested);
}

const initialLocale = pickInitial();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'en': { translation: enResources },
      'zh-Hans': { translation: zhHansResources },
    },
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    load: 'currentOnly',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLocale;
}

/**
 * Switch the active locale, persist the choice and sync the
 * html lang attribute. Unsupported tags are ignored.
 */
export function setLocale(tag: string): void {
  if (!matcher.isSupported(tag)) return;
  void i18n.changeLanguage(tag);
  try {
    window.localStorage.setItem(STORAGE_KEY, tag);
  } catch {
    /* ignore quota / privacy errors */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = tag;
  }
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE };
export default i18n;
