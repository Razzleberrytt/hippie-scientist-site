import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  FRENCH_LOCALE,
  GERMAN_LOCALE,
  PORTUGUESE_LOCALE,
  SPANISH_LOCALE,
  getCurrentLocaleAlternates,
  getLocalizedRoute,
} from '@/src/lib/international-seo'

describe('multilingual international SEO registry', () => {
  it('resolves the same route family across every published locale', () => {
    expect(getLocalizedRoute('/goals/sleep/', DEFAULT_LOCALE)).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/goals/sleep/', SPANISH_LOCALE)).toBe('/es/objetivos/sueno/')
    expect(getLocalizedRoute('/es/objetivos/sueno/', PORTUGUESE_LOCALE)).toBe('/pt/objetivos/sono/')
    expect(getLocalizedRoute('/pt/objetivos/sono/', FRENCH_LOCALE)).toBe('/fr/objectifs/sommeil/')
    expect(getLocalizedRoute('/fr/objectifs/sommeil/', GERMAN_LOCALE)).toBe('/de/ziele/schlaf/')
  })

  it('emits all published alternates plus x-default', () => {
    const alternates = getCurrentLocaleAlternates('/de/ziele/schlaf/')
    expect(alternates.map((item) => item.locale)).toEqual([
      DEFAULT_LOCALE,
      SPANISH_LOCALE,
      PORTUGUESE_LOCALE,
      FRENCH_LOCALE,
      GERMAN_LOCALE,
      'x-default',
    ])
  })
})
