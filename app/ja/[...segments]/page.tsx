import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { JAPANESE_PAGES, JAPANESE_ROUTE_KEYS, JAPANESE_UI, buildJapanesePageMetadata } from '@/src/lib/asian-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/src/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() {
  return generateLocalizedStaticParams(JAPANESE_ROUTE_KEYS)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, JAPANESE_ROUTE_KEYS, JAPANESE_PAGES)
  return page ? buildJapanesePageMetadata(page) : {}
}

export default async function JapaneseLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, JAPANESE_ROUTE_KEYS, JAPANESE_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={JAPANESE_UI} lang='ja' />
}
