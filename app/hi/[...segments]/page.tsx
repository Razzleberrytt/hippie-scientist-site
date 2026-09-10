import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { HINDI_PAGES, HINDI_ROUTE_KEYS, HINDI_UI, buildHindiPageMetadata } from '@/lib/hi-id-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false
export function generateStaticParams() { return generateLocalizedStaticParams(HINDI_ROUTE_KEYS) }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const page = await resolveLocalizedPage(params, HINDI_ROUTE_KEYS, HINDI_PAGES); return page ? buildHindiPageMetadata(page) : {} }
export default async function HindiLocalizedPage({ params }: PageProps) { const page = await resolveLocalizedPage(params, HINDI_ROUTE_KEYS, HINDI_PAGES); if (!page) notFound(); return <LocalizedCorePage page={page} ui={HINDI_UI} lang='hi' /> }
