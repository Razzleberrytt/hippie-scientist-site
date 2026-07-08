import { SITE_URL } from './site'

export const DEFAULT_LOCALE = 'en-US'
export const DEFAULT_OG_LOCALE = 'en_US'
export const DEFAULT_LANGUAGE = 'en'
export const DEFAULT_REGION = 'US'
export const LOCALE_TEXT_DIRECTION = 'ltr'

export const SUPPORTED_LOCALES = [DEFAULT_LOCALE] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export type LocaleAlternate = {
  locale: SupportedLocale | 'x-default'
  url: string
}

const withLeadingSlash = (path: string) => {
  if (!path) return '/'
  return path.startsWith('/') ? path : `/${path}`
}

const withTrailingSlash = (path: string) => {
  if (!path || path === '/') return '/'
  if (path.endsWith('/')) return path
  if (/\.[a-z0-9]+$/i.test(path)) return path
  return `${path}/`
}

export function normalizeInternationalPath(path = '/') {
  const url = new URL(withLeadingSlash(path), SITE_URL)
  return withTrailingSlash(url.pathname)
}

export function buildDefaultLocaleUrl(path = '/') {
  return new URL(normalizeInternationalPath(path), SITE_URL).toString()
}

/**
 * Safe current-state alternates.
 *
 * The site currently publishes one English locale. Do not add translated hreflang
 * entries until the translated URL exists and has equivalent content.
 */
export function getCurrentLocaleAlternates(path = '/'): LocaleAlternate[] {
  const url = buildDefaultLocaleUrl(path)
  return [
    { locale: DEFAULT_LOCALE, url },
    { locale: 'x-default', url },
  ]
}

export function getLocaleMetadata(path = '/') {
  return {
    language: DEFAULT_LANGUAGE,
    locale: DEFAULT_LOCALE,
    openGraphLocale: DEFAULT_OG_LOCALE,
    region: DEFAULT_REGION,
    textDirection: LOCALE_TEXT_DIRECTION,
    alternates: getCurrentLocaleAlternates(path),
  }
}
