import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { KOREAN_PAGES, KOREAN_ROUTE_KEYS, KOREAN_UI, buildKoreanPageMetadata } from '@/src/lib/asian-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/src/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() {
  return generateLocalizedStaticParams(KOREAN_ROUTE_KEYS)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, KOREAN_ROUTE_KEYS, KOREAN_PAGES)
  return page ? buildKoreanPageMetadata(page) : {}
}

export default async function KoreanLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, KOREAN_ROUTE_KEYS, KOREAN_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={KOREAN_UI} lang='ko' />
}
