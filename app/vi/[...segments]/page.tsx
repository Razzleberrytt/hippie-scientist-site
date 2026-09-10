import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { VIETNAMESE_PAGES, VIETNAMESE_ROUTE_KEYS, VIETNAMESE_UI, buildVietnamesePageMetadata } from '@/lib/global-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() { return generateLocalizedStaticParams(VIETNAMESE_ROUTE_KEYS) }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, VIETNAMESE_ROUTE_KEYS, VIETNAMESE_PAGES)
  return page ? buildVietnamesePageMetadata(page) : {}
}
export default async function VietnameseLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, VIETNAMESE_ROUTE_KEYS, VIETNAMESE_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={VIETNAMESE_UI} lang='vi' />
}
