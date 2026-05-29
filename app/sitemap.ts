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
import { SITE_URL } from '@/lib/seo'
import {
  authorityEcosystemSlugs,
  authorityTopicSlugs,
  bestForSlugs,
  comparisonSlugs,
  protocolSlugs,
  stackSlugs,
} from './authority-links'

export const dynamic = 'force-static'

// Static shell routes use a build-aware fallback when no per-record updatedAt exists.
// SOURCE_DATE_EPOCH supports reproducible builds; BUILD_TIME can be injected by CI
// (for example, Cloudflare Pages or GitHub Actions); otherwise this snapshots at build time.
const editorialDate = (() => {
  if (process.env.SOURCE_DATE_EPOCH) {
    return new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000)
  }
  if (process.env.BUILD_TIME) {
    const d = new Date(process.env.BUILD_TIME)
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date()
})()
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
  url: path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`,
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
    if (!existing) {
      byUrl.set(entry.url, entry)
      continue
    }
    if (Number(entry.priority || 0) > Number(existing.priority || 0)) {
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
    // Differentiated priorities — homepage and library pages ranked above thin pages
    route('/', { priority: 1.0, changeFrequency: 'weekly' }),
    route('/compounds', { priority: 0.9, changeFrequency: 'weekly' }),
    route('/herbs', { priority: 0.9, changeFrequency: 'weekly' }),
    route('/blog', { priority: 0.8, changeFrequency: 'weekly' }),
    route('/goals', { priority: 0.8, changeFrequency: 'weekly' }),
    route('/stacks', { priority: 0.7, changeFrequency: 'monthly' }),
    // /compare omitted — page is blank. Re-add once the tool renders correctly.
    route('/topics', { priority: 0.7, changeFrequency: 'weekly' }),
    route('/ecosystems', { priority: 0.7, changeFrequency: 'weekly' }),
    route('/protocols', { priority: 0.7, changeFrequency: 'monthly' }),
    // /safety-checker added — working tool previously missing from sitemap
    route('/safety-checker', { priority: 0.7, changeFrequency: 'monthly' }),

    ...seoEntryPages.map(page =>
      route(`/${page.route}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...clusterRoutes.map((path) =>
      route(path, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...pathwayRoutes.map((path) =>
      route(path, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...scientificCollections.map(collection =>
      route(`/collections/${collection.slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...goalConfigs.map(g =>
      route(`/goals/${g.slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...bestPages.map(p =>
      route(`/best/${p.slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...supplementComparisons.map(c =>
      route(`/compare/${c.slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...authorityTopicSlugs.map((slug) =>
      route(`/topics/${slug}`, { priority: 0.7, changeFrequency: 'weekly' }),
    ),

    ...authorityEcosystemSlugs.map((slug) =>
      route(`/ecosystems/${slug}`, { priority: 0.7, changeFrequency: 'weekly' }),
    ),

    ...bestForSlugs.map((slug) =>
      route(`/best/${slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...comparisonSlugs.map((slug) =>
      route(`/compare/${slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...stackSlugs.map((slug) =>
      route(`/stacks/${slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...protocolSlugs.map((slug) =>
      route(`/protocols/${slug}`, { priority: 0.7, changeFrequency: 'monthly' }),
    ),

    ...stacks
      .map(s => cleanSlug(s.slug))
      .filter(Boolean)
      .map(s =>
        route(`/stacks/${s}`, { priority: 0.7, changeFrequency: 'monthly' }),
      ),

    // Herb & compound profiles — priority 0.9, real lastModified dates
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

    route('/blog/categories', { priority: 0.55, changeFrequency: 'monthly' }),
    route('/blog/tags', { priority: 0.5, changeFrequency: 'monthly' }),

    ...posts
      .map(post => ({
        slug: cleanSlug(post.slug),
        updatedAt: post.updatedAt || post.last_updated,
      }))
      .filter(post => post.slug)
      .map(post =>
        route(`/blog/${post.slug}`, {
          lastModified: getLastModified(post),
          priority: 0.8,
          changeFrequency: 'monthly',
        }),
      ),
  ])
}
