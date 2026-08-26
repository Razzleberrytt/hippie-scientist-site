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
export const ITALIAN_LOCALE = 'it'
export const ITALIAN_OG_LOCALE = 'it_IT'
export const ITALIAN_LANGUAGE = 'it'
export const DUTCH_LOCALE = 'nl'
export const DUTCH_OG_LOCALE = 'nl_NL'
export const DUTCH_LANGUAGE = 'nl'
export const POLISH_LOCALE = 'pl'
export const POLISH_OG_LOCALE = 'pl_PL'
export const POLISH_LANGUAGE = 'pl'
export const JAPANESE_LOCALE = 'ja'
export const JAPANESE_OG_LOCALE = 'ja_JP'
export const JAPANESE_LANGUAGE = 'ja'
export const KOREAN_LOCALE = 'ko'
export const KOREAN_OG_LOCALE = 'ko_KR'
export const KOREAN_LANGUAGE = 'ko'

export const SUPPORTED_LOCALES = [
  DEFAULT_LOCALE,
  SPANISH_LOCALE,
  PORTUGUESE_LOCALE,
  FRENCH_LOCALE,
  GERMAN_LOCALE,
  ITALIAN_LOCALE,
  DUTCH_LOCALE,
  POLISH_LOCALE,
  JAPANESE_LOCALE,
  KOREAN_LOCALE,
] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export type TranslationLocale = Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
export type LocaleAlternate = { locale: SupportedLocale | 'x-default'; url: string }
export type LocalizedRoute = { english: string; translations: Partial<Record<TranslationLocale, string>> }
export type LocalizedRoutePair = { english: string; spanish: string }

export type LocaleConfig = {
  language: string
  openGraphLocale: string
  region?: string
  textDirection: 'ltr' | 'rtl'
  pathPrefix: string
  shortLabel: string
  languageLabel: string
}

export const LOCALE_CONFIG: Record<SupportedLocale, LocaleConfig> = {
  [DEFAULT_LOCALE]: { language: DEFAULT_LANGUAGE, openGraphLocale: DEFAULT_OG_LOCALE, region: DEFAULT_REGION, textDirection: 'ltr', pathPrefix: '/', shortLabel: 'EN', languageLabel: 'English' },
  [SPANISH_LOCALE]: { language: SPANISH_LANGUAGE, openGraphLocale: SPANISH_OG_LOCALE, textDirection: 'ltr', pathPrefix: '/es/', shortLabel: 'ES', languageLabel: 'Español' },
  [PORTUGUESE_LOCALE]: { language: PORTUGUESE_LANGUAGE, openGraphLocale: PORTUGUESE_OG_LOCALE, region: 'BR', textDirection: 'ltr', pathPrefix: '/pt/', shortLabel: 'PT', languageLabel: 'Português' },
  [FRENCH_LOCALE]: { language: FRENCH_LANGUAGE, openGraphLocale: FRENCH_OG_LOCALE, textDirection: 'ltr', pathPrefix: '/fr/', shortLabel: 'FR', languageLabel: 'Français' },
  [GERMAN_LOCALE]: { language: GERMAN_LANGUAGE, openGraphLocale: GERMAN_OG_LOCALE, textDirection: 'ltr', pathPrefix: '/de/', shortLabel: 'DE', languageLabel: 'Deutsch' },
  [ITALIAN_LOCALE]: { language: ITALIAN_LANGUAGE, openGraphLocale: ITALIAN_OG_LOCALE, region: 'IT', textDirection: 'ltr', pathPrefix: '/it/', shortLabel: 'IT', languageLabel: 'Italiano' },
  [DUTCH_LOCALE]: { language: DUTCH_LANGUAGE, openGraphLocale: DUTCH_OG_LOCALE, region: 'NL', textDirection: 'ltr', pathPrefix: '/nl/', shortLabel: 'NL', languageLabel: 'Nederlands' },
  [POLISH_LOCALE]: { language: POLISH_LANGUAGE, openGraphLocale: POLISH_OG_LOCALE, region: 'PL', textDirection: 'ltr', pathPrefix: '/pl/', shortLabel: 'PL', languageLabel: 'Polski' },
  [JAPANESE_LOCALE]: { language: JAPANESE_LANGUAGE, openGraphLocale: JAPANESE_OG_LOCALE, region: 'JP', textDirection: 'ltr', pathPrefix: '/ja/', shortLabel: 'JA', languageLabel: '日本語' },
  [KOREAN_LOCALE]: { language: KOREAN_LANGUAGE, openGraphLocale: KOREAN_OG_LOCALE, region: 'KR', textDirection: 'ltr', pathPrefix: '/ko/', shortLabel: 'KO', languageLabel: '한국어' },
}

