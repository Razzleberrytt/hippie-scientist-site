import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const BLOG_PER_PAGE = 12
const DEFAULT_ENTITY_CAP = Number.parseInt(process.env.PRERENDER_ENTITY_CAP || '500', 10)

const CORE_STATIC_ROUTES = [
  '/',
  '/about',
  '/blog',
  '/newsletter',
  '/privacy',
  '/disclaimer',
  '/methodology',
  '/contact',
  '/learning',
  '/herbs',
  '/compounds',
  '/build',
]

const DISALLOWED_ROUTES = [
  '/analytics',
  '/data-fix',
  '/graph',
  '/theme',
  '/preview',
  '/drafts',
  '/tmp',
  '/temp',
  '/test',
  '/dev',
  '/herb-index',
]

const CORE_ROUTE_META = new Map([
  ['/', { title: 'The Hippie Scientist', description: 'Science-first herbal education and evidence-aware reference pages.' }],
  ['/about', { title: 'About | The Hippie Scientist', description: 'Editorial standards, mission, and evidence posture.' }],
  ['/blog', { title: 'Research Notebook | The Hippie Scientist', description: 'Mechanism-focused herbal and compound research notes.' }],
  ['/newsletter', { title: 'Newsletter | The Hippie Scientist', description: 'Get research notes, safety-first updates, and new guides.' }],
  ['/privacy', { title: 'Privacy Policy | The Hippie Scientist', description: 'How The Hippie Scientist handles analytics and subscriber data.' }],
  ['/disclaimer', { title: 'Disclaimer | The Hippie Scientist', description: 'Educational-use disclaimer and risk boundaries.' }],
  ['/methodology', { title: 'Methodology | The Hippie Scientist', description: 'How evidence is selected, summarized, and scored for confidence.' }],
  ['/contact', { title: 'Contact | The Hippie Scientist', description: 'Contact the editorial team and submit corrections or sources.' }],
  ['/learning', { title: 'Learning Paths | The Hippie Scientist', description: 'Structured paths across herbs, compounds, and safety context.' }],
  ['/herbs', { title: 'Herb Database | The Hippie Scientist', description: 'Browse herb profiles, mechanisms, and safety notes.' }],
  ['/compounds', { title: 'Compound Database | The Hippie Scientist', description: 'Browse active compounds, pharmacology, and related herbs.' }],
  ['/build', { title: 'Build Blend | The Hippie Scientist', description: 'Build and evaluate herb stacks with safety-first interaction context.' }],
])

const CORE_SITEMAP_META = new Map([
  ['/', { priority: 1.0, changefreq: 'weekly' }],
  ['/blog', { priority: 0.8, changefreq: 'daily' }],
  ['/herbs', { priority: 0.9, changefreq: 'weekly' }],
  ['/compounds', { priority: 0.9, changefreq: 'weekly' }],
  ['/build', { priority: 0.8, changefreq: 'weekly' }],
])

const slugify = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizePath = route => {
  if (!route || route === '/') return '/'
  return `/${String(route).replace(/^\/+|\/+$/g, '')}`
}

const dedupe = routes => [...new Set(routes.map(normalizePath))]
const clip = (value, max = 155) => String(value || '').trim().slice(0, max)

