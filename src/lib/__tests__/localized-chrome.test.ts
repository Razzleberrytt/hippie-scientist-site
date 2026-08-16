import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  FRENCH_LOCALE,
  GERMAN_LOCALE,
  PORTUGUESE_LOCALE,
  SPANISH_LOCALE,
} from '@/src/lib/international-seo'
import { LOCALIZED_CHROME, getLocaleFromPathname, isTranslatedPath } from '@/src/lib/localized-chrome'

describe('localized chrome', () => {
  it('detects every localized route prefix', () => {
    expect(getLocaleFromPathname('/')).toBe(DEFAULT_LOCALE)
    expect(getLocaleFromPathname('/es/objetivos/sueno/')).toBe(SPANISH_LOCALE)
    expect(getLocaleFromPathname('/pt/objetivos/sono/')).toBe(PORTUGUESE_LOCALE)
    expect(getLocaleFromPathname('/fr/objectifs/sommeil/')).toBe(FRENCH_LOCALE)
    expect(getLocaleFromPathname('/de/ziele/schlaf/')).toBe(GERMAN_LOCALE)
  })

  it('treats all translated prefixes as non-English chrome', () => {
    for (const path of ['/es/', '/pt/', '/fr/', '/de/']) expect(isTranslatedPath(path)).toBe(true)
    expect(isTranslatedPath('/herbs/ashwagandha/')).toBe(false)
  })

  it('provides complete localized chrome copy for every translated locale', () => {
    for (const locale of [SPANISH_LOCALE, PORTUGUESE_LOCALE, FRENCH_LOCALE, GERMAN_LOCALE]) {
      const config = LOCALIZED_CHROME[locale]
      expect(config.links).toHaveLength(5)
      expect(config.footerDescription.length).toBeGreaterThan(20)
      expect(config.footerDisclaimer.length).toBeGreaterThan(20)
      expect(config.skipLabel.length).toBeGreaterThan(5)
    }
  })
})
