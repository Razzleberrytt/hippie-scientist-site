import type { MetadataRoute } from 'next'
import postsData from '@/data/blog/posts.json'
import stacksData from '@/public/data/stacks.json'
import { getCompoundSummaryIndex, getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { bestPages } from '@/data/best'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import { seoEntryPages } from './seo-entry-pages'
import { scientificCollections } from '@/lib/collections'
import {
  authorityEcosystemSlugs,
  authorityTopicSlugs,
  bestForSlugs,
  comparisonSlugs,
  protocolSlugs,
  stackSlugs,
} from './authority-links'

export const dynamic = 'force-static'

const siteUrl = 'https://www.thehippiescientist.net'
const now = new Date()

type SlugRecord = { slug?: string }

const route = (path: string): MetadataRoute.Sitemap[number] => ({
  url: path === '/' ? siteUrl : `${siteUrl}${path}`,
  lastModified: now,
})

const pathwayRoutes = [
  '/pathways/gaba',
  '/pathways/dopamine',
  '/pathways/inflammation',
]

const clusterRoutes = [
  '/natural-anxiolytics-beyond-ashwagandha',
  '/sleep-herbs-vs-melatonin',
  '/psychedelic-adjacent-herbs',
]

const cleanSlug = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [herbs, runtimeCompounds] = await Promise.all([
    getHerbSummaryIndex(),
    getCompoundSummaryIndex(),
  ])

  const stacks = stacksData as SlugRecord[]
  const posts = postsData as SlugRecord[]

  const compoundSlugs = [
    ...new Set(
      runtimeCompounds
        .filter((compound: any) => getRuntimeVisibility(compound).canIndex)
        .map((c: any) => cleanSlug(c.slug))
        .filter(Boolean)
    ),
  ]

  const herbSlugs = [
    ...new Set(
      herbs
        .filter((herb: any) => getRuntimeVisibility(herb).canIndex)
        .map((h: any) => cleanSlug(h.slug))
        .filter(Boolean)
    ),
  ]

  return [
    route('/'),
    route('/compounds'),
    route('/herbs'),
    route('/stacks'),
    route('/goals'),
    route('/compare'),
    route('/topics'),
    route('/ecosystems'),
    route('/protocols'),

    ...seoEntryPages.map(page => route(`/${page.route}`)),
    ...clusterRoutes.map(route),
    ...pathwayRoutes.map(route),
    ...scientificCollections.map(collection => route(`/collections/${collection.slug}`)),
    ...goalConfigs.map(g => route(`/goals/${g.slug}`)),
    ...bestPages.map(p => route(`/best/${p.slug}`)),
    ...supplementComparisons.map(c => route(`/compare/${c.slug}`)),

    ...authorityTopicSlugs.map((slug) => route(`/topics/${slug}`)),
    ...authorityEcosystemSlugs.map((slug) => route(`/ecosystems/${slug}`)),
    ...bestForSlugs.map((slug) => route(`/best/${slug}`)),
    ...comparisonSlugs.map((slug) => route(`/compare/${slug}`)),
    ...stackSlugs.map((slug) => route(`/stacks/${slug}`)),
    ...protocolSlugs.map((slug) => route(`/protocols/${slug}`)),

    ...stacks.map(s => cleanSlug(s.slug)).filter(Boolean).map(s => route(`/stacks/${s}`)),
    ...herbSlugs.map(s => route(`/herbs/${s}`)),
    ...compoundSlugs.map(s => route(`/compounds/${s}`)),
    ...posts.map(p => cleanSlug(p.slug)).filter(Boolean).map(s => route(`/blog/${s}`)),
  ]
}
