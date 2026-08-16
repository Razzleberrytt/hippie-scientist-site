import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import LocalizedResearchProfilePage from '@/components/localization/LocalizedResearchProfilePage'
import { buildPageMetadata } from '@/src/lib/seo'
import { DEFAULT_OG_LOCALE, PORTUGUESE_OG_LOCALE } from '@/src/lib/international-seo'
import { loadCanonicalLocalizedProfile } from '@/src/lib/localized-profile'
import {
  getProfileTranslation,
  getProfileTranslationSlugs,
  LOCALIZED_PROFILE_UI,
} from '@/src/lib/profile-translations'

type PageProps = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return getProfileTranslationSlugs('pt-BR', 'herb').map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const translation = getProfileTranslation('pt-BR', 'herb', slug)
  if (!translation) return { robots: { index: false, follow: true } }

  const metadata = buildPageMetadata({
    title: translation.title,
    description: translation.summary,
    path: translation.path,
    openGraphType: 'profile',
  })

  return {
    ...metadata,
    openGraph: metadata.openGraph
      ? { ...metadata.openGraph, locale: PORTUGUESE_OG_LOCALE, alternateLocale: [DEFAULT_OG_LOCALE] }
      : metadata.openGraph,
  }
}

export default async function PortugueseHerbProfilePage({ params }: PageProps) {
  const { slug } = await params
  const translation = getProfileTranslation('pt-BR', 'herb', slug)
  if (!translation) notFound()

  const canonical = loadCanonicalLocalizedProfile('herb', slug)
  return (
    <LocalizedResearchProfilePage
      canonical={canonical}
      translation={translation}
      ui={LOCALIZED_PROFILE_UI['pt-BR']}
      lang='pt-BR'
      libraryHref='/pt/ervas/'
    />
  )
}
