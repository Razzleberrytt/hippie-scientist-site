import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import LocalizedResearchProfilePage from '@/components/localization/LocalizedResearchProfilePage'
import {
  getCompoundProfileTranslation,
  getCompoundProfileTranslationSlugs,
} from './compound-profile-translations'
import {
  getCurrentLocaleAlternates,
  LOCALE_CONFIG,
  type SupportedLocale,
} from './international-seo'
import {
  loadCanonicalLocalizedProfile,
  profileTranslationCoverage,
  type LocalizedProfileKind,
} from './localized-profile'
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
  libraryLabel?: string
}

type PageProps = { params: Promise<{ slug: string }> }

function translationFor(locale: ProfileTranslationLocale, kind: LocalizedProfileKind, slug: string) {
  return kind === 'compound'
    ? getCompoundProfileTranslation(locale, slug)
    : getProfileTranslation(locale, kind, slug)
}

function translationSlugsFor(locale: ProfileTranslationLocale, kind: LocalizedProfileKind) {
  return kind === 'compound'
    ? getCompoundProfileTranslationSlugs(locale)
    : getProfileTranslationSlugs(locale, kind)
}

/**
 * One fail-closed route runtime for all translated scientific profiles.
 * Route files provide only locale/kind/library configuration; claim coverage,
 * freshness validation, metadata, and rendering remain centralized.
 *
 * A canonical governance pass can legitimately remove or change claims after a
 * translation was authored. That makes the translation stale, but it must not
 * make the entire production export fail. Stale/incomplete localized profiles
 * are therefore excluded from publication with notFound(), while metadata also
 * fails closed to noindex during the same build.
 */
export function createLocalizedProfileRoute(config: RouteConfig) {
  function generateStaticParams() {
    return translationSlugsFor(config.locale, config.kind).map((slug) => ({ slug }))
  }

  async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const translation = translationFor(config.locale, config.kind, slug)
    if (!translation) return { robots: { index: false, follow: true } }

    const canonical = loadCanonicalLocalizedProfile(config.kind, slug)
    const coverage = profileTranslationCoverage(canonical, translation)
    if (!coverage.complete) {
      return { robots: { index: false, follow: true } }
    }

    const metadata = buildPageMetadata({
      title: translation.title,
      description: translation.summary,
      path: translation.path,
      openGraphType: 'profile',
    })
    const currentOgLocale = LOCALE_CONFIG[config.locale].openGraphLocale
    const alternateLocale = [...new Set(
      getCurrentLocaleAlternates(translation.path)
        .filter((alternate): alternate is { locale: SupportedLocale; url: string } => alternate.locale !== 'x-default')
        .map((alternate) => LOCALE_CONFIG[alternate.locale].openGraphLocale)
        .filter((locale) => locale !== currentOgLocale),
    )]

    return {
      ...metadata,
      openGraph: metadata.openGraph
        ? { ...metadata.openGraph, locale: currentOgLocale, alternateLocale }
        : metadata.openGraph,
    }
  }

  async function Page({ params }: PageProps) {
    const { slug } = await params
    const translation = translationFor(config.locale, config.kind, slug)
    if (!translation) notFound()

    const canonical = loadCanonicalLocalizedProfile(config.kind, slug)
    if (!profileTranslationCoverage(canonical, translation).complete) notFound()

    return (
      <LocalizedResearchProfilePage
        canonical={canonical}
        translation={translation}
        ui={LOCALIZED_PROFILE_UI[config.locale]}
        lang={config.lang}
        libraryHref={config.libraryHref}
        backToLibraryLabel={config.libraryLabel}
      />
    )
  }

  return { generateStaticParams, generateMetadata, Page }
}
