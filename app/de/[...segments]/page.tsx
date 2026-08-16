import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import {
  GERMAN_PAGES,
  GERMAN_ROUTE_KEYS,
  GERMAN_UI,
  buildGermanPageMetadata,
  type GermanPageKey,
} from '@/src/lib/german-content'

type PageProps = { params: Promise<{ segments: string[] }> }
export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(GERMAN_ROUTE_KEYS).map((route) => ({ segments: route.split('/') }))
}

async function resolvePage(params: PageProps['params']) {
  const { segments } = await params
  const key = GERMAN_ROUTE_KEYS[segments.join('/')] as GermanPageKey | undefined
  return key ? GERMAN_PAGES[key] : null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolvePage(params)
  return page ? buildGermanPageMetadata(page) : {}
}

export default async function GermanLocalizedPage({ params }: PageProps) {
  const page = await resolvePage(params)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={GERMAN_UI} lang='de' />
}
