import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { TURKISH_PAGES, TURKISH_ROUTE_KEYS, TURKISH_UI, buildTurkishPageMetadata } from '@/lib/zh-tr-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false
export function generateStaticParams() { return generateLocalizedStaticParams(TURKISH_ROUTE_KEYS) }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const page = await resolveLocalizedPage(params, TURKISH_ROUTE_KEYS, TURKISH_PAGES); return page ? buildTurkishPageMetadata(page) : {} }
export default async function TurkishLocalizedPage({ params }: PageProps) { const page = await resolveLocalizedPage(params, TURKISH_ROUTE_KEYS, TURKISH_PAGES); if (!page) notFound(); return <LocalizedCorePage page={page} ui={TURKISH_UI} lang='tr' /> }
