import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import {
  PORTUGUESE_PAGES,
  PORTUGUESE_ROUTE_KEYS,
  PORTUGUESE_UI,
  buildPortuguesePageMetadata,
  type PortuguesePageKey,
} from '@/src/lib/portuguese-content'

type PageProps = {
  params: Promise<{ segments: string[] }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(PORTUGUESE_ROUTE_KEYS).map((route) => ({ segments: route.split('/') }))
}

async function resolvePage(params: PageProps['params']) {
  const { segments } = await params
  const key = PORTUGUESE_ROUTE_KEYS[segments.join('/')] as PortuguesePageKey | undefined
  return key ? PORTUGUESE_PAGES[key] : null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await resolvePage(params)
  if (!page) return {}
  return buildPortuguesePageMetadata(page)
}

export default async function PortugueseLocalizedPage({ params }: PageProps) {
  const page = await resolvePage(params)
  if (!page) notFound()
  return <LocalizedCorePage page={page} ui={PORTUGUESE_UI} lang='pt-BR' />
}
