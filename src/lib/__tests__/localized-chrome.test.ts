import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  LOCALE_CONFIG,
  SUPPORTED_LOCALES,
  type TranslationLocale,
} from '@/src/lib/international-seo'
import { LOCALIZED_CHROME, getLocaleFromPathname, isTranslatedPath } from '@/src/lib/localized-chrome'

const translationLocales = SUPPORTED_LOCALES.filter(
  (locale): locale is TranslationLocale => locale !== DEFAULT_LOCALE,
)

describe('localized chrome', () => {
  it('detects every configured localized route prefix', () => {
    expect(getLocaleFromPathname('/')).toBe(DEFAULT_LOCALE)
    for (const locale of translationLocales) {
      const prefix = LOCALE_CONFIG[locale].pathPrefix
      expect(getLocaleFromPathname(prefix), `${locale} root prefix`).toBe(locale)
      expect(getLocaleFromPathname(`${prefix}nested/example/`), `${locale} nested prefix`).toBe(locale)
    }
  })

  it('treats all translated prefixes as non-English chrome', () => {
    for (const locale of translationLocales) {
      expect(isTranslatedPath(LOCALE_CONFIG[locale].pathPrefix)).toBe(true)
    }
    expect(isTranslatedPath('/herbs/ashwagandha/')).toBe(false)
  })

  it('provides complete localized chrome copy for every translated locale', () => {
    for (const locale of translationLocales) {
      const config = LOCALIZED_CHROME[locale]
      expect(config.links).toHaveLength(5)
      expect(config.footerDescription.length).toBeGreaterThan(20)
      expect(config.footerDisclaimer.length).toBeGreaterThan(20)
      expect(config.skipLabel.length).toBeGreaterThan(2)
      expect(config.languagesAriaLabel.length).toBeGreaterThan(1)
      expect(config.equivalentPageLabel.length).toBeGreaterThan(1)
    }
  })
})
