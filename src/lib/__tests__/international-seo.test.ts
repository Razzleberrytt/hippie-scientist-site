import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  DEFAULT_LANGUAGE,
  DEFAULT_REGION,
  LOCALE_TEXT_DIRECTION,
  buildDefaultLocaleUrl,
  getCurrentLocaleAlternates,
  getLocaleMetadata,
  normalizeInternationalPath,
} from '../international-seo'

describe('international SEO helpers', () => {
  it('declares the current production locale explicitly', () => {
    expect(DEFAULT_LOCALE).toBe('en-US')
    expect(DEFAULT_LANGUAGE).toBe('en')
    expect(DEFAULT_REGION).toBe('US')
    expect(LOCALE_TEXT_DIRECTION).toBe('ltr')
  })

  it('normalizes paths for locale alternates without query strings', () => {
    expect(normalizeInternationalPath('/guides/sleep?utm_source=test')).toBe('/guides/sleep/')
    expect(normalizeInternationalPath('/robots.txt')).toBe('/robots.txt')
  })

  it('builds current safe alternates with en-US and x-default only', () => {
    expect(getCurrentLocaleAlternates('/guides/sleep/')).toEqual([
      { locale: 'en-US', url: 'https://thehippiescientist.net/guides/sleep/' },
      { locale: 'x-default', url: 'https://thehippiescientist.net/guides/sleep/' },
    ])
  })

  it('builds the default locale homepage URL', () => {
    expect(buildDefaultLocaleUrl('/')).toBe('https://thehippiescientist.net/')
  })

  it('exposes locale metadata for layout and future localized routes', () => {
    expect(getLocaleMetadata('/').alternates).toHaveLength(2)
    expect(getLocaleMetadata('/').openGraphLocale).toBe('en_US')
  })
})
