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

export const LOCALIZED_ROUTES: readonly LocalizedRoute[] = [
  { english: '/', translations: { [SPANISH_LOCALE]: '/es/', [PORTUGUESE_LOCALE]: '/pt/', [FRENCH_LOCALE]: '/fr/', [GERMAN_LOCALE]: '/de/' } },
  { english: '/herbs/', translations: { [SPANISH_LOCALE]: '/es/hierbas/', [PORTUGUESE_LOCALE]: '/pt/ervas/', [FRENCH_LOCALE]: '/fr/plantes/', [GERMAN_LOCALE]: '/de/kraeuter/' } },
  { english: '/herbs/ashwagandha/', translations: { [SPANISH_LOCALE]: '/es/hierbas/ashwagandha/' } },
  { english: '/compounds/', translations: { [SPANISH_LOCALE]: '/es/compuestos/', [PORTUGUESE_LOCALE]: '/pt/compostos/', [FRENCH_LOCALE]: '/fr/composes/', [GERMAN_LOCALE]: '/de/wirkstoffe/' } },
  { english: '/goals/', translations: { [SPANISH_LOCALE]: '/es/objetivos/', [PORTUGUESE_LOCALE]: '/pt/objetivos/', [FRENCH_LOCALE]: '/fr/objectifs/', [GERMAN_LOCALE]: '/de/ziele/' } },
  { english: '/goals/sleep/', translations: { [SPANISH_LOCALE]: '/es/objetivos/sueno/', [PORTUGUESE_LOCALE]: '/pt/objetivos/sono/', [FRENCH_LOCALE]: '/fr/objectifs/sommeil/', [GERMAN_LOCALE]: '/de/ziele/schlaf/' } },
  { english: '/goals/stress/', translations: { [SPANISH_LOCALE]: '/es/objetivos/estres/', [PORTUGUESE_LOCALE]: '/pt/objetivos/estresse/', [FRENCH_LOCALE]: '/fr/objectifs/stress/', [GERMAN_LOCALE]: '/de/ziele/stress/' } },
  { english: '/goals/anxiety/', translations: { [SPANISH_LOCALE]: '/es/objetivos/ansiedad/', [PORTUGUESE_LOCALE]: '/pt/objetivos/ansiedade/', [FRENCH_LOCALE]: '/fr/objectifs/anxiete/', [GERMAN_LOCALE]: '/de/ziele/angst/' } },
  { english: '/goals/focus/', translations: { [SPANISH_LOCALE]: '/es/objetivos/concentracion/', [PORTUGUESE_LOCALE]: '/pt/objetivos/foco/', [FRENCH_LOCALE]: '/fr/objectifs/concentration/', [GERMAN_LOCALE]: '/de/ziele/fokus/' } },
  { english: '/info/methodology/', translations: { [SPANISH_LOCALE]: '/es/metodologia/', [PORTUGUESE_LOCALE]: '/pt/metodologia/', [FRENCH_LOCALE]: '/fr/methodologie/', [GERMAN_LOCALE]: '/de/methodik/' } },
  { english: '/safety-checker/', translations: { [SPANISH_LOCALE]: '/es/seguridad/', [PORTUGUESE_LOCALE]: '/pt/seguranca/', [FRENCH_LOCALE]: '/fr/securite/', [GERMAN_LOCALE]: '/de/sicherheit/' } },
] as const

export const LOCALIZED_ROUTE_PAIRS: readonly LocalizedRoutePair[] = LOCALIZED_ROUTES.filter((route) => route.translations[SPANISH_LOCALE]).map((route) => ({ english: route.english, spanish: route.translations[SPANISH_LOCALE] as string }))
const withLeadingSlash = (path: string) => (!path ? '/' : path.startsWith('/') ? path : `/${path}`)
const withTrailingSlash = (path: string) => (!path || path === '/' || path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) ? path || '/' : `${path}/`)
export function normalizeInternationalPath(path = '/') { return withTrailingSlash(new URL(withLeadingSlash(path), SITE_URL).pathname) }
export function buildLocaleUrl(path = '/') { return new URL(normalizeInternationalPath(path), SITE_URL).toString() }
export function buildDefaultLocaleUrl(path = '/') { return buildLocaleUrl(path) }
function findLocalizedRoute(path = '/'): LocalizedRoute | undefined {
  const normalized = normalizeInternationalPath(path)
  return LOCALIZED_ROUTES.find((candidate) => normalizeInternationalPath(candidate.english) === normalized || Object.values(candidate.translations).some((localizedPath) => localizedPath && normalizeInternationalPath(localizedPath) === normalized))
}
export function getLocalizedRoute(path = '/', locale: SupportedLocale): string | null {
  const route = findLocalizedRoute(path)
  if (!route) return null
  if (locale === DEFAULT_LOCALE) return normalizeInternationalPath(route.english)
  const translated = route.translations[locale]
  return translated ? normalizeInternationalPath(translated) : null
}
export function hasLocaleTranslation(path = '/', locale: TranslationLocale): boolean { return Boolean(getLocalizedRoute(path, locale)) }
export function hasSpanishTranslation(path = '/'): boolean { return hasLocaleTranslation(path, SPANISH_LOCALE) }
export function getCurrentLocaleAlternates(path = '/'): LocaleAlternate[] {
  const route = findLocalizedRoute(path)
  if (!route) { const url = buildDefaultLocaleUrl(path); return [{ locale: DEFAULT_LOCALE, url }, { locale: 'x-default', url }] }
  const englishUrl = buildLocaleUrl(route.english)
  const alternates: LocaleAlternate[] = [{ locale: DEFAULT_LOCALE, url: englishUrl }]
  for (const locale of SUPPORTED_LOCALES) { if (locale === DEFAULT_LOCALE) continue; const localizedPath = route.translations[locale]; if (localizedPath) alternates.push({ locale, url: buildLocaleUrl(localizedPath) }) }
  alternates.push({ locale: 'x-default', url: englishUrl })
  return alternates
}
export function getLocaleMetadata(path = '/', locale: SupportedLocale = DEFAULT_LOCALE) {
  const config = LOCALE_CONFIG[locale]
  return { language: config.language, locale, openGraphLocale: config.openGraphLocale, region: config.region, textDirection: config.textDirection, alternates: getCurrentLocaleAlternates(path) }
}
