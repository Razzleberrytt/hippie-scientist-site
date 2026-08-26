import { describe, expect, it } from 'vitest'

import localizedSitemap from '../localized/sitemap'
import { DEFAULT_LOCALE, LOCALIZED_ROUTES } from '@/src/lib/international-seo'

describe('localized sitemap', () => {
  it('contains exactly one sitemap entry for every published translation', () => {
    const sitemap = localizedSitemap()
    const expectedCount = LOCALIZED_ROUTES.reduce(
      (count, route) => count + Object.values(route.translations).filter(Boolean).length,
      0,
    )

    expect(sitemap).toHaveLength(expectedCount)
    expect(new Set(sitemap.map((entry) => entry.url)).size).toBe(expectedCount)
  })

  it('publishes the full reciprocal language cluster including x-default on every translated URL', () => {
    const sitemap = localizedSitemap()

    for (const route of LOCALIZED_ROUTES) {
      const expectedLanguages = [DEFAULT_LOCALE, ...Object.keys(route.translations), 'x-default'].sort()
      const translatedUrls = Object.values(route.translations).filter(Boolean)

      for (const translatedPath of translatedUrls) {
        const entry = sitemap.find((candidate) => new URL(candidate.url).pathname === translatedPath)
        expect(entry, `${translatedPath} must be present in the localized sitemap`).toBeDefined()
        expect(Object.keys(entry?.alternates?.languages ?? {}).sort()).toEqual(expectedLanguages)
        expect(entry?.alternates?.languages?.['x-default']).toBe('https://thehippiescientist.net' + route.english)
      }
    }
  })
})
