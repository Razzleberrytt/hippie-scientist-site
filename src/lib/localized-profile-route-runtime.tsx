import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import LocalizedResearchProfilePage from '@/components/localization/LocalizedResearchProfilePage'
import {
  DEFAULT_OG_LOCALE,
  FRENCH_OG_LOCALE,
  GERMAN_OG_LOCALE,
  PORTUGUESE_OG_LOCALE,
  SPANISH_OG_LOCALE,
} from './international-seo'
import { loadCanonicalLocalizedProfile, type LocalizedProfileKind } from './localized-profile'
import {
  getProfileTranslation,
  getProfileTranslationSlugs,
  LOCALIZED_PROFILE_UI,
  type ProfileTranslationLocale,
} from './profile-translations'
import { buildPageMetadata } from './seo'

type RouteConfig = {
  locale: ProfileTranslationLocale
  kind: LocalizedProfileKind
  lang: string
  libraryHref: string
}

type PageProps = { params: Promise<{ slug: string }> }

const OG_LOCALE: Record<ProfileTranslationLocale, string> = {
  es: SPANISH_OG_LOCALE,
  'pt-BR': PORTUGUESE_OG_LOCALE,
  fr: FRENCH_OG_LOCALE,
  de: GERMAN_OG_LOCALE,
}

/**
 * One fail-closed route runtime for all translated scientific profiles.
 * Route files provide only locale/kind/library configuration; claim coverage,
 * freshness validation, metadata, and rendering remain centralized.
 */
export function createLocalizedProfileRoute(config: RouteConfig) {
  function generateStaticParams() {
    return getProfileTranslationSlugs(config.locale, config.kind).map((slug) => ({ slug }))
  }

  async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const translation = getProfileTranslation(config.locale, config.kind, slug)
    if (!translation) return { robots: { index: false, follow: true } }

    // Loading the canonical record here also applies the same fail-closed
    // translation completeness/freshness contract during metadata generation.
    const canonical = loadCanonicalLocalizedProfile(config.kind, slug)
    const { assertCompleteProfileTranslation } = await import('./localized-profile')
    assertCompleteProfileTranslation(canonical, translation)

    const metadata = buildPageMetadata({
      title: translation.title,
      description: translation.summary,
      path: translation.path,
      openGraphType: 'profile',
    })

    return {
      ...metadata,
      openGraph: metadata.openGraph
        ? { ...metadata.openGraph, locale: OG_LOCALE[config.locale], alternateLocale: [DEFAULT_OG_LOCALE] }
        : metadata.openGraph,
    }
  }

  async function Page({ params }: PageProps) {
    const { slug } = await params
    const translation = getProfileTranslation(config.locale, config.kind, slug)
    if (!translation) notFound()

    const canonical = loadCanonicalLocalizedProfile(config.kind, slug)
    return (
      <LocalizedResearchProfilePage
        canonical={canonical}
        translation={translation}
        ui={LOCALIZED_PROFILE_UI[config.locale]}
        lang={config.lang}
        libraryHref={config.libraryHref}
      />
    )
  }

  return { generateStaticParams, generateMetadata, Page }
}