const readJson = relativePath => {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return []
  try {
    const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const readObject = (relativePath, fallback = {}) => {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return fallback
  try {
    const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const readText = relativePath => {
  const fullPath = path.join(ROOT, relativePath)
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : ''
}

const normalizeDate = value => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function scoreEntity(record) {
  const sources = Array.isArray(record?.sources) ? record.sources.length : 0
  const effects = Array.isArray(record?.effects) ? record.effects.length : 0
  const hasMechanism = String(record?.mechanism || '').trim().length > 0 ? 1 : 0
  const hasDescription = String(record?.description || record?.summary || '').trim().length > 0 ? 1 : 0
  const hasContraindications = Array.isArray(record?.contraindications)
    ? record.contraindications.length > 0
      ? 1
      : 0
    : 0

  return sources * 3 + effects + hasMechanism * 2 + hasDescription * 2 + hasContraindications
}

function pickTopEntities(records, basePath, explicitAllowlist, cap, label) {
  const byScore = records
    .map(record => {
      const slug = slugify(
        record?.slug ||
          record?.commonName ||
          record?.common ||
          record?.name ||
          record?.latinName ||
          record?.latin ||
          record?.id
      )
      if (!slug) return null
      const displayName =
        record?.commonName || record?.common || record?.name || record?.latinName || record?.latin || slug
      const description = clip(record?.summary || record?.description || `${displayName} reference profile.`)
      return {
        route: `${basePath}/${slug}`,
        score: scoreEntity(record),
        title: `${displayName} | The Hippie Scientist`,
        description,
        kind: label,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)

  const byRoute = new Map(byScore.map(item => [item.route, item]))
  const selected = []
  const seen = new Set()

  for (const route of explicitAllowlist) {
    const item = byRoute.get(route)
    if (!item || seen.has(route) || !route.startsWith(basePath)) continue
    selected.push(item)
    seen.add(route)
  }

  for (const candidate of byScore) {
    if (selected.length >= cap) break
    if (seen.has(candidate.route)) continue
    selected.push(candidate)
    seen.add(candidate.route)
  }

  return selected
}

function extractLearningRouteAllowlist() {
  const file = readText('src/data/learning-paths.ts')
  if (!file) return []
  const matches = file.match(/href:\s*'([^']+)'/g) || []
  return dedupe(
    matches
      .map(match => match.match(/href:\s*'([^']+)'/)?.[1] || '')
      .filter(route => route.startsWith('/herbs/') || route.startsWith('/compounds/'))
  )
}

function extractGoalRoutes() {
  const file = readText('src/data/goals.ts')
  if (!file) return []
  const matches = [...file.matchAll(/id:\s*'([^']+)'/g)]
  return dedupe(matches.map(match => `/herbs-for-${match[1]}`))
}

function extractCollectionRoutes() {
  const file = readText('src/data/seoCollections.ts')
  if (!file) return []
  const matches = [...file.matchAll(/slug:\s*'([^']+)'/g)]
  return dedupe(matches.map(match => `/collections/${match[1]}`))
}

function getBlogEntries() {
  const posts = readJson('src/data/blog/posts.json')
  return dedupe(
    posts
      .map(post => {
        const slug = String(post?.slug || '').replace(/^\/+|\/+$/g, '')
        return slug ? `/blog/${slug}` : ''
      })
      .filter(Boolean)
  ).map(route => {
    const slug = route.split('/').pop()
    const post = posts.find(item => item?.slug === slug)
    return {
      route,
      title: `${post?.title || 'Blog Post'} | The Hippie Scientist`,
      description: clip(post?.summary || post?.description || 'Research notebook entry.'),
      lastmod: normalizeDate(post?.date),
    }
  })
}

export function getSharedRouteManifest() {
  const routeMeta = new Map()
  const sitemapMeta = new Map()
  const putRouteMeta = (route, title, description) => routeMeta.set(route, { title, description })
  const putSitemapMeta = (route, meta = {}) => sitemapMeta.set(route, meta)

  CORE_STATIC_ROUTES.forEach(route => {
    const meta = CORE_ROUTE_META.get(route)
    if (meta) putRouteMeta(route, meta.title, meta.description)
    putSitemapMeta(route, {
      priority: CORE_SITEMAP_META.get(route)?.priority ?? 0.8,
      changefreq: CORE_SITEMAP_META.get(route)?.changefreq ?? 'weekly',
    })
  })

  const goalRoutes = extractGoalRoutes()
  goalRoutes.forEach(route => {
    putRouteMeta(
      route,
      'Goal-Based Herb Guide | The Hippie Scientist',
      'Explore herbs aligned to a specific effect goal with safety context.'
    )
    putSitemapMeta(route, { priority: 0.7, changefreq: 'weekly' })
  })

  const collectionRoutes = extractCollectionRoutes()
  collectionRoutes.forEach(route => {
    putRouteMeta(route, 'Collection Guide | The Hippie Scientist', 'Topic-focused collections for herb and compound exploration.')
    putSitemapMeta(route, { priority: 0.7, changefreq: 'weekly' })
  })

  const blogEntries = getBlogEntries()
  blogEntries.forEach(entry => {
    putRouteMeta(entry.route, entry.title, entry.description)
    putSitemapMeta(entry.route, { priority: 0.6, changefreq: 'weekly', lastmod: entry.lastmod })
  })

  const blogPages = Math.ceil(blogEntries.length / BLOG_PER_PAGE)
  const paginatedBlogRoutes =
    blogPages > 1 ? Array.from({ length: blogPages - 1 }, (_, index) => `/blog/page/${index + 2}`) : []
  paginatedBlogRoutes.forEach((route, index) => {
    putRouteMeta(route, `Research Notebook — Page ${index + 2} | The Hippie Scientist`, 'Paginated archive of research posts and field notes.')
    putSitemapMeta(route, { priority: 0.6, changefreq: 'weekly' })
  })

  const learningAllowlist = extractLearningRouteAllowlist()
  const herbs = readJson('public/data/herbs.json')
  const compounds = readJson('public/data/compounds.json')

  const indexableHerbRoutes = new Set(
    readJson('public/data/indexable-herbs.json')
      .map(item => normalizePath(item?.route || `/herbs/${item?.slug || ''}`))
      .filter(route => route.startsWith('/herbs/'))
  )
  const indexableCompoundRoutes = new Set(
    readJson('public/data/indexable-compounds.json')
      .map(item => normalizePath(item?.route || `/compounds/${item?.slug || ''}`))
      .filter(route => route.startsWith('/compounds/'))
  )

  const herbCandidates = pickTopEntities(herbs, '/herbs', learningAllowlist, Number.MAX_SAFE_INTEGER, 'herb')
  const compoundCandidates = pickTopEntities(compounds, '/compounds', learningAllowlist, Number.MAX_SAFE_INTEGER, 'compound')

  const herbEntries = herbCandidates.filter(entry => indexableHerbRoutes.has(entry.route)).slice(0, DEFAULT_ENTITY_CAP)
  const compoundEntries = compoundCandidates
    .filter(entry => indexableCompoundRoutes.has(entry.route))
    .slice(0, DEFAULT_ENTITY_CAP)

  const qualityReport = readObject('public/data/quality-report.json', {})

  herbEntries.forEach(entry => {
    putRouteMeta(entry.route, entry.title, entry.description)
    putSitemapMeta(entry.route, { priority: 0.7, changefreq: 'monthly' })
  })
  compoundEntries.forEach(entry => {
    putRouteMeta(entry.route, entry.title, entry.description)
    putSitemapMeta(entry.route, { priority: 0.7, changefreq: 'monthly' })
  })

  const approvedRoutes = dedupe([
    ...CORE_STATIC_ROUTES,
    ...goalRoutes,
    ...collectionRoutes,
    ...paginatedBlogRoutes,
    ...blogEntries.map(entry => entry.route),
    ...herbEntries.map(entry => entry.route),
    ...compoundEntries.map(entry => entry.route),
  ]).filter(route => !DISALLOWED_ROUTES.includes(route))

  const prerenderRoutes = approvedRoutes
  const sitemapRoutes = approvedRoutes

  return {
    approvedRoutes,
    prerenderRoutes,
    sitemapRoutes,
    routeMeta,
    sitemapMeta,
    disallowedRoutes: [...DISALLOWED_ROUTES],
    metadata: {
      entityCap: DEFAULT_ENTITY_CAP,
      blogPosts: blogEntries.length,
      paginatedBlogRoutes: paginatedBlogRoutes.length,
      coreRoutes: CORE_STATIC_ROUTES.length,
      goalRoutes: goalRoutes.length,
      collectionRoutes: collectionRoutes.length,
      herbRoutes: herbEntries.length,
      compoundRoutes: compoundEntries.length,
      herbAllowlist: herbEntries.map(entry => entry.route).filter(route => learningAllowlist.includes(route)),
      compoundAllowlist: compoundEntries
        .map(entry => entry.route)
        .filter(route => learningAllowlist.includes(route)),
      herbCandidatesBeforeQuality: herbCandidates.length,
      compoundCandidatesBeforeQuality: compoundCandidates.length,
      herbRoutesAfterQuality: herbEntries.length,
      compoundRoutesAfterQuality: compoundEntries.length,
      qualityThresholds: qualityReport?.thresholds || null,
      qualityExclusions: {
        herbs: qualityReport?.herbs?.excludedByReason || {},
        compounds: qualityReport?.compounds?.excludedByReason || {},
      },
    },
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { approvedRoutes, metadata } = getSharedRouteManifest()
  console.log(JSON.stringify({ approvedRoutes, metadata }, null, 2))
}
