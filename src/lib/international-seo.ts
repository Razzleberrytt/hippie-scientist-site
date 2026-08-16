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

export const PORTUGUESE_LOCALE = 'pt-BR'
export const PORTUGUESE_OG_LOCALE = 'pt_BR'
export const PORTUGUESE_LANGUAGE = 'pt'

export const FRENCH_LOCALE = 'fr'
export const FRENCH_OG_LOCALE = 'fr_FR'
export const FRENCH_LANGUAGE = 'fr'

export const GERMAN_LOCALE = 'de'
export const GERMAN_OG_LOCALE = 'de_DE'
export const GERMAN_LANGUAGE = 'de'

export const SUPPORTED_LOCALES = [DEFAULT_LOCALE, SPANISH_LOCALE, PORTUGUESE_LOCALE, FRENCH_LOCALE, GERMAN_LOCALE] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export type TranslationLocale = Exclude<SupportedLocale, typeof DEFAULT_LOCALE>

export type LocaleAlternate = { locale: SupportedLocale | 'x-default'; url: string }
export type LocalizedRoute = { english: string; translations: Partial<Record<TranslationLocale, string>> }
export type LocalizedRoutePair = { english: string; spanish: string }

export const LOCALE_CONFIG: Record<SupportedLocale, { language: string; openGraphLocale: string; region?: string; textDirection: 'ltr' | 'rtl' }> = {
  [DEFAULT_LOCALE]: { language: DEFAULT_LANGUAGE, openGraphLocale: DEFAULT_OG_LOCALE, region: DEFAULT_REGION, textDirection: 'ltr' },
  [SPANISH_LOCALE]: { language: SPANISH_LANGUAGE, openGraphLocale: SPANISH_OG_LOCALE, textDirection: 'ltr' },
  [PORTUGUESE_LOCALE]: { language: PORTUGUESE_LANGUAGE, openGraphLocale: PORTUGUESE_OG_LOCALE, region: 'BR', textDirection: 'ltr' },
  [FRENCH_LOCALE]: { language: FRENCH_LANGUAGE, openGraphLocale: FRENCH_OG_LOCALE, textDirection: 'ltr' },
  [GERMAN_LOCALE]: { language: GERMAN_LANGUAGE, openGraphLocale: GERMAN_OG_LOCALE, textDirection: 'ltr' },
}

/** Only publish locale paths after substantive translated content exists. */
export const LOCALIZED_ROUTES: readonly LocalizedRoute[] = [
  { english: '/', translations: { [SPANISH_LOCALE]: '/es/', [PORTUGUESE_LOCALE]: '/pt/' } },
  { english: '/herbs/', translations: { [SPANISH_LOCALE]: '/es/hierbas/', [PORTUGUESE_LOCALE]: '/pt/ervas/' } },
  { english: '/compounds/', translations: { [SPANISH_LOCALE]: '/es/compuestos/', [PORTUGUESE_LOCALE]: '/pt/compostos/' } },
  { english: '/goals/', translations: { [SPANISH_LOCALE]: '/es/objetivos/', [PORTUGUESE_LOCALE]: '/pt/objetivos/' } },
  { english: '/goals/sleep/', translations: { [SPANISH_LOCALE]: '/es/objetivos/sueno/', [PORTUGUESE_LOCALE]: '/pt/objetivos/sono/' } },
  { english: '/goals/stress/', translations: { [SPANISH_LOCALE]: '/es/objetivos/estres/', [PORTUGUESE_LOCALE]: '/pt/objetivos/estresse/' } },
  { english: '/goals/anxiety/', translations: { [SPANISH_LOCALE]: '/es/objetivos/ansiedad/', [PORTUGUESE_LOCALE]: '/pt/objetivos/ansiedade/' } },
  { english: '/goals/focus/', translations: { [SPANISH_LOCALE]: '/es/objetivos/concentracion/', [PORTUGUESE_LOCALE]: '/pt/objetivos/foco/' } },
  { english: '/info/methodology/', translations: { [SPANISH_LOCALE]: '/es/metodologia/', [PORTUGUESE_LOCALE]: '/pt/metodologia/' } },
  { english: '/safety-checker/', translations: { [SPANISH_LOCALE]: '/es/seguridad/', [PORTUGUESE_LOCALE]: '/pt/seguranca/' } },
] as const

/** Backward-compatible Spanish-only view for existing validators/tests. */
export const LOCALIZED_ROUTE_PAIRS: readonly LocalizedRoutePair[] = LOCALIZED_ROUTES
  .filter((route) => route.translations[SPANISH_LOCALE])
  .map((route) => ({ english: route.english, spanish: route.translations[SPANISH_LOCALE] as string }))

const withLeadingSlash = (path: string) => (!path ? '/' : path.startsWith('/') ? path : `/${path}`)
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

function findLocalizedRoute(path = '/'): LocalizedRoute | undefined {
  const normalized = normalizeInternationalPath(path)
  return LOCALIZED_ROUTES.find((candidate) => {
    if (normalizeInternationalPath(candidate.english) === normalized) return true
    return Object.values(candidate.translations).some((localizedPath) => localizedPath && normalizeInternationalPath(localizedPath) === normalized)
  })
}

export function getLocalizedRoute(path = '/', locale: SupportedLocale): string | null {
  const route = findLocalizedRoute(path)
  if (!route) return null
  if (locale === DEFAULT_LOCALE) return normalizeInternationalPath(route.english)
  const translated = route.translations[locale]
  return translated ? normalizeInternationalPath(translated) : null
}

export function hasLocaleTranslation(path = '/', locale: TranslationLocale): boolean {
  return Boolean(getLocalizedRoute(path, locale))
}

export function hasSpanishTranslation(path = '/'): boolean {
  return hasLocaleTranslation(path, SPANISH_LOCALE)
}

export function getCurrentLocaleAlternates(path = '/'): LocaleAlternate[] {
  const route = findLocalizedRoute(path)
  if (!route) {
    const url = buildDefaultLocaleUrl(path)
    return [{ locale: DEFAULT_LOCALE, url }, { locale: 'x-default', url }]
  }

  const englishUrl = buildLocaleUrl(route.english)
  const alternates: LocaleAlternate[] = [{ locale: DEFAULT_LOCALE, url: englishUrl }]
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue
    const localizedPath = route.translations[locale]
    if (localizedPath) alternates.push({ locale, url: buildLocaleUrl(localizedPath) })
  }
  alternates.push({ locale: 'x-default', url: englishUrl })
  return alternates
}

export function getLocaleMetadata(path = '/', locale: SupportedLocale = DEFAULT_LOCALE) {
  const config = LOCALE_CONFIG[locale]
  return {
    language: config.language,
    locale,
    openGraphLocale: config.openGraphLocale,
    region: config.region,
    textDirection: config.textDirection,
    alternates: getCurrentLocaleAlternates(path),
  }
}
