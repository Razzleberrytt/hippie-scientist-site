import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  LOCALE_CONFIG,
  SUPPORTED_LOCALES,
  getCurrentLocaleAlternates,
  getLocalizedRoute,
  type TranslationLocale,
} from '@/src/lib/international-seo'

const translationLocales = SUPPORTED_LOCALES.filter(
  (locale): locale is TranslationLocale => locale !== DEFAULT_LOCALE,
)

describe('multilingual international SEO registry', () => {
  it('resolves the sleep route family across every published core locale', () => {
    expect(getLocalizedRoute('/goals/sleep/', DEFAULT_LOCALE)).toBe('/goals/sleep/')

    for (const locale of translationLocales) {
      const localized = getLocalizedRoute('/goals/sleep/', locale)
      expect(localized, `${locale} must publish the sleep core route`).not.toBeNull()
      expect(localized?.startsWith(LOCALE_CONFIG[locale].pathPrefix)).toBe(true)
      expect(getLocalizedRoute(localized as string, DEFAULT_LOCALE)).toBe('/goals/sleep/')
    }
  })

  it('emits every supported locale plus x-default for a fully translated core route', () => {
    const alternates = getCurrentLocaleAlternates('/goals/sleep/')
    expect(alternates.map((item) => item.locale)).toEqual([
      ...SUPPORTED_LOCALES,
      'x-default',
    ])
  })

  it('keeps translated scientific-profile alternates narrower than core locale coverage', () => {
    const expectedProfileLocales = [DEFAULT_LOCALE, 'es', 'pt-BR', 'fr', 'de', 'x-default']
    const alternates = getCurrentLocaleAlternates('/compounds/l-theanine/')
    expect(alternates.map((item) => item.locale)).toEqual(expectedProfileLocales)

    for (const locale of ['es', 'pt-BR', 'fr', 'de'] as const) {
      expect(getLocalizedRoute('/compounds/l-theanine/', locale)).not.toBeNull()
    }
    for (const locale of ['it', 'nl', 'pl', 'ja', 'ko'] as const) {
      expect(getLocalizedRoute('/compounds/l-theanine/', locale)).toBeNull()
    }
  })
})
