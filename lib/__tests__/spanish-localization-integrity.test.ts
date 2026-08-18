import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LOCALIZED_ROUTES, SPANISH_LOCALE, getLocalizedRoute } from '../../src/lib/international-seo'
import { SPANISH_PAGES } from '../../src/lib/spanish-content'
import { SPANISH_ROUTE_KEYS } from '../../src/lib/spanish-routes'

const spanishRoutes = LOCALIZED_ROUTES
  .map((route) => route.translations[SPANISH_LOCALE])
  .filter((path): path is string => Boolean(path))

/**
 * How a Spanish URL is actually served. The routes stopped being one directory
 * per page: `/es/` is a literal page, the content pages are enumerated by the
 * `app/es/[...segments]` catch-all, and profiles come from a `[slug]` route.
 *
 * The catch-all sets `dynamicParams = false`, so a path missing from
 * SPANISH_ROUTE_KEYS is not built at all and any hreflang link to it hands a
 * crawler a 404 — which is the failure this test exists to prevent.
 */
function routeResolution(path: string): 'literal' | 'catch-all' | 'profile-slug' | 'unbuilt' {
  const segments = path.replace(/^\/es\/?/, '').replace(/\/$/, '')
  if (!segments) return existsSync('app/es/page.tsx') ? 'literal' : 'unbuilt'
  if (existsSync(`app/es/${segments}/page.tsx`)) return 'literal'
  if (segments in SPANISH_ROUTE_KEYS) return 'catch-all'

  const parts = segments.split('/')
  if (parts.length === 2 && existsSync(`app/es/${parts[0]}/[slug]/page.tsx`)) return 'profile-slug'

  return 'unbuilt'
}

describe('Spanish localization integrity', () => {
  it('builds a real page for every advertised Spanish hreflang route', () => {
    for (const path of spanishRoutes) {
      expect(routeResolution(path), `${path} is advertised with hreflang but nothing builds it`).not.toBe('unbuilt')
    }
  })

  it('enumerates every catch-all Spanish route, which dynamicParams = false requires', () => {
    const catchAll = spanishRoutes.filter((path) => routeResolution(path) === 'catch-all')
    expect(catchAll.length).toBeGreaterThan(0)
    for (const path of catchAll) {
      const segments = path.replace(/^\/es\/?/, '').replace(/\/$/, '')
      expect(SPANISH_ROUTE_KEYS[segments], `${path} must map to a Spanish page key`).toBeTruthy()
    }
  })

  it('keeps every Spanish content page represented in the canonical localization registry', () => {
    for (const page of Object.values(SPANISH_PAGES)) {
      expect(spanishRoutes).toContain(page.path)
      expect(getLocalizedRoute(page.path, SPANISH_LOCALE)).toBe(page.path)
    }
  })

  it('requires substantive translated copy on every Spanish content page', () => {
    for (const [key, page] of Object.entries(SPANISH_PAGES)) {
      expect(page.title.length, `${key}: title`).toBeGreaterThan(12)
      expect(page.description.length, `${key}: description`).toBeGreaterThan(60)
      expect(page.intro.length, `${key}: intro`).toBeGreaterThan(80)
      expect(page.sections.length, `${key}: sections`).toBeGreaterThanOrEqual(2)

      for (const section of page.sections) {
        expect(section.title.trim().length, `${key}: section title`).toBeGreaterThan(3)
        expect(section.body.trim().length, `${key}: section body`).toBeGreaterThan(35)
      }
    }
  })

  it('does not advertise duplicate Spanish paths', () => {
    expect(new Set(spanishRoutes).size).toBe(spanishRoutes.length)
  })

  it('keeps Spanish routes reciprocal with an English source route', () => {
    for (const route of LOCALIZED_ROUTES) {
      const spanish = route.translations[SPANISH_LOCALE]
      if (!spanish) continue
      expect(getLocalizedRoute(spanish, 'en-US')).toBe(route.english)
    }
  })
})
