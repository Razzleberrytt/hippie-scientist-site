import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { RUSSIAN_PAGES, RUSSIAN_ROUTE_KEYS, RUSSIAN_UI, buildRussianPageMetadata } from '@/lib/global-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() { return generateLocalizedStaticParams(RUSSIAN_ROUTE_KEYS) }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, RUSSIAN_ROUTE_KEYS, RUSSIAN_PAGES)
  return page ? buildRussianPageMetadata(page) : {}
}
export default async function RussianLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, RUSSIAN_ROUTE_KEYS, RUSSIAN_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={RUSSIAN_UI} lang='ru' />
}
