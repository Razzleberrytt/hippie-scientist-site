import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SpanishCorePage from '@/components/localization/SpanishCorePage'
import { SPANISH_PAGES, buildSpanishPageMetadata } from '@/src/lib/spanish-content'
import { SPANISH_ROUTE_KEYS } from '@/src/lib/spanish-routes'
import {
  generateLocalizedStaticParams,
  resolveLocalizedPage,
  type LocalizedRouteParams,
} from '@/src/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false

export function generateStaticParams() {
  return generateLocalizedStaticParams(SPANISH_ROUTE_KEYS)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolveLocalizedPage(params, SPANISH_ROUTE_KEYS, SPANISH_PAGES)
  return page ? buildSpanishPageMetadata(page) : {}
}

export default async function SpanishLocalizedPage({ params }: PageProps) {
  const page = await resolveLocalizedPage(params, SPANISH_ROUTE_KEYS, SPANISH_PAGES)
  if (!page) notFound()
  return <SpanishCorePage page={page} />
}
