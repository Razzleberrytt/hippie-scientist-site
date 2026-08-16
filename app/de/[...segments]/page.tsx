import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import {
  GERMAN_PAGES,
  GERMAN_ROUTE_KEYS,
  GERMAN_UI,
  buildGermanPageMetadata,
} from '@/src/lib/german-content'
import {
  generateLocalizedStaticParams,
  resolveLocalizedPage,
  type LocalizedRouteParams,
} from '@/src/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() {
  return generateLocalizedStaticParams(GERMAN_ROUTE_KEYS)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, GERMAN_ROUTE_KEYS, GERMAN_PAGES)
  return page ? buildGermanPageMetadata(page) : {}
}

export default async function GermanLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, GERMAN_ROUTE_KEYS, GERMAN_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={GERMAN_UI} lang='de' />
}
