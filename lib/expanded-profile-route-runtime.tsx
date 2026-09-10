import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedResearchProfilePage from '@/components/localization/LocalizedResearchProfilePage'
import ExpandedProfileLanguageLinks from '@/components/localization/ExpandedProfileLanguageLinks'
import { buildPageMetadata } from './seo'
import { canonicalProfileClaimRevision, loadCanonicalLocalizedProfile, profileTranslationCoverage } from './localized-profile'
import { EXPANDED_ASHWAGANDHA, EXPANDED_PROFILE_UI, type ExpandedProfileLocale } from './expanded-profile-translations'

const ASHWAGANDHA_ALTERNATES = {
  'en-US': '/herbs/ashwagandha/',
  es: '/es/hierbas/ashwagandha/',
  'pt-BR': '/pt/ervas/ashwagandha/',
  fr: '/fr/plantes/ashwagandha/',
  de: '/de/kraeuter/ashwagandha/',
  ar: '/ar/herbs/ashwagandha/',
  ru: '/ru/travy/ashwagandha/',
  vi: '/vi/thao-duoc/ashwagandha/',
  th: '/th/herbs/ashwagandha/',
  sv: '/sv/orter/ashwagandha/',
} as const

type PageProps = { params: Promise<{ slug: string }> }

function translationFor(locale: ExpandedProfileLocale, slug: string) {
  if (slug !== 'ashwagandha') return null
  return EXPANDED_ASHWAGANDHA[locale]
}

export function createExpandedHerbProfileRoute(config: {
  locale: ExpandedProfileLocale
  lang: string
  libraryHref: string
}) {
  function generateStaticParams() {
    return [{ slug: 'ashwagandha' }]
  }

  async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const translation = translationFor(config.locale, slug)
    if (!translation) return { robots: { index: false, follow: true } }

    const canonical = loadCanonicalLocalizedProfile('herb', slug)
    const coverage = profileTranslationCoverage(canonical, translation)
    if (!coverage.complete || coverage.currentRevision !== canonicalProfileClaimRevision(canonical)) {
      return { robots: { index: false, follow: true } }
    }

    const metadata = buildPageMetadata({
      title: translation.title,
      description: translation.summary,
      path: translation.path,
      openGraphType: 'profile',
    })

    return {
      ...metadata,
      alternates: {
        canonical: translation.path,
        languages: Object.fromEntries(
          Object.entries(ASHWAGANDHA_ALTERNATES).map(([locale, path]) => [locale, `https://thehippiescientist.net${path}`]),
        ),
      },
      openGraph: metadata.openGraph
        ? { ...metadata.openGraph, locale: config.locale === 'ar' ? 'ar_SA' : config.locale === 'ru' ? 'ru_RU' : config.locale === 'vi' ? 'vi_VN' : config.locale === 'th' ? 'th_TH' : 'sv_SE' }
        : metadata.openGraph,
    }
  }

  async function Page({ params }: PageProps) {
    const { slug } = await params
    const translation = translationFor(config.locale, slug)
    if (!translation) notFound()

    const canonical = loadCanonicalLocalizedProfile('herb', slug)
    if (!profileTranslationCoverage(canonical, translation).complete) notFound()

    return (
      <>
        <ExpandedProfileLanguageLinks current={config.locale} />
        <LocalizedResearchProfilePage
          canonical={canonical}
          translation={translation}
          ui={EXPANDED_PROFILE_UI[config.locale]}
          lang={config.lang}
          libraryHref={config.libraryHref}
        />
      </>
    )
  }

  return { generateStaticParams, generateMetadata, Page }
}
