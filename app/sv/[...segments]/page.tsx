import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { SWEDISH_PAGES, SWEDISH_ROUTE_KEYS, SWEDISH_UI, buildSwedishPageMetadata } from '@/lib/global-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() { return generateLocalizedStaticParams(SWEDISH_ROUTE_KEYS) }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, SWEDISH_ROUTE_KEYS, SWEDISH_PAGES)
  return page ? buildSwedishPageMetadata(page) : {}
}
export default async function SwedishLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, SWEDISH_ROUTE_KEYS, SWEDISH_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={SWEDISH_UI} lang='sv' />
}
