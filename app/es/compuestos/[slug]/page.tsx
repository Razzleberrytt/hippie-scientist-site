import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import LocalizedResearchProfilePage from '@/components/localization/LocalizedResearchProfilePage'
import { loadCanonicalLocalizedProfile } from '@/src/lib/localized-profile'
import {
  SPANISH_PROFILE_TRANSLATIONS,
  SPANISH_PROFILE_UI,
  buildSpanishProfileMetadata,
} from '@/src/lib/spanish-profile-translations'

type Slug = keyof typeof SPANISH_PROFILE_TRANSLATIONS.compounds
type PageProps = { params: Promise<{ slug: string }> }
export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(SPANISH_PROFILE_TRANSLATIONS.compounds).map((slug) => ({ slug }))
}

function translationFor(slug: string) {
  return SPANISH_PROFILE_TRANSLATIONS.compounds[slug as Slug] ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const translation = translationFor(slug)
  return translation ? buildSpanishProfileMetadata(translation) : {}
}

export default async function SpanishCompoundProfile({ params }: PageProps) {
  const { slug } = await params
  const translation = translationFor(slug)
  if (!translation) notFound()
  const canonical = loadCanonicalLocalizedProfile('compound', slug)
  return (
    <LocalizedResearchProfilePage
      canonical={canonical}
      translation={translation}
      ui={SPANISH_PROFILE_UI}
      lang='es'
      libraryHref='/es/compuestos/'
    />
  )
}
