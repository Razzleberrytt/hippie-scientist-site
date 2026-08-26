import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import {
  DUTCH_PAGES,
  DUTCH_ROUTE_KEYS,
  DUTCH_UI,
  buildDutchPageMetadata,
} from '@/src/lib/expanded-language-content'
import {
  generateLocalizedStaticParams,
  resolveLocalizedPage,
  type LocalizedRouteParams,
} from '@/src/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() {
  return generateLocalizedStaticParams(DUTCH_ROUTE_KEYS)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, DUTCH_ROUTE_KEYS, DUTCH_PAGES)
  return page ? buildDutchPageMetadata(page) : {}
}

export default async function DutchLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, DUTCH_ROUTE_KEYS, DUTCH_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={DUTCH_UI} lang='nl' />
}
