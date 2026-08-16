import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LOCALIZED_ROUTES, SPANISH_LOCALE, getLocalizedRoute } from '../../src/lib/international-seo'
import { SPANISH_PAGES } from '../../src/lib/spanish-content'

const spanishRoutes = LOCALIZED_ROUTES
  .map((route) => route.translations[SPANISH_LOCALE])
  .filter((path): path is string => Boolean(path))

function routeToPageFile(path: string) {
  const normalized = path === '/' ? '' : path.replace(/^\//, '').replace(/\/$/, '')
  return normalized ? `app/${normalized}/page.tsx` : 'app/page.tsx'
}

describe('Spanish localization integrity', () => {
  it('publishes a real page file for every advertised Spanish hreflang route', () => {
    for (const path of spanishRoutes) {
      expect(existsSync(routeToPageFile(path)), `Missing Spanish route file for ${path}`).toBe(true)
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
