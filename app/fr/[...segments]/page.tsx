import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import {
  FRENCH_PAGES,
  FRENCH_ROUTE_KEYS,
  FRENCH_UI,
  buildFrenchPageMetadata,
} from '@/src/lib/french-content'
import {
  generateLocalizedStaticParams,
  resolveLocalizedPage,
  type LocalizedRouteParams,
} from '@/src/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() {
  return generateLocalizedStaticParams(FRENCH_ROUTE_KEYS)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, FRENCH_ROUTE_KEYS, FRENCH_PAGES)
  return page ? buildFrenchPageMetadata(page) : {}
}

export default async function FrenchLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, FRENCH_ROUTE_KEYS, FRENCH_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={FRENCH_UI} lang='fr' />
}
