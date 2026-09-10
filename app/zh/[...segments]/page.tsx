import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { CHINESE_PAGES, CHINESE_ROUTE_KEYS, CHINESE_UI, buildChinesePageMetadata } from '@/lib/zh-tr-language-content'
import { generateLocalizedStaticParams, resolveLocalizedPage, type LocalizedRouteParams } from '@/lib/localized-route-runtime'

type PageProps = { params: LocalizedRouteParams }
export const dynamicParams = false
export function generateStaticParams() { return generateLocalizedStaticParams(CHINESE_ROUTE_KEYS) }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const page = await resolveLocalizedPage(params, CHINESE_ROUTE_KEYS, CHINESE_PAGES); return page ? buildChinesePageMetadata(page) : {} }
export default async function ChineseLocalizedPage({ params }: PageProps) { const page = await resolveLocalizedPage(params, CHINESE_ROUTE_KEYS, CHINESE_PAGES); if (!page) notFound(); return <LocalizedCorePage page={page} ui={CHINESE_UI} lang='zh' /> }
