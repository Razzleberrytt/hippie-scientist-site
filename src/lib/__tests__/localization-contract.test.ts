import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import {
  CORE_LOCALIZED_ENGLISH_ROUTES,
  DEFAULT_LOCALE,
  JAPANESE_LOCALE,
  KOREAN_LOCALE,
  LOCALE_CONFIG,
  LOCALIZED_ROUTES,
  SUPPORTED_LOCALES,
  getLocaleFromPathname,
  type TranslationLocale,
} from '../international-seo'
import { LOCALIZED_CHROME } from '../localized-chrome'
import { DARK_MODE_COPY } from '../localized-theme-copy'

const translationLocales = SUPPORTED_LOCALES.filter(
  (locale): locale is TranslationLocale => locale !== DEFAULT_LOCALE,
)

function localeDirectory(locale: TranslationLocale) {
  return LOCALE_CONFIG[locale].pathPrefix.replace(/\//g, '')
}

describe('localization integration contract', () => {
  it('keeps locale metadata, chrome, and theme copy complete with unique prefixes', () => {
    const prefixes = SUPPORTED_LOCALES.map((locale) => LOCALE_CONFIG[locale].pathPrefix)
    expect(new Set(prefixes).size).toBe(prefixes.length)

    for (const locale of SUPPORTED_LOCALES) {
      const config = LOCALE_CONFIG[locale]
      const chrome = LOCALIZED_CHROME[locale]
      const theme = DARK_MODE_COPY[locale]

      expect(config.language.trim()).not.toBe('')
      expect(config.openGraphLocale.trim()).not.toBe('')
      expect(config.languageLabel.trim()).not.toBe('')
      expect(config.shortLabel.trim().length).toBeGreaterThanOrEqual(2)
      expect(config.pathPrefix.startsWith('/')).toBe(true)
      expect(config.pathPrefix.endsWith('/')).toBe(true)
      expect(chrome.languageLabel).toBe(config.languageLabel)
      expect(chrome.homeHref).toBe(config.pathPrefix)
      expect(chrome.languagesAriaLabel.trim()).not.toBe('')
      expect(chrome.skipLabel.trim()).not.toBe('')
      expect(theme.toLight.trim()).not.toBe('')
      expect(theme.toDark.trim()).not.toBe('')
      expect(theme.light.trim()).not.toBe('')
      expect(theme.dark.trim()).not.toBe('')
    }
  })

  it('requires a layout, home route, and catch-all runtime for every translated locale', () => {
    for (const locale of translationLocales) {
      const directory = localeDirectory(locale)
      expect(existsSync(`app/${directory}/layout.tsx`), `${locale} needs a locale layout`).toBe(true)
      expect(existsSync(`app/${directory}/page.tsx`), `${locale} needs a locale home`).toBe(true)
      expect(existsSync(`app/${directory}/[...segments]/page.tsx`), `${locale} needs localized catch-all routes`).toBe(true)
    }
  })

  it('requires every supported translation locale on every core route family', () => {
    for (const english of CORE_LOCALIZED_ENGLISH_ROUTES) {
      const route = LOCALIZED_ROUTES.find((candidate) => candidate.english === english)
      expect(route, `${english} must exist in the localized registry`).toBeDefined()
      expect(Object.keys(route?.translations ?? {}).sort()).toEqual([...translationLocales].sort())
    }
  })

  it('keeps localized navigation inside real published route clusters', () => {
    const published = new Set(
      LOCALIZED_ROUTES.flatMap((route) => Object.values(route.translations).filter((path): path is string => Boolean(path))),
    )

    for (const locale of translationLocales) {
      const prefix = LOCALE_CONFIG[locale].pathPrefix
      for (const link of LOCALIZED_CHROME[locale].links) {
        expect(link.href.startsWith(prefix), `${locale} navigation must stay inside its locale`).toBe(true)
        expect(published.has(link.href), `${locale} navigation points to unpublished ${link.href}`).toBe(true)
      }
    }
  })

  it('derives locale detection from the same configured prefixes', () => {
    for (const locale of translationLocales) {
      expect(getLocaleFromPathname(LOCALE_CONFIG[locale].pathPrefix)).toBe(locale)
      expect(getLocaleFromPathname(`${LOCALE_CONFIG[locale].pathPrefix}example/`)).toBe(locale)
    }
  })

  it('keeps new Asian locales fail-closed for unreviewed detailed profiles', () => {
    const ashwagandha = LOCALIZED_ROUTES.find((route) => route.english === '/herbs/ashwagandha/')
    const theanine = LOCALIZED_ROUTES.find((route) => route.english === '/compounds/l-theanine/')
    expect(ashwagandha?.translations[JAPANESE_LOCALE]).toBeUndefined()
    expect(ashwagandha?.translations[KOREAN_LOCALE]).toBeUndefined()
    expect(theanine?.translations[JAPANESE_LOCALE]).toBeUndefined()
    expect(theanine?.translations[KOREAN_LOCALE]).toBeUndefined()
  })
})
