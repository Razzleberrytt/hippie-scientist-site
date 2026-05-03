import type { MetadataRoute } from 'next'
import posts from '@/data/blog/posts.json'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { bestPages } from '@/data/best'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

export const dynamic = 'force-static'

const siteUrl = 'https://thehippiescientist.net'
const now = new Date()

const route = (path: string): MetadataRoute.Sitemap[number] => ({
  url: path === '/' ? siteUrl : `${siteUrl}${path}`,
  lastModified: now,
})

const seoEntryRoutes = [
  '/best-supplements-for-sleep',
  '/best-supplements-for-stress',
  '/best-supplements-for-focus',
  '/best-supplements-for-fat-loss',
  '/best-supplements-for-blood-pressure',
  '/best-supplements-for-gut-health',
  '/best-supplements-for-joint-support',
  '/natural-testosterone-boosters',
]

const clusterRoutes = [
  '/natural-anxiolytics-beyond-ashwagandha',
  '/sleep-herbs-vs-melatonin',
  '/psychedelic-adjacent-herbs',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [herbs, runtimeCompounds] = await Promise.all([
    getHerbs(),
    getCompounds(),
  ])

  const stacks = stacksData as any[]
  const compoundSlugs = [...new Set(runtimeCompounds.map((c: any) => c.slug))]
  const herbSlugs = [...new Set(herbs.map((h: any) => h.slug).filter(Boolean))]

  return [
    route('/'),
    route('/compounds'),
    route('/herbs'),
    route('/stacks'),
    route('/goals'),
    route('/compare'),

    ...seoEntryRoutes.map(route),
    ...clusterRoutes.map(route),
    ...goalConfigs.map(g => route(`/goals/${g.slug}`)),
    ...bestPages.map(p => route(`/best/${p.slug}`)),
    ...supplementComparisons.map(c => route(`/compare/${c.slug}`)),
    ...stacks.map(s => route(`/stacks/${s.slug}`)),
    ...herbSlugs.map(s => route(`/herbs/${s}`)),
    ...compoundSlugs.map(s => route(`/compounds/${s}`)),
    ...posts.map(p => route(`/blog/${p.slug}`)),
  ]
}
