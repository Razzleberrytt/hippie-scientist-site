import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { ARABIC_PAGES, ARABIC_ROUTE_KEYS, ARABIC_UI, buildArabicPageMetadata } from '@/lib/global-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() { return generateLocalizedStaticParams(ARABIC_ROUTE_KEYS) }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, ARABIC_ROUTE_KEYS, ARABIC_PAGES)
  return page ? buildArabicPageMetadata(page) : {}
}
export default async function ArabicLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, ARABIC_ROUTE_KEYS, ARABIC_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={ARABIC_UI} lang='ar' />
}
