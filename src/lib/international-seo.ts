import { SITE_URL } from './site'

export const DEFAULT_LOCALE = 'en-US'
export const DEFAULT_OG_LOCALE = 'en_US'
export const DEFAULT_LANGUAGE = 'en'
export const DEFAULT_REGION = 'US'
export const LOCALE_TEXT_DIRECTION = 'ltr'

export const SPANISH_LOCALE = 'es'
export const SPANISH_OG_LOCALE = 'es_ES'
export const SPANISH_LANGUAGE = 'es'
export const SPANISH_TEXT_DIRECTION = 'ltr'

export const SUPPORTED_LOCALES = [DEFAULT_LOCALE, SPANISH_LOCALE] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export type LocaleAlternate = {
  locale: SupportedLocale | 'x-default'
  url: string
}

export type LocalizedRoutePair = {
  english: string
  spanish: string
}

/**
 * Canonical translation registry.
 *
 * Only add a pair after the Spanish URL is published with substantive,
 * equivalent editorial content. This prevents hreflang from advertising
 * placeholder, partial, or nonexistent translations.
 */
export const LOCALIZED_ROUTE_PAIRS: readonly LocalizedRoutePair[] = [
  { english: '/', spanish: '/es/' },
  { english: '/herbs/', spanish: '/es/hierbas/' },
  { english: '/compounds/', spanish: '/es/compuestos/' },
  { english: '/goals/', spanish: '/es/objetivos/' },
  { english: '/goals/sleep/', spanish: '/es/objetivos/sueno/' },
  { english: '/goals/stress/', spanish: '/es/objetivos/estres/' },
  { english: '/goals/anxiety/', spanish: '/es/objetivos/ansiedad/' },
  { english: '/goals/focus/', spanish: '/es/objetivos/concentracion/' },
  { english: '/info/methodology/', spanish: '/es/metodologia/' },
  { english: '/safety-checker/', spanish: '/es/seguridad/' },
] as const

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

export function buildLocaleUrl(path = '/') {
  return new URL(normalizeInternationalPath(path), SITE_URL).toString()
}

export function buildDefaultLocaleUrl(path = '/') {
  return buildLocaleUrl(path)
}

export function getLocalizedRoute(path = '/', locale: SupportedLocale): string | null {
  const normalized = normalizeInternationalPath(path)
  const pair = LOCALIZED_ROUTE_PAIRS.find(
    (candidate) =>
      normalizeInternationalPath(candidate.english) === normalized ||
      normalizeInternationalPath(candidate.spanish) === normalized,
  )

  if (!pair) return null
  return locale === SPANISH_LOCALE
    ? normalizeInternationalPath(pair.spanish)
    : normalizeInternationalPath(pair.english)
}

export function hasSpanishTranslation(path = '/'): boolean {
  return Boolean(getLocalizedRoute(path, SPANISH_LOCALE))
}

/**
 * Safe published alternates.
 *
 * Hreflang is emitted only for routes in LOCALIZED_ROUTE_PAIRS. Untranslated
 * English pages continue to advertise only English + x-default so crawlers are
 * never sent to a thin or nonexistent Spanish URL.
 */
export function getCurrentLocaleAlternates(path = '/'): LocaleAlternate[] {
  const normalized = normalizeInternationalPath(path)
  const englishPath = getLocalizedRoute(normalized, DEFAULT_LOCALE)
  const spanishPath = getLocalizedRoute(normalized, SPANISH_LOCALE)

  if (englishPath && spanishPath) {
    const englishUrl = buildLocaleUrl(englishPath)
    return [
      { locale: DEFAULT_LOCALE, url: englishUrl },
      { locale: SPANISH_LOCALE, url: buildLocaleUrl(spanishPath) },
      { locale: 'x-default', url: englishUrl },
    ]
  }

  const url = buildDefaultLocaleUrl(normalized)
  return [
    { locale: DEFAULT_LOCALE, url },
    { locale: 'x-default', url },
  ]
}

export function getLocaleMetadata(path = '/', locale: SupportedLocale = DEFAULT_LOCALE) {
  const isSpanish = locale === SPANISH_LOCALE
  return {
    language: isSpanish ? SPANISH_LANGUAGE : DEFAULT_LANGUAGE,
    locale,
    openGraphLocale: isSpanish ? SPANISH_OG_LOCALE : DEFAULT_OG_LOCALE,
    region: isSpanish ? undefined : DEFAULT_REGION,
    textDirection: isSpanish ? SPANISH_TEXT_DIRECTION : LOCALE_TEXT_DIRECTION,
    alternates: getCurrentLocaleAlternates(path),
  }
}
