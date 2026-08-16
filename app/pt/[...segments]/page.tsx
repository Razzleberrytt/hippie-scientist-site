import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import {
  PORTUGUESE_PAGES,
  PORTUGUESE_ROUTE_KEYS,
  PORTUGUESE_UI,
  buildPortuguesePageMetadata,
} from '@/src/lib/portuguese-content'
import {
  generateLocalizedStaticParams,
  resolveLocalizedPage,
  type LocalizedRouteParams,
} from '@/src/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() {
  return generateLocalizedStaticParams(PORTUGUESE_ROUTE_KEYS)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, PORTUGUESE_ROUTE_KEYS, PORTUGUESE_PAGES)
  return page ? buildPortuguesePageMetadata(page) : {}
}

export default async function PortugueseLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, PORTUGUESE_ROUTE_KEYS, PORTUGUESE_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={PORTUGUESE_UI} lang='pt-BR' />
}
