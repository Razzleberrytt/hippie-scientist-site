import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  buildDefaultLocaleUrl,
  getCurrentLocaleAlternates,
  normalizeInternationalPath,
} from '../international-seo'

describe('international SEO helpers', () => {
  it('uses en-US as the current default locale', () => {
    expect(DEFAULT_LOCALE).toBe('en-US')
  })

  it('normalizes page paths with trailing slashes', () => {
    expect(normalizeInternationalPath('/guides/sleep')).toBe('/guides/sleep/')
    expect(normalizeInternationalPath('/')).toBe('/')
  })

  it('builds canonical default-locale URLs', () => {
    expect(buildDefaultLocaleUrl('/guides/sleep')).toBe('https://thehippiescientist.net/guides/sleep/')
  })

  it('only emits real current alternates until translated pages exist', () => {
    expect(getCurrentLocaleAlternates('/guides/sleep')).toEqual([
      { locale: 'en-US', url: 'https://thehippiescientist.net/guides/sleep/' },
      { locale: 'x-default', url: 'https://thehippiescientist.net/guides/sleep/' },
    ])
  })
})
