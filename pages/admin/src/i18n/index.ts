import { createConsoleI18n } from '@euler/console-kit/i18n';
import enResources from './locales/en.json';
import zhHansResources from './locales/zh-Hans.json';

/**
 * Admin console i18n bootstrap.
 *
 * The machinery — locale negotiation, antd locale mapping, and the deep merge
 * of @euler/ui-nova a11y strings + console-kit shell strings UNDER this app's
 * bundle — lives in createConsoleI18n. This module only supplies the
 * app-specific config and translation bundles.
 *
 * The app bundle wins on conflicts, so admin's own `nav.*`, `oauth2.*`,
 * `user.*` and `header.logout_error` override the shell defaults, while the
 * generic `common.*` / `descriptions.*` / `breadcrumb.*` / `language.*` come
 * from the packages unless redefined here.
 */
export const consoleI18n = createConsoleI18n({
  storageKey: 'admin.locale',
  supportedLocales: ['zh-Hans', 'en'],
  defaultLocale: 'en',
  resources: {
    en: enResources,
    'zh-Hans': zhHansResources,
  },
});

// Re-exported for any module that still imports these from '@/i18n'.
export const { i18n, setLocale, getAntdLocale } = consoleI18n;
export const SUPPORTED_LOCALES = consoleI18n.supportedLocales;
export const DEFAULT_LOCALE = consoleI18n.defaultLocale;

export default i18n;
