import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { FRENCH_PAGES } from '../french-content'
import { GERMAN_PAGES } from '../german-content'
import { DUTCH_PAGES, ITALIAN_PAGES, POLISH_PAGES } from '../expanded-language-content'
import {
  DEFAULT_LOCALE,
  DUTCH_LOCALE,
  FRENCH_LOCALE,
  GERMAN_LOCALE,
  ITALIAN_LOCALE,
  LOCALIZED_ROUTES,
  POLISH_LOCALE,
  PORTUGUESE_LOCALE,
  SPANISH_LOCALE,
  getCurrentLocaleAlternates,
  getLocalizedRoute,
  normalizeInternationalPath,
  type TranslationLocale,
} from '../international-seo'
import type { LocalizedPageData } from '../localization'
import { assertCompleteProfileTranslation, loadCanonicalLocalizedProfile } from '../localized-profile'
import { PORTUGUESE_PAGES } from '../portuguese-content'
import { COMPOUND_PROFILE_TRANSLATIONS } from '../compound-profile-translations'
import { PROFILE_TRANSLATIONS, type ProfileTranslationLocale } from '../profile-translations'
import { SPANISH_PAGES } from '../spanish-content'

const PACKS: Record<TranslationLocale, readonly LocalizedPageData[]> = {
  [SPANISH_LOCALE]: Object.values(SPANISH_PAGES),
  [PORTUGUESE_LOCALE]: Object.values(PORTUGUESE_PAGES),
  [FRENCH_LOCALE]: Object.values(FRENCH_PAGES),
  [GERMAN_LOCALE]: Object.values(GERMAN_PAGES),
  [ITALIAN_LOCALE]: Object.values(ITALIAN_PAGES),
  [DUTCH_LOCALE]: Object.values(DUTCH_PAGES),
  [POLISH_LOCALE]: Object.values(POLISH_PAGES),
}

function pageLinks(page: LocalizedPageData): string[] {
  return [
    ...page.sections.flatMap((section) => section.links?.map((link) => link.href) ?? []),
    ...(page.primaryCta ? [page.primaryCta.href] : []),
    ...(page.secondaryCta ? [page.secondaryCta.href] : []),
  ]
}

function localePrefix(locale: TranslationLocale) {
  if (locale === PORTUGUESE_LOCALE) return '/pt/'
  return `/${locale}/`
}

function localeDirectory(locale: TranslationLocale) {
  return localePrefix(locale).replace(/\//g, '')
}

function herbProfileTranslations(locale: TranslationLocale) {
  if (!(locale in PROFILE_TRANSLATIONS)) return []
  return PROFILE_TRANSLATIONS[locale as ProfileTranslationLocale]
}

function compoundProfileTranslations(locale: TranslationLocale) {
  if (!(locale in COMPOUND_PROFILE_TRANSLATIONS)) return []
  return COMPOUND_PROFILE_TRANSLATIONS[locale as ProfileTranslationLocale]
}

/**
 * Everything this locale actually publishes. Some locales intentionally ship
 * core editorial pages before claim-level scientific profile translations.
 * Hreflang must therefore match the real artifacts for each locale rather than
 * assuming every locale has the same profile coverage.
 */
function publishedPaths(locale: TranslationLocale) {
  const core = PACKS[locale].map((page) => normalizeInternationalPath(page.path))
  const profiles = herbProfileTranslations(locale).map((profile) => normalizeInternationalPath(profile.path))
  const compounds = compoundProfileTranslations(locale).map((profile) => normalizeInternationalPath(profile.path))

  const paths = [...core, ...profiles, ...compounds]
  const home = normalizeInternationalPath(localePrefix(locale))
  if (!paths.includes(home) && existsSync(`app/${localeDirectory(locale)}/page.tsx`)) paths.push(home)

  return paths.sort()
}

describe('multilingual localization integrity', () => {
  it('keeps every advertised translated route backed by exactly one substantive localized artifact', () => {
    for (const [locale, pages] of Object.entries(PACKS) as [TranslationLocale, readonly LocalizedPageData[]][]) {
      const expected = LOCALIZED_ROUTES
        .map((route) => route.translations[locale])
        .filter((path): path is string => Boolean(path))
        .map(normalizeInternationalPath)
        .sort()
      const actual = publishedPaths(locale)

      expect(new Set(actual).size, `${locale} contains duplicate localized paths`).toBe(actual.length)
      expect(actual, `${locale} published artifacts must exactly match the hreflang registry`).toEqual(expected)

      for (const page of pages) {
        expect(page.title.trim().length, `${page.path} must have a title`).toBeGreaterThan(12)
        expect(page.description.trim().length, `${page.path} must have a description`).toBeGreaterThan(40)
        expect(page.intro.trim().length, `${page.path} must have substantive introductory copy`).toBeGreaterThan(50)
        expect(page.sections.length, `${page.path} must contain substantive editorial sections`).toBeGreaterThan(0)
      }

      for (const profile of [
        ...herbProfileTranslations(locale),
        ...compoundProfileTranslations(locale),
      ]) {
        expect(profile.title.trim().length, `${profile.path} must have a title`).toBeGreaterThan(12)
        expect(profile.summary.trim().length, `${profile.path} must have a substantive summary`).toBeGreaterThan(80)
        const canonical = loadCanonicalLocalizedProfile(profile.kind, profile.slug)
        expect(() => assertCompleteProfileTranslation(canonical, profile)).not.toThrow()
      }
    }
  })

  it('keeps localized internal links inside each published locale pack resolvable', () => {
    for (const [locale, pages] of Object.entries(PACKS) as [TranslationLocale, readonly LocalizedPageData[]][]) {
      const published = new Set(publishedPaths(locale))
      const prefix = localePrefix(locale)

      for (const page of pages) {
        for (const href of pageLinks(page)) {
          const normalized = normalizeInternationalPath(href)
          if (!normalized.startsWith(prefix)) continue
          expect(published.has(normalized), `${page.path} links to missing ${locale} page ${normalized}`).toBe(true)
        }
      }
    }
  })

  it('keeps hreflang alternates reciprocal for every localized route', () => {
    for (const route of LOCALIZED_ROUTES) {
      const expectedLocales = [
        DEFAULT_LOCALE,
        ...Object.keys(route.translations),
        'x-default',
      ].sort()
      const paths = [route.english, ...Object.values(route.translations).filter((path): path is string => Boolean(path))]

      for (const path of paths) {
        const alternates = getCurrentLocaleAlternates(path)
        expect(alternates.map((alternate) => alternate.locale).sort(), `${path} must expose the same reciprocal hreflang cluster`).toEqual(expectedLocales)

        for (const locale of Object.keys(route.translations) as TranslationLocale[]) {
          expect(getLocalizedRoute(path, locale), `${path} must resolve ${locale}`).toBe(normalizeInternationalPath(route.translations[locale] as string))
        }
        expect(getLocalizedRoute(path, DEFAULT_LOCALE), `${path} must resolve the English canonical`).toBe(normalizeInternationalPath(route.english))
      }
    }
  })

  it('does not reuse one translated URL for multiple English canonicals', () => {
    const seen = new Map<string, string>()
    for (const route of LOCALIZED_ROUTES) {
      for (const translated of Object.values(route.translations)) {
        if (!translated) continue
        const normalized = normalizeInternationalPath(translated)
        expect(seen.get(normalized), `${normalized} is mapped to both ${seen.get(normalized)} and ${route.english}`).toBeUndefined()
        seen.set(normalized, route.english)
      }
    }
  })
})