export const CORE_LOCALIZED_ENGLISH_ROUTES = [
  '/',
  '/herbs/',
  '/compounds/',
  '/goals/',
  '/goals/sleep/',
  '/goals/stress/',
  '/goals/anxiety/',
  '/goals/focus/',
  '/info/methodology/',
  '/safety-checker/',
] as const

export const LOCALIZED_ROUTES: readonly LocalizedRoute[] = [
  { english: '/', translations: { [SPANISH_LOCALE]: '/es/', [PORTUGUESE_LOCALE]: '/pt/', [FRENCH_LOCALE]: '/fr/', [GERMAN_LOCALE]: '/de/', [ITALIAN_LOCALE]: '/it/', [DUTCH_LOCALE]: '/nl/', [POLISH_LOCALE]: '/pl/', [JAPANESE_LOCALE]: '/ja/', [KOREAN_LOCALE]: '/ko/' } },
  { english: '/herbs/', translations: { [SPANISH_LOCALE]: '/es/hierbas/', [PORTUGUESE_LOCALE]: '/pt/ervas/', [FRENCH_LOCALE]: '/fr/plantes/', [GERMAN_LOCALE]: '/de/kraeuter/', [ITALIAN_LOCALE]: '/it/erbe/', [DUTCH_LOCALE]: '/nl/kruiden/', [POLISH_LOCALE]: '/pl/ziola/', [JAPANESE_LOCALE]: '/ja/herbs/', [KOREAN_LOCALE]: '/ko/herbs/' } },
  { english: '/herbs/ashwagandha/', translations: { [SPANISH_LOCALE]: '/es/hierbas/ashwagandha/', [PORTUGUESE_LOCALE]: '/pt/ervas/ashwagandha/', [FRENCH_LOCALE]: '/fr/plantes/ashwagandha/', [GERMAN_LOCALE]: '/de/kraeuter/ashwagandha/' } },
  { english: '/compounds/', translations: { [SPANISH_LOCALE]: '/es/compuestos/', [PORTUGUESE_LOCALE]: '/pt/compostos/', [FRENCH_LOCALE]: '/fr/composes/', [GERMAN_LOCALE]: '/de/wirkstoffe/', [ITALIAN_LOCALE]: '/it/composti/', [DUTCH_LOCALE]: '/nl/stoffen/', [POLISH_LOCALE]: '/pl/skladniki/', [JAPANESE_LOCALE]: '/ja/compounds/', [KOREAN_LOCALE]: '/ko/compounds/' } },
  { english: '/compounds/l-theanine/', translations: { [SPANISH_LOCALE]: '/es/compuestos/l-theanine/', [PORTUGUESE_LOCALE]: '/pt/compostos/l-theanine/', [FRENCH_LOCALE]: '/fr/composes/l-theanine/', [GERMAN_LOCALE]: '/de/wirkstoffe/l-theanine/' } },
  { english: '/goals/', translations: { [SPANISH_LOCALE]: '/es/objetivos/', [PORTUGUESE_LOCALE]: '/pt/objetivos/', [FRENCH_LOCALE]: '/fr/objectifs/', [GERMAN_LOCALE]: '/de/ziele/', [ITALIAN_LOCALE]: '/it/obiettivi/', [DUTCH_LOCALE]: '/nl/doelen/', [POLISH_LOCALE]: '/pl/cele/', [JAPANESE_LOCALE]: '/ja/goals/', [KOREAN_LOCALE]: '/ko/goals/' } },
  { english: '/goals/sleep/', translations: { [SPANISH_LOCALE]: '/es/objetivos/sueno/', [PORTUGUESE_LOCALE]: '/pt/objetivos/sono/', [FRENCH_LOCALE]: '/fr/objectifs/sommeil/', [GERMAN_LOCALE]: '/de/ziele/schlaf/', [ITALIAN_LOCALE]: '/it/obiettivi/sonno/', [DUTCH_LOCALE]: '/nl/doelen/slaap/', [POLISH_LOCALE]: '/pl/cele/sen/', [JAPANESE_LOCALE]: '/ja/goals/sleep/', [KOREAN_LOCALE]: '/ko/goals/sleep/' } },
  { english: '/goals/stress/', translations: { [SPANISH_LOCALE]: '/es/objetivos/estres/', [PORTUGUESE_LOCALE]: '/pt/objetivos/estresse/', [FRENCH_LOCALE]: '/fr/objectifs/stress/', [GERMAN_LOCALE]: '/de/ziele/stress/', [ITALIAN_LOCALE]: '/it/obiettivi/stress/', [DUTCH_LOCALE]: '/nl/doelen/stress/', [POLISH_LOCALE]: '/pl/cele/stres/', [JAPANESE_LOCALE]: '/ja/goals/stress/', [KOREAN_LOCALE]: '/ko/goals/stress/' } },
  { english: '/goals/anxiety/', translations: { [SPANISH_LOCALE]: '/es/objetivos/ansiedad/', [PORTUGUESE_LOCALE]: '/pt/objetivos/ansiedade/', [FRENCH_LOCALE]: '/fr/objectifs/anxiete/', [GERMAN_LOCALE]: '/de/ziele/angst/', [ITALIAN_LOCALE]: '/it/obiettivi/ansia/', [DUTCH_LOCALE]: '/nl/doelen/angst/', [POLISH_LOCALE]: '/pl/cele/lek/', [JAPANESE_LOCALE]: '/ja/goals/anxiety/', [KOREAN_LOCALE]: '/ko/goals/anxiety/' } },
  { english: '/goals/focus/', translations: { [SPANISH_LOCALE]: '/es/objetivos/concentracion/', [PORTUGUESE_LOCALE]: '/pt/objetivos/foco/', [FRENCH_LOCALE]: '/fr/objectifs/concentration/', [GERMAN_LOCALE]: '/de/ziele/fokus/', [ITALIAN_LOCALE]: '/it/obiettivi/concentrazione/', [DUTCH_LOCALE]: '/nl/doelen/focus/', [POLISH_LOCALE]: '/pl/cele/koncentracja/', [JAPANESE_LOCALE]: '/ja/goals/focus/', [KOREAN_LOCALE]: '/ko/goals/focus/' } },
  { english: '/info/methodology/', translations: { [SPANISH_LOCALE]: '/es/metodologia/', [PORTUGUESE_LOCALE]: '/pt/metodologia/', [FRENCH_LOCALE]: '/fr/methodologie/', [GERMAN_LOCALE]: '/de/methodik/', [ITALIAN_LOCALE]: '/it/metodologia/', [DUTCH_LOCALE]: '/nl/methodologie/', [POLISH_LOCALE]: '/pl/metodologia/', [JAPANESE_LOCALE]: '/ja/methodology/', [KOREAN_LOCALE]: '/ko/methodology/' } },
  { english: '/safety-checker/', translations: { [SPANISH_LOCALE]: '/es/seguridad/', [PORTUGUESE_LOCALE]: '/pt/seguranca/', [FRENCH_LOCALE]: '/fr/securite/', [GERMAN_LOCALE]: '/de/sicherheit/', [ITALIAN_LOCALE]: '/it/sicurezza/', [DUTCH_LOCALE]: '/nl/veiligheid/', [POLISH_LOCALE]: '/pl/bezpieczenstwo/', [JAPANESE_LOCALE]: '/ja/safety/', [KOREAN_LOCALE]: '/ko/safety/' } },
] as const

