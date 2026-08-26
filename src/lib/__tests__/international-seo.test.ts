import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  DEFAULT_LANGUAGE,
  DEFAULT_REGION,
  LOCALIZED_ROUTE_PAIRS,
  LOCALIZED_ROUTES,
  LOCALE_TEXT_DIRECTION,
  SPANISH_LOCALE,
  SUPPORTED_LOCALES,
  buildDefaultLocaleUrl,
  getCurrentLocaleAlternates,
  getLocaleFromPathname,
  getLocaleMetadata,
  getLocalizedRoute,
  normalizeInternationalPath,
} from '../international-seo'
import { shouldIndexRoute } from '../seo'

describe('international SEO helpers', () => {
  it('declares English as the default and every published translation as supported', () => {
    expect(DEFAULT_LOCALE).toBe('en-US')
    expect(DEFAULT_LANGUAGE).toBe('en')
    expect(DEFAULT_REGION).toBe('US')
    expect(LOCALE_TEXT_DIRECTION).toBe('ltr')
    expect(SPANISH_LOCALE).toBe('es')
    expect(SUPPORTED_LOCALES).toEqual(['en-US', 'es', 'pt-BR', 'fr', 'de', 'it', 'nl', 'pl', 'ja', 'ko'])
  })

  it('normalizes paths for locale alternates without query strings', () => {
    expect(normalizeInternationalPath('/guides/sleep?utm_source=test')).toBe('/guides/sleep/')
    expect(normalizeInternationalPath('/robots.txt')).toBe('/robots.txt')
  })

  it('detects locale prefixes from the canonical locale registry', () => {
    expect(getLocaleFromPathname('/')).toBe('en-US')
    expect(getLocaleFromPathname('/pt')).toBe('pt-BR')
    expect(getLocaleFromPathname('/ja/goals/sleep/')).toBe('ja')
    expect(getLocaleFromPathname('/ko/safety/')).toBe('ko')
    expect(getLocaleFromPathname('/herbs/ashwagandha/')).toBe('en-US')
  })

  it('builds translated hreflang pairs only for routes that have published equivalents', () => {
    expect(getCurrentLocaleAlternates('/herbs/')).toEqual([
      { locale: 'en-US', url: 'https://thehippiescientist.net/herbs/' },
      { locale: 'es', url: 'https://thehippiescientist.net/es/hierbas/' },
      { locale: 'pt-BR', url: 'https://thehippiescientist.net/pt/ervas/' },
      { locale: 'fr', url: 'https://thehippiescientist.net/fr/plantes/' },
      { locale: 'de', url: 'https://thehippiescientist.net/de/kraeuter/' },
      { locale: 'it', url: 'https://thehippiescientist.net/it/erbe/' },
      { locale: 'nl', url: 'https://thehippiescientist.net/nl/kruiden/' },
      { locale: 'pl', url: 'https://thehippiescientist.net/pl/ziola/' },
      { locale: 'ja', url: 'https://thehippiescientist.net/ja/herbs/' },
      { locale: 'ko', url: 'https://thehippiescientist.net/ko/herbs/' },
      { locale: 'x-default', url: 'https://thehippiescientist.net/herbs/' },
    ])

    expect(getCurrentLocaleAlternates('/herbs/ashwagandha/').map((alternate) => alternate.locale)).toEqual([
      'en-US', 'es', 'pt-BR', 'fr', 'de', 'x-default',
    ])

    expect(getCurrentLocaleAlternates('/herbs/turmeric/')).toEqual([
      { locale: 'en-US', url: 'https://thehippiescientist.net/herbs/turmeric/' },
      { locale: 'x-default', url: 'https://thehippiescientist.net/herbs/turmeric/' },
    ])
  })

  it('resolves translated routes in both directions and fails closed for unpublished profile locales', () => {
    expect(getLocalizedRoute('/herbs/', 'es')).toBe('/es/hierbas/')
    expect(getLocalizedRoute('/es/hierbas/', 'en-US')).toBe('/herbs/')
    expect(getLocalizedRoute('/goals/sleep', 'es')).toBe('/es/objetivos/sueno/')
    expect(getLocalizedRoute('/herbs/', 'it')).toBe('/it/erbe/')
    expect(getLocalizedRoute('/nl/doelen/slaap/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/goals/anxiety/', 'pl')).toBe('/pl/cele/lek/')
    expect(getLocalizedRoute('/goals/focus/', 'ja')).toBe('/ja/goals/focus/')
    expect(getLocalizedRoute('/ko/goals/sleep/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/herbs/ashwagandha/', 'it')).toBeNull()
    expect(getLocalizedRoute('/compounds/l-theanine/', 'ja')).toBeNull()
    expect(getLocalizedRoute('/herbs/ashwagandha/', 'ko')).toBeNull()
  })

  it('builds the default locale homepage URL', () => {
    expect(buildDefaultLocaleUrl('/')).toBe('https://thehippiescientist.net/')
  })

  it('exposes locale metadata for every language version', () => {
    expect(getLocaleMetadata('/').alternates).toHaveLength(SUPPORTED_LOCALES.length + 1)
    expect(getLocaleMetadata('/').openGraphLocale).toBe('en_US')
    expect(getLocaleMetadata('/es/', 'es').openGraphLocale).toBe('es_ES')
    expect(getLocaleMetadata('/it/', 'it').openGraphLocale).toBe('it_IT')
    expect(getLocaleMetadata('/nl/', 'nl').openGraphLocale).toBe('nl_NL')
    expect(getLocaleMetadata('/pl/', 'pl').openGraphLocale).toBe('pl_PL')
    expect(getLocaleMetadata('/ja/', 'ja').openGraphLocale).toBe('ja_JP')
    expect(getLocaleMetadata('/ko/', 'ko').openGraphLocale).toBe('ko_KR')
  })

  it('keeps every published translation indexable, in every locale', () => {
    for (const route of LOCALIZED_ROUTES) {
      for (const translated of Object.values(route.translations)) {
        if (!translated) continue
        const decision = shouldIndexRoute(translated)
        expect(decision.index, `${translated} should be indexable`).toBe(true)
        expect(decision.follow).toBe(true)
      }
    }
  })

  it('does not contain duplicate translation paths', () => {
    const english = LOCALIZED_ROUTE_PAIRS.map((pair) => pair.english)
    const spanish = LOCALIZED_ROUTE_PAIRS.map((pair) => pair.spanish)
    expect(new Set(english).size).toBe(english.length)
    expect(new Set(spanish).size).toBe(spanish.length)
  })
})
