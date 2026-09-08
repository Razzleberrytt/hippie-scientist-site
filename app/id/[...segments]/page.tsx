import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { INDONESIAN_PAGES, INDONESIAN_ROUTE_KEYS, INDONESIAN_UI, buildIndonesianPageMetadata } from '@/lib/hi-id-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false
export function generateStaticParams() { return generateLocalizedStaticParams(INDONESIAN_ROUTE_KEYS) }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const page = await resolveLocalizedPage(params, INDONESIAN_ROUTE_KEYS, INDONESIAN_PAGES); return page ? buildIndonesianPageMetadata(page) : {} }
export default async function IndonesianLocalizedPage({ params }: PageProps) { const page = await resolveLocalizedPage(params, INDONESIAN_ROUTE_KEYS, INDONESIAN_PAGES); if (!page) notFound(); return <LocalizedCorePage page={page} ui={INDONESIAN_UI} lang='id' /> }
