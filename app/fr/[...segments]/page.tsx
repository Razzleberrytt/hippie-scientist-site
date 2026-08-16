import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import {
  FRENCH_PAGES,
  FRENCH_ROUTE_KEYS,
  FRENCH_UI,
  buildFrenchPageMetadata,
  type FrenchPageKey,
} from '@/src/lib/french-content'

type PageProps = { params: Promise<{ segments: string[] }> }
export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(FRENCH_ROUTE_KEYS).map((route) => ({ segments: route.split('/') }))
}

async function resolvePage(params: PageProps['params']) {
  const { segments } = await params
  const key = FRENCH_ROUTE_KEYS[segments.join('/')] as FrenchPageKey | undefined
  return key ? FRENCH_PAGES[key] : null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolvePage(params)
  return page ? buildFrenchPageMetadata(page) : {}
}

export default async function FrenchLocalizedPage({ params }: PageProps) {
  const page = await resolvePage(params)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={FRENCH_UI} lang='fr' />
}
