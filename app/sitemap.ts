import type { MetadataRoute } from 'next'
import { execFileSync } from 'node:child_process'
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
  updated_at?: string
  date_modified?: string
  reviewed_date?: string
  created_at?: string
  published_date?: string
  authority_patch_date?: string
  date?: string
}

const cleanSlug = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const sourceDateCache = new Map<string, Date>()
const sourceDateHistoryCache = new Map<string, Date[]>()
const deprecatedCompoundSlugs = new Set([
  'coq10',
  'coenzyme-q10-ubiquinol',
  'theanine',
  'l-theanine-sleep',
  'methyleugenol',
  'bcaas',
  'green-tea-egcg-isolated',
  'green-tea-extract-egcg',
  'probiotic-multistrain',
  'probiotic-strain-bifidobacterium',
  'probiotic-strain-lactobacillus',
  'probiotics-bifidobacterium',
  'probiotics-lactobacillus',
  'taurine-blend',
  'taurine-sleep',
  'glycine-sleep',
  'inositol-sleep',
  'ashwagandha-extract-ksm-66',
  'ashwagandha-root-extract',
  'garlic',
  'garlic-extract',
  'garlic-aged-extract',
  'aged-garlic-extract',
  'ginger',
  'gingerol',
  'gingerols',
  'valerian',
  'valerian-extract-standardized',
  'valerian-root-extract',
  'lions-mane',
  'passionflower',
  'passionflower-extract',
  'passionflower-extract-standardized',
  'kava',
  'kavalactones',
  'reishi',
  'maca',
  'maca-root-extract',
  'elderberry',
  'resveratrol',
  'trans-resveratrol',
])

const deprecatedHerbSlugs = new Set([
  'allium-sativum',
  'valeriana-officinalis',
  'hericium-erinaceus',
  'passiflora-incarnata',
  'piper-methysticum',
  'ganoderma-lucidum',
])

const canonicalHerbAliases = [
  { slug: 'passionflower', sourceSlug: 'passiflora-incarnata' },
  { slug: 'kava', sourceSlug: 'piper-methysticum' },
]

const sourceDate = (sourcePath: string) => {
  if (sourceDateCache.has(sourcePath)) {
    return sourceDateCache.get(sourcePath) as Date
  }

  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', sourcePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    const parsed = new Date(iso)
    if (!Number.isNaN(parsed.getTime())) {
      sourceDateCache.set(sourcePath, parsed)
      return parsed
    }
  } catch {
    // Fall through to editorialDate; build environments without git still export.
  }

  console.warn(`[sitemap] Falling back to editorial date for source file ${sourcePath}`)
  sourceDateCache.set(sourcePath, editorialDate)
  return editorialDate
}

