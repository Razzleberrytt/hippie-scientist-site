import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  FRENCH_LOCALE,
  GERMAN_LOCALE,
  PORTUGUESE_LOCALE,
  SPANISH_LOCALE,
  getCurrentLocaleAlternates,
  getLocalizedRoute,
  hasLocaleTranslation,
} from '@/src/lib/international-seo'

describe('multilingual international SEO registry', () => {
  it('resolves the same route family across published locales', () => {
    expect(getLocalizedRoute('/goals/sleep/', DEFAULT_LOCALE)).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/goals/sleep/', SPANISH_LOCALE)).toBe('/es/objetivos/sueno/')
    expect(getLocalizedRoute('/es/objetivos/sueno/', PORTUGUESE_LOCALE)).toBe('/pt/objetivos/sono/')
    expect(getLocalizedRoute('/pt/objetivos/sono/', FRENCH_LOCALE)).toBe('/fr/objectifs/sommeil/')
  })

  it('does not advertise registered locales without a published translation', () => {
    expect(hasLocaleTranslation('/goals/sleep/', GERMAN_LOCALE)).toBe(false)
    expect(getLocalizedRoute('/goals/sleep/', GERMAN_LOCALE)).toBeNull()
  })

  it('emits only published alternates plus x-default', () => {
    const alternates = getCurrentLocaleAlternates('/fr/objectifs/sommeil/')
    expect(alternates.map((item) => item.locale)).toEqual([
      DEFAULT_LOCALE,
      SPANISH_LOCALE,
      PORTUGUESE_LOCALE,
      FRENCH_LOCALE,
      'x-default',
    ])
  })
})
