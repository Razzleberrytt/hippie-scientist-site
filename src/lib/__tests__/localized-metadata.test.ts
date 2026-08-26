import { describe, expect, it } from 'vitest'

import { JAPANESE_PAGES, buildJapanesePageMetadata } from '../asian-language-content'
import { LOCALE_CONFIG, SUPPORTED_LOCALES } from '../international-seo'

describe('localized metadata parity', () => {
  it('derives core Open Graph alternates from the same reciprocal locale cluster as hreflang', () => {
    const metadata = buildJapanesePageMetadata(JAPANESE_PAGES.herbs)
    const openGraph = metadata.openGraph as { locale?: string; alternateLocale?: string[] } | undefined
    const languages = metadata.alternates?.languages as Record<string, string> | undefined

    expect(openGraph?.locale).toBe('ja_JP')
    expect([...(openGraph?.alternateLocale ?? [])].sort()).toEqual(
      SUPPORTED_LOCALES
        .filter((locale) => locale !== 'ja')
        .map((locale) => LOCALE_CONFIG[locale].openGraphLocale)
        .sort(),
    )

    expect(Object.keys(languages ?? {}).sort()).toEqual([...SUPPORTED_LOCALES, 'x-default'].sort())
    expect(languages?.ja).toBe('https://thehippiescientist.net/ja/herbs/')
    expect(languages?.['x-default']).toBe('https://thehippiescientist.net/herbs/')
  })
})
