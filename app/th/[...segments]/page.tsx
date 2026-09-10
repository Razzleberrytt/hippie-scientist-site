import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { THAI_PAGES, THAI_ROUTE_KEYS, THAI_UI, buildThaiPageMetadata } from '@/lib/global-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() { return generateLocalizedStaticParams(THAI_ROUTE_KEYS) }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, THAI_ROUTE_KEYS, THAI_PAGES)
  return page ? buildThaiPageMetadata(page) : {}
}
export default async function ThaiLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, THAI_ROUTE_KEYS, THAI_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={THAI_UI} lang='th' />
}
