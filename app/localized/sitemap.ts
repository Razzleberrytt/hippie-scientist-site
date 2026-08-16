import type { MetadataRoute } from 'next'

import {
  DEFAULT_LOCALE,
  LOCALIZED_ROUTES,
  buildLocaleUrl,
  type TranslationLocale,
} from '@/src/lib/international-seo'

export const dynamic = 'force-static'

function languageAlternates(route: (typeof LOCALIZED_ROUTES)[number]) {
  const languages: Record<string, string> = {
    [DEFAULT_LOCALE]: buildLocaleUrl(route.english),
  }

  for (const [locale, path] of Object.entries(route.translations) as [TranslationLocale, string | undefined][]) {
    if (path) languages[locale] = buildLocaleUrl(path)
  }

  return languages
}

/**
 * Dedicated sitemap for substantive translated core pages.
 *
 * The canonical multilingual route registry is the sole source of truth, so a
 * translation cannot be advertised here unless it is also part of the same
 * registry used by page metadata, language navigation, and integrity tests.
 */
export default function localizedSitemap(): MetadataRoute.Sitemap {
  return LOCALIZED_ROUTES.flatMap((route) => {
    const alternates = { languages: languageAlternates(route) }

    return Object.entries(route.translations)
      .filter((entry): entry is [TranslationLocale, string] => Boolean(entry[1]))
      .map(([, path]) => ({
        url: buildLocaleUrl(path),
        changeFrequency: 'monthly' as const,
        priority: 0.65,
        alternates,
      }))
  })
}
