import { defineRouting } from 'next-intl/routing'

export const locales = ['fr', 'en', 'ar', 'uk', 'ru', 'ps', 'fa', 'ti', 'es'] as const
export type Locale = (typeof locales)[number]

export const rtlLocales: Locale[] = ['ar', 'ps', 'fa']

export const routing = defineRouting({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
})
