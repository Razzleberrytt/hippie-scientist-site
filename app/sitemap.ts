import type { MetadataRoute } from 'next'
import postsData from '@/data/blog/posts.json'
import stacksData from '@/public/data/stacks.json'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { bestPages } from '@/data/best'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import { seoEntryPages } from './seo-entry-pages'

export const dynamic = 'force-static'

const siteUrl = 'https://thehippiescientist.net'
const now = new Date()

type SlugRecord = { slug?: string }

const route = (path: string): MetadataRoute.Sitemap[number] => ({
  url: path === '/' ? siteUrl : `${siteUrl}${path}`,
  lastModified: now,
})

const clusterRoutes = [
  '/natural-anxiolytics-beyond-ashwagandha',
  '/sleep-herbs-vs-melatonin',
  '/psychedelic-adjacent-herbs',
]

const cleanSlug = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [herbs, runtimeCompounds] = await Promise.all([
    getHerbs(),
    getCompounds(),
  ])

  const stacks = stacksData as SlugRecord[]
  const posts = postsData as SlugRecord[]
  const compoundSlugs = [...new Set(runtimeCompounds.map((c: any) => cleanSlug(c.slug)).filter(Boolean))]
  const herbSlugs = [...new Set(herbs.map((h: any) => cleanSlug(h.slug)).filter(Boolean))]

  return [
    route('/'),
    route('/compounds'),
    route('/herbs'),
    route('/stacks'),
    route('/goals'),
    route('/compare'),

    ...seoEntryPages.map(page => route(`/${page.route}`)),
    ...clusterRoutes.map(route),
    ...goalConfigs.map(g => route(`/goals/${g.slug}`)),
    ...bestPages.map(p => route(`/best/${p.slug}`)),
    ...supplementComparisons.map(c => route(`/compare/${c.slug}`)),
    ...stacks.map(s => cleanSlug(s.slug)).filter(Boolean).map(s => route(`/stacks/${s}`)),
    ...herbSlugs.map(s => route(`/herbs/${s}`)),
    ...compoundSlugs.map(s => route(`/compounds/${s}`)),
    ...posts.map(p => cleanSlug(p.slug)).filter(Boolean).map(s => route(`/blog/${s}`)),
  ]
}
