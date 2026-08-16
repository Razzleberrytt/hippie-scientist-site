import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  DEFAULT_LANGUAGE,
  DEFAULT_REGION,
  LOCALIZED_ROUTE_PAIRS,
  LOCALE_TEXT_DIRECTION,
  SPANISH_LOCALE,
  SUPPORTED_LOCALES,
  buildDefaultLocaleUrl,
  getCurrentLocaleAlternates,
  getLocaleMetadata,
  getLocalizedRoute,
  normalizeInternationalPath,
} from '../international-seo'
import { shouldIndexRoute } from '../seo'

describe('international SEO helpers', () => {
  it('declares English as the default and Spanish as a supported locale', () => {
    expect(DEFAULT_LOCALE).toBe('en-US')
    expect(DEFAULT_LANGUAGE).toBe('en')
    expect(DEFAULT_REGION).toBe('US')
    expect(LOCALE_TEXT_DIRECTION).toBe('ltr')
    expect(SPANISH_LOCALE).toBe('es')
    expect(SUPPORTED_LOCALES).toEqual(['en-US', 'es'])
  })

  it('normalizes paths for locale alternates without query strings', () => {
    expect(normalizeInternationalPath('/guides/sleep?utm_source=test')).toBe('/guides/sleep/')
    expect(normalizeInternationalPath('/robots.txt')).toBe('/robots.txt')
  })

  it('builds translated hreflang pairs only for published Spanish equivalents', () => {
    expect(getCurrentLocaleAlternates('/herbs/')).toEqual([
      { locale: 'en-US', url: 'https://thehippiescientist.net/herbs/' },
      { locale: 'es', url: 'https://thehippiescientist.net/es/hierbas/' },
      { locale: 'x-default', url: 'https://thehippiescientist.net/herbs/' },
    ])

    expect(getCurrentLocaleAlternates('/herbs/ashwagandha/')).toEqual([
      { locale: 'en-US', url: 'https://thehippiescientist.net/herbs/ashwagandha/' },
      { locale: 'x-default', url: 'https://thehippiescientist.net/herbs/ashwagandha/' },
    ])
  })

  it('resolves translated routes in both directions', () => {
    expect(getLocalizedRoute('/herbs/', 'es')).toBe('/es/hierbas/')
    expect(getLocalizedRoute('/es/hierbas/', 'en-US')).toBe('/herbs/')
    expect(getLocalizedRoute('/goals/sleep', 'es')).toBe('/es/objetivos/sueno/')
  })

  it('builds the default locale homepage URL', () => {
    expect(buildDefaultLocaleUrl('/')).toBe('https://thehippiescientist.net/')
  })

  it('exposes locale metadata for both language versions', () => {
    expect(getLocaleMetadata('/').alternates).toHaveLength(3)
    expect(getLocaleMetadata('/').openGraphLocale).toBe('en_US')
    expect(getLocaleMetadata('/es/', 'es').openGraphLocale).toBe('es_ES')
  })

  it('keeps every published Spanish translation indexable', () => {
    for (const pair of LOCALIZED_ROUTE_PAIRS) {
      const decision = shouldIndexRoute(pair.spanish)
      expect(decision.index, `${pair.spanish} should be indexable`).toBe(true)
      expect(decision.follow).toBe(true)
    }
  })

  it('does not contain duplicate translation paths', () => {
    const english = LOCALIZED_ROUTE_PAIRS.map((pair) => pair.english)
    const spanish = LOCALIZED_ROUTE_PAIRS.map((pair) => pair.spanish)
    expect(new Set(english).size).toBe(english.length)
    expect(new Set(spanish).size).toBe(spanish.length)
  })
})