const sourceDateHistory = (sourcePath: string) => {
  if (sourceDateHistoryCache.has(sourcePath)) {
    return sourceDateHistoryCache.get(sourcePath) as Date[]
  }

  try {
    const output = execFileSync('git', ['log', '--format=%cI', '--', sourcePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const dates = output
      .split(/\r?\n/)
      .map((value) => new Date(value.trim()))
      .filter((date) => !Number.isNaN(date.getTime()))
    if (dates.length > 0) {
      sourceDateHistoryCache.set(sourcePath, dates)
      return dates
    }
  } catch {
    // Fall through to the single source date.
  }

  const fallback = [sourceDate(sourcePath)]
  sourceDateHistoryCache.set(sourcePath, fallback)
  return fallback
}

const stableIndex = (value: string, size: number) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return size > 0 ? hash % size : 0
}

const sourcePathForStaticRoute = (routePath: string) => {
  const trimmed = routePath.replace(/^\/+/, '')
  return trimmed ? `app/${trimmed}/page.tsx` : 'app/page.tsx'
}

const getLastModified = (
  record: SlugRecord | undefined,
  fallback: Date,
  label: string,
) => {
  const candidate =
    record?.updatedAt ||
    record?.last_updated ||
    record?.updated_at ||
    record?.date_modified ||
    record?.reviewed_date ||
    record?.authority_patch_date ||
    record?.created_at ||
    record?.published_date ||
    record?.date
  if (!candidate) return fallback
  const parsed = new Date(candidate)
  if (!Number.isNaN(parsed.getTime())) return parsed

  console.warn(`[sitemap] Invalid lastmod for ${label}: ${String(candidate)}. Using source fallback.`)
  return fallback
}

const getRecordLastModified = (
  record: SlugRecord | undefined,
  sourcePath: string,
  label: string,
) => {
  const fallback = sourceDate(sourcePath)
  const candidate =
    record?.updatedAt ||
    record?.last_updated ||
    record?.updated_at ||
    record?.date_modified ||
    record?.reviewed_date ||
    record?.authority_patch_date ||
    record?.created_at ||
    record?.published_date ||
    record?.date

  if (!candidate) {
    const history = sourceDateHistory(sourcePath)
    const sourceHistoryDate = history[stableIndex(`${label}:${record?.slug || ''}`, history.length)]
    console.warn(`[sitemap] Missing per-record lastmod for ${label}. Using git history date for ${sourcePath}.`)
    return sourceHistoryDate
  }

  return getLastModified(record, fallback, label)
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

const staticGuideRoutes = [
  '/guides/best-herbs-for-stress-and-anxiety-at-night',
  '/guides/best-natural-sleep-aids-that-work',
  '/guides/best-supplements-for-overthinking',
  '/guides/focus-without-caffeine-crash',
  '/guides/how-to-lower-cortisol-naturally',
  '/guides/magnesium-vs-melatonin',
  '/guides/natural-anxiolytics-beyond-ashwagandha',
  '/guides/natural-alternatives-to-anxiety-medication',
  '/guides/psychedelic-adjacent-herbs',
  '/guides/sleep-herbs-vs-melatonin',
  '/guides/supplements-for-brain-fog-and-fatigue',
]

const categoricalStackSlugs = new Set(['sleep', 'stress', 'cognition'])

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
      updated_at: compound.updated_at,
      date_modified: compound.date_modified,
      reviewed_date: compound.reviewed_date,
      authority_patch_date: compound.authority_patch_date,
      created_at: compound.created_at,
      published_date: compound.published_date,
    }))
    .filter((compound) => compound.slug && !deprecatedCompoundSlugs.has(compound.slug))

  const herbRecords = herbs
    .filter((herb: any) => getRuntimeVisibility(herb).canIndex)
    .map((herb: any) => ({
      slug: cleanSlug(herb.slug),
      updatedAt: herb.updatedAt || herb.last_updated,
      updated_at: herb.updated_at,
      date_modified: herb.date_modified,
      reviewed_date: herb.reviewed_date,
      created_at: herb.created_at,
      published_date: herb.published_date,
    }))
    .filter((herb) => herb.slug && !deprecatedHerbSlugs.has(herb.slug))

  const herbRecordBySlug = new Map(herbRecords.map((record) => [record.slug, record]))
  for (const alias of canonicalHerbAliases) {
    if (!herbRecordBySlug.has(alias.slug)) {
      const sourceRecord = herbs.find((herb: any) => cleanSlug(herb.slug) === alias.sourceSlug)
      herbRecords.push({
        slug: alias.slug,
        updatedAt: sourceRecord?.updatedAt || sourceRecord?.last_updated,
        updated_at: sourceRecord?.updated_at,
        date_modified: sourceRecord?.date_modified,
        reviewed_date: sourceRecord?.reviewed_date,
        created_at: sourceRecord?.created_at,
        published_date: sourceRecord?.published_date,
      })
    }
  }

  return stabilizeSitemapRoutes([
    route('/', { priority: 1.0, changeFrequency: 'weekly' }),
    route('/compounds', { priority: 0.9, changeFrequency: 'weekly' }),
    route('/herbs', { priority: 0.9, changeFrequency: 'weekly' }),
    route('/goals', { priority: 0.8, changeFrequency: 'weekly' }),
    route('/stacks', { priority: 0.7, changeFrequency: 'monthly' }),
    route('/blog', { priority: 0.8, changeFrequency: 'weekly' }),

    ...canonicalStaticRoutes.map((path) =>
      route(path, {
        lastModified: sourceDate(sourcePathForStaticRoute(path)),
        priority: 0.65,
        changeFrequency: 'monthly',
      }),
    ),

    ...indexableGuidePages.map((page) =>
      route(`/${page.route}`, {
        lastModified: sourceDate('app/seo-entry-pages.tsx'),
        priority: 0.7,
        changeFrequency: 'monthly',
      }),
    ),

    ...staticGuideRoutes.map((path) =>
      route(path, {
        lastModified: sourceDate(sourcePathForStaticRoute(path)),
        priority: 0.7,
        changeFrequency: 'monthly',
      }),
    ),

    ...scientificCollections.map((collection) =>
      route(`/collections/${collection.slug}`, {
        lastModified: sourceDate('lib/collections.ts'),
        priority: 0.7,
        changeFrequency: 'monthly',
      }),
    ),

    ...goalConfigs.map((goal) =>
      route(`/goals/${goal.slug}`, {
        lastModified: sourceDate('data/goals.ts'),
        priority: 0.75,
        changeFrequency: 'monthly',
      }),
    ),

    ...supplementComparisons.map((comparison) =>
      route(`/compare/${comparison.slug}`, {
        lastModified: sourceDate('data/comparisons.ts'),
        priority: 0.7,
        changeFrequency: 'monthly',
      }),
    ),

    ...comparisonSlugs.map((slug) =>
      route(`/compare/${slug}`, {
        lastModified: sourceDate('app/authority-links.ts'),
        priority: 0.7,
        changeFrequency: 'monthly',
      }),
    ),

    ...stackSlugs.map((slug) =>
      route(`/stacks/${slug}`, {
        lastModified: sourceDate('app/authority-links.ts'),
        priority: 0.75,
        changeFrequency: 'weekly',
      }),
    ),

    ...stacks
      .map((stack) => cleanSlug(stack.slug))
      .filter(Boolean)
      .map((slug) =>
        route(`/stacks/${slug}`, {
          lastModified: sourceDate('public/data/stacks.json'),
          priority: categoricalStackSlugs.has(slug) ? 0.6 : 0.65,
          changeFrequency: 'monthly',
        }),
      ),

    ...herbRecords.map((record) =>
      route(`/herbs/${record.slug}`, {
        lastModified: getRecordLastModified(record, 'public/data/herbs.json', `herb:${record.slug}`),
        priority: 0.9,
        changeFrequency: 'monthly',
      }),
    ),

    ...compoundRecords.map((record) =>
      route(`/compounds/${record.slug}`, {
        lastModified: getRecordLastModified(record, 'public/data/compounds.json', `compound:${record.slug}`),
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
          lastModified: getLastModified(post, sourceDate('data/blog/posts.json'), `blog:${post.slug}`),
          priority: 0.8,
          changeFrequency: 'weekly',
        }),
      ),
  ])
}
