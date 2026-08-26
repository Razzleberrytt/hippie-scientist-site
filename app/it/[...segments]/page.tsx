import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import {
  ITALIAN_PAGES,
  ITALIAN_ROUTE_KEYS,
  ITALIAN_UI,
  buildItalianPageMetadata,
} from '@/src/lib/expanded-language-content'
import {
  generateLocalizedStaticParams,
  resolveLocalizedPage,
  type LocalizedRouteParams,
} from '@/src/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() {
  return generateLocalizedStaticParams(ITALIAN_ROUTE_KEYS)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, ITALIAN_ROUTE_KEYS, ITALIAN_PAGES)
  return page ? buildItalianPageMetadata(page) : {}
}

export default async function ItalianLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, ITALIAN_ROUTE_KEYS, ITALIAN_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={ITALIAN_UI} lang='it' />
}
