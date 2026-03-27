import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const BLOG_PER_PAGE = 12
const DEFAULT_ENTITY_CAP = Number.parseInt(process.env.PRERENDER_ENTITY_CAP || '500', 10)

const slugify = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizePath = route => {
  if (!route || route === '/') return '/'
  return `/${String(route).replace(/^\/+|\/+$/g, '')}`
}

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

const readText = relativePath => {
  const fullPath = path.join(ROOT, relativePath)
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : ''
}

const dedupe = routes => [...new Set(routes.map(normalizePath))]
const clip = (value, max = 155) => String(value || '').trim().slice(0, max)

function scoreEntity(record) {
  const sources = Array.isArray(record?.sources) ? record.sources.length : 0
  const effects = Array.isArray(record?.effects) ? record.effects.length : 0
  const hasMechanism = String(record?.mechanism || '').trim().length > 0 ? 1 : 0
  const hasDescription =
    String(record?.description || record?.summary || '').trim().length > 0 ? 1 : 0
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

export function getPrerenderPlan() {
  const routeMeta = new Map()
  const put = (route, title, description) => routeMeta.set(route, { title, description })

  const core = [
    ['/', 'The Hippie Scientist', 'Science-first herbal education and evidence-aware reference pages.'],
    ['/about', 'About | The Hippie Scientist', 'Editorial standards, mission, and evidence posture.'],
    ['/blog', 'Research Notebook | The Hippie Scientist', 'Mechanism-focused herbal and compound research notes.'],
    ['/newsletter', 'Newsletter | The Hippie Scientist', 'Get research notes, safety-first updates, and new guides.'],
    ['/privacy', 'Privacy Policy | The Hippie Scientist', 'How The Hippie Scientist handles analytics and subscriber data.'],
    ['/disclaimer', 'Disclaimer | The Hippie Scientist', 'Educational-use disclaimer and risk boundaries.'],
    ['/methodology', 'Methodology | The Hippie Scientist', 'How evidence is selected, summarized, and scored for confidence.'],
    ['/contact', 'Contact | The Hippie Scientist', 'Contact the editorial team and submit corrections or sources.'],
    ['/learning', 'Learning Paths | The Hippie Scientist', 'Structured paths across herbs, compounds, and safety context.'],
    ['/herbs', 'Herb Database | The Hippie Scientist', 'Browse herb profiles, mechanisms, and safety notes.'],
    ['/compounds', 'Compound Database | The Hippie Scientist', 'Browse active compounds, pharmacology, and related herbs.'],
  ]
  for (const [route, title, description] of core) put(route, title, description)

  const goalRoutes = extractGoalRoutes()
  goalRoutes.forEach(route => put(route, 'Goal-Based Herb Guide | The Hippie Scientist', 'Explore herbs aligned to a specific effect goal with safety context.'))

  const blogPosts = readJson('src/data/blog/posts.json')
  const blogEntries = dedupe(
    blogPosts
      .map(post => {
        const slug = String(post?.slug || '').replace(/^\/+|\/+$/g, '')
        return slug ? `/blog/${slug}` : ''
      })
      .filter(Boolean)
  ).map(route => {
    const slug = route.split('/').pop()
    const post = blogPosts.find(item => item?.slug === slug)
    return {
      route,
      title: `${post?.title || 'Blog Post'} | The Hippie Scientist`,
      description: clip(post?.summary || post?.description || 'Research notebook entry.'),
    }
  })
  blogEntries.forEach(entry => put(entry.route, entry.title, entry.description))

  const blogPages = Math.ceil(blogEntries.length / BLOG_PER_PAGE)
  const paginatedBlogRoutes =
    blogPages > 1
      ? Array.from({ length: blogPages - 1 }, (_, index) => `/blog/page/${index + 2}`)
      : []
  paginatedBlogRoutes.forEach((route, index) =>
    put(route, `Research Notebook — Page ${index + 2} | The Hippie Scientist`, 'Paginated archive of research posts and field notes.')
  )

  const learningAllowlist = extractLearningRouteAllowlist()
  const herbs = readJson('public/data/herbs_combined_updated.json').length
    ? readJson('public/data/herbs_combined_updated.json')
    : readJson('public/data/herbs.json')
  const compounds = readJson('public/data/compounds_combined_updated.json').length
    ? readJson('public/data/compounds_combined_updated.json')
    : readJson('public/data/compounds.json')

  const herbEntries = pickTopEntities(herbs, '/herbs', learningAllowlist, DEFAULT_ENTITY_CAP, 'herb')
  const compoundEntries = pickTopEntities(compounds, '/compounds', learningAllowlist, DEFAULT_ENTITY_CAP, 'compound')

  herbEntries.forEach(entry => put(entry.route, entry.title, entry.description))
  compoundEntries.forEach(entry => put(entry.route, entry.title, entry.description))

  const routes = dedupe([
    ...core.map(([route]) => route),
    ...goalRoutes,
    ...paginatedBlogRoutes,
    ...blogEntries.map(entry => entry.route),
    ...herbEntries.map(entry => entry.route),
    ...compoundEntries.map(entry => entry.route),
  ])

  return {
    routes,
    routeMeta,
    metadata: {
      entityCap: DEFAULT_ENTITY_CAP,
      blogPosts: blogEntries.length,
      paginatedBlogRoutes: paginatedBlogRoutes.length,
      coreRoutes: core.length,
      goalRoutes: goalRoutes.length,
      herbRoutes: herbEntries.length,
      compoundRoutes: compoundEntries.length,
      herbAllowlist: herbEntries
        .map(entry => entry.route)
        .filter(route => learningAllowlist.includes(route)),
      compoundAllowlist: compoundEntries
        .map(entry => entry.route)
        .filter(route => learningAllowlist.includes(route)),
    },
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { routes, metadata } = getPrerenderPlan()
  console.log(JSON.stringify({ routes, metadata }, null, 2))
}
