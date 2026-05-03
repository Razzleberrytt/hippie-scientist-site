import type { MetadataRoute } from 'next'
import posts from '@/data/blog/posts.json'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { bestPages } from '@/data/best'
import { supplementComparisons } from '@/data/comparisons'

export const dynamic = 'force-static'

const siteUrl = 'https://thehippiescientist.net'
const now = new Date()

const route = (path: string): MetadataRoute.Sitemap[number] => ({
  url: path === '/' ? siteUrl : `${siteUrl}${path}`,
  lastModified: now,
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [herbs, runtimeCompounds] = await Promise.all([
    getHerbs(),
    getCompounds(),
  ])

  const stacks = stacksData as any[]
  const compoundSlugs = [...new Set(runtimeCompounds.map((c: any) => c.slug))]

  return [
    route('/'),
    route('/compounds'),
    route('/stacks'),

    ...bestPages.map(p => route(`/best/${p.slug}`)),
    ...supplementComparisons.map(c => route(`/compare/${c.slug}`)),
    ...stacks.map(s => route(`/stacks/${s.slug}`)),
    ...compoundSlugs.map(s => route(`/compounds/${s}`)),
    ...posts.map(p => route(`/blog/${p.slug}`)),
  ]
}
