import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import {
  POLISH_PAGES,
  POLISH_ROUTE_KEYS,
  POLISH_UI,
  buildPolishPageMetadata,
} from '@/src/lib/expanded-language-content'
import {
  generateLocalizedStaticParams,
  resolveLocalizedPage,
  type LocalizedRouteParams,
} from '@/src/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() {
  return generateLocalizedStaticParams(POLISH_ROUTE_KEYS)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, POLISH_ROUTE_KEYS, POLISH_PAGES)
  return page ? buildPolishPageMetadata(page) : {}
}

export default async function PolishLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, POLISH_ROUTE_KEYS, POLISH_PAGES)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={POLISH_UI} lang='pl' />
}