export const LOCALIZED_ROUTE_PAIRS: readonly LocalizedRoutePair[] = LOCALIZED_ROUTES.filter((route) => route.translations[SPANISH_LOCALE]).map((route) => ({ english: route.english, spanish: route.translations[SPANISH_LOCALE] as string }))

const withLeadingSlash = (path: string) => (!path ? '/' : path.startsWith('/') ? path : `/${path}`)
const withTrailingSlash = (path: string) => (!path || path === '/' || path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) ? path || '/' : `${path}/`)

export function normalizeInternationalPath(path = '/') {
  return withTrailingSlash(new URL(withLeadingSlash(path), SITE_URL).pathname)
}

export function buildLocaleUrl(path = '/') { return new URL(normalizeInternationalPath(path), SITE_URL).toString() }
export function buildDefaultLocaleUrl(path = '/') { return buildLocaleUrl(path) }

export function getLocalePathPrefix(locale: SupportedLocale) {
  return LOCALE_CONFIG[locale].pathPrefix
}

export function getLocaleFromPathname(pathname: string | null | undefined): SupportedLocale {
  const path = withLeadingSlash(pathname || '/')
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue
    const prefix = LOCALE_CONFIG[locale].pathPrefix
    const root = prefix.slice(0, -1)
    if (path === root || path.startsWith(prefix)) return locale
  }
  return DEFAULT_LOCALE
}

function findLocalizedRoute(path = '/'): LocalizedRoute | undefined {
  const normalized = normalizeInternationalPath(path)
  return LOCALIZED_ROUTES.find((candidate) => normalizeInternationalPath(candidate.english) === normalized || Object.values(candidate.translations).some((localizedPath) => localizedPath && normalizeInternationalPath(localizedPath) === normalized))
}

/** True when `path` is a translation this site actually publishes. */
export function isPublishedTranslationPath(path = '/'): boolean {
  const normalized = normalizeInternationalPath(path)
  return LOCALIZED_ROUTES.some((route) =>
    Object.values(route.translations).some(
      (translated) => translated && normalizeInternationalPath(translated) === normalized,
    ),
  )
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
  return { language: config.language, locale, openGraphLocale: config.openGraphLocale, region: config.region, textDirection: config.textDirection, alternates: getCurrentLocaleAlternates(path) }
}
