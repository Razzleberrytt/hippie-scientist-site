import type { MetadataRoute } from 'next'
import postsData from '../data/blog/posts.json'
import stacksData from '@/public/data/stacks.json'
import { getCompoundSummaryIndex, getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import { indexableGuidePages } from './seo-entry-pages'
import { scientificCollections } from '@/lib/collections'
import { comparisonSlugs, stackSlugs } from './authority-links'

export const dynamic = 'force-static'

const siteUrl = 'https://www.thehippiescientist.net'

const sourceDateEpoch = process.env.SOURCE_DATE_EPOCH
  ? Number.parseInt(process.env.SOURCE_DATE_EPOCH, 10)
  : Number.NaN
const buildTimestamp = Number.isFinite(sourceDateEpoch)
  ? sourceDateEpoch * 1000
  : Date.UTC(2026, 5, 1)
const editorialDate = new Date(buildTimestamp)
const MAX_SITEMAP_ROUTES = Number.parseInt(process.env.SITEMAP_MAX_ROUTES || '5000', 10)

type SlugRecord = {
  slug?: string
  updatedAt?: string
  last_updated?: string
  date?: string
}

const cleanSlug = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const getLastModified = (record?: SlugRecord) => {
  const candidate = record?.updatedAt || record?.last_updated || record?.date
  if (!candidate) return editorialDate
  const parsed = new Date(candidate)
  return Number.isNaN(parsed.getTime()) ? editorialDate : parsed
}

const route = (
  path: string,
  options?: {
    lastModified?: Date
    priority?: number
    changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']
  },
): MetadataRoute.Sitemap[number] => ({
  url: path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`,
  lastModified: options?.lastModified || editorialDate,
  changeFrequency: options?.changeFrequency || 'monthly',
  priority: options?.priority || 0.6,
})

function stabilizeSitemapRoutes(
  routes: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>()

  for (const entry of routes) {
    if (!entry?.url) continue
    const existing = byUrl.get(entry.url)
    if (!existing || Number(entry.priority || 0) > Number(existing.priority || 0)) {
      byUrl.set(entry.url, entry)
    }
  }

  return [...byUrl.values()]
    .sort((a, b) => {
      const priorityDelta = Number(b.priority || 0) - Number(a.priority || 0)
      if (priorityDelta !== 0) return priorityDelta
      return String(a.url).localeCompare(String(b.url))
    })
    .slice(0, Math.max(0, MAX_SITEMAP_ROUTES))
}

const canonicalStaticRoutes = [
  '/about',
  '/affiliate-disclosure',
  '/a-tier',
  '/contact',
  '/compare',
  '/disclaimer',
  '/faq',
  '/guides',
  '/learn',
  '/learn/product-quality',
  '/methodology',
  '/privacy',
  '/safety-checker',
]

const clusterRoutes = [
  '/natural-anxiolytics-beyond-ashwagandha',
  '/sleep-herbs-vs-melatonin',
  '/psychedelic-adjacent-herbs',
]

const staticGuideRoutes = [
  '/guides/best-herbs-for-stress-and-anxiety-at-night',
  '/guides/best-natural-sleep-aids-that-work',
  '/guides/best-supplements-for-overthinking',
  '/guides/focus-without-caffeine-crash',
  '/guides/how-to-lower-cortisol-naturally',
  '/guides/magnesium-vs-melatonin',
  '/guides/natural-alternatives-to-anxiety-medication',
  '/guides/supplements-for-brain-fog-and-fatigue',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [herbs, runtimeCompounds] = await Promise.all([
    getHerbSummaryIndex(),
    getCompoundSummaryIndex(),
  ])

  const stacks = stacksData as SlugRecord[]
  const posts = postsData as SlugRecord[]

  const compoundRecords = runtimeCompounds
    .filter((compound: any) => getRuntimeVisibility(compound).canIndex)
    .map((compound: any) => ({
      slug: cleanSlug(compound.slug),
      updatedAt: compound.updatedAt || compound.last_updated,
    }))
    .filter((compound) => compound.slug)

  const herbRecords = herbs
    .filter((herb: any) => getRuntimeVisibility(herb).canIndex)
    .map((herb: any) => ({
      slug: cleanSlug(herb.slug),
      updatedAt: herb.updatedAt || herb.last_updated,
    }))
    .filter((herb) => herb.slug)

  return stabilizeSitemapRoutes([
    route('/', { priority: 1.0, changeFrequency: 'weekly' }),
    route('/compounds', { priority: 0.9, changeFrequency: 'weekly' }),
    route('/herbs', { priority: 0.9, changeFrequency: 'weekly' }),
    route('/goals', { priority: 0.8, changeFrequency: 'weekly' }),
    route('/stacks', { priority: 0.7, changeFrequency: 'monthly' }),
    route('/blog', { priority: 0.8, changeFrequency: 'weekly' }),

    ...canonicalStaticRoutes.map((path) =>
      route(path, { priority: 0.65, changeFrequency: 'monthly' }),
    ),

    ...indexableGuidePages.map((page) =>
      route(`/${page.route}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...staticGuideRoutes.map((path) =>
      route(path, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...clusterRoutes.map((path) =>
      route(path, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...scientificCollections.map((collection) =>
      route(`/collections/${collection.slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...goalConfigs.map((goal) =>
      route(`/goals/${goal.slug}`, { priority: 0.75, changeFrequency: 'monthly' }),
    ),

    ...supplementComparisons.map((comparison) =>
      route(`/compare/${comparison.slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...comparisonSlugs.map((slug) =>
      route(`/compare/${slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...stackSlugs.map((slug) =>
      route(`/stacks/${slug}`, { priority: 0.65, changeFrequency: 'monthly' }),
    ),

    ...stacks
      .map((stack) => cleanSlug(stack.slug))
      .filter(Boolean)
      .map((slug) =>
        route(`/stacks/${slug}`, { priority: 0.65, changeFrequency: 'monthly' }),
      ),

    ...herbRecords.map((record) =>
      route(`/herbs/${record.slug}`, {
        lastModified: getLastModified(record),
        priority: 0.9,
        changeFrequency: 'monthly',
      }),
    ),

    ...compoundRecords.map((record) =>
      route(`/compounds/${record.slug}`, {
        lastModified: getLastModified(record),
        priority: 0.9,
        changeFrequency: 'monthly',
      }),
    ),

    ...posts
      .map((post) => ({
        slug: cleanSlug(post.slug),
        updatedAt: post.updatedAt || post.last_updated,
        date: post.date,
      }))
      .filter((post) => post.slug)
      .map((post) =>
        route(`/blog/${post.slug}`, {
          lastModified: getLastModified(post),
          priority: 0.8,
          changeFrequency: 'weekly',
        }),
      ),
  ])
}
