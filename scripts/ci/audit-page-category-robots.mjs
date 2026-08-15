#!/usr/bin/env node
/**
 * Verify the robots directive emitted by every built HTML page, grouped by route
 * category. Profile-level governance remains the responsibility of
 * audit-profile-robots.mjs; this script covers the rest of the static export and
 * catches category-level regressions such as an indexable internal search shell.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const reportPath = path.join(root, 'reports/page-category-robots.json')

if (!fs.existsSync(outDir)) {
  console.error('[page-category-robots] missing out/ — run a production build first')
  process.exit(1)
}

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full)
  }
  return files
}

function routeFromFile(file) {
  let rel = path.relative(outDir, file).split(path.sep).join('/')
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length)
  else if (rel.endsWith('.html')) rel = `${rel.slice(0, -'.html'.length)}/`
  return `/${rel}`.replace(/\/+/g, '/')
}

function normalizeRoute(value) {
  if (!value) return '/'
  let pathname = value
  try {
    pathname = new URL(value, 'https://thehippiescientist.net').pathname
  } catch {
    pathname = value
  }
  pathname = pathname.replace(/\/+/g, '/')
  if (!pathname.startsWith('/')) pathname = `/${pathname}`
  if (pathname !== '/' && !pathname.endsWith('/')) pathname += '/'
  return pathname
}

function extractRobots(html) {
  const match = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/i)
  if (!match) return 'index,follow'
  return match[1]
    .toLowerCase()
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
    .join(',')
}

function noindex(robots) {
  return robots.split(',').map((token) => token.trim()).includes('noindex')
}

function extractCanonical(html) {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)
  return match?.[1] || ''
}

const CATEGORY_RULES = [
  { name: 'internal-search', test: (r) => r === '/search/', expected: 'noindex' },
  { name: 'dynamic-comparison', test: (r) => r === '/guides/compare/dynamic/', expected: 'noindex' },
  {
    name: 'internal-or-operational',
    test: (r) => /^\/(?:api|admin|analytics|dashboard|data|preview|drafts|tmp|temp|test|dev)(?:\/|$)/.test(r),
    expected: 'noindex',
  },
  { name: 'herb-profile', test: (r) => /^\/herbs\/[^/]+\/$/.test(r), expected: 'governed' },
  { name: 'compound-profile', test: (r) => /^\/compounds\/[^/]+\/$/.test(r), expected: 'governed' },
  { name: 'article', test: (r) => /^\/(?:articles|blog)\//.test(r), expected: 'declared' },
  { name: 'guide', test: (r) => /^\/guides\//.test(r), expected: 'declared' },
  { name: 'goal', test: (r) => /^\/goals\//.test(r), expected: 'declared' },
  { name: 'evidence', test: (r) => /^\/evidence\//.test(r), expected: 'declared' },
  { name: 'learn', test: (r) => /^\/learn\//.test(r), expected: 'declared' },
  { name: 'novel-psychoactive-substance', test: (r) => /^\/novel-psychoactive-substances\//.test(r), expected: 'declared' },
  { name: 'library-or-tool', test: (r) => /^\/(?:herbs|compounds|safety-checker)(?:\/|$)/.test(r), expected: 'declared' },
  { name: 'public-other', test: () => true, expected: 'declared' },
]

function categoryFor(route) {
  return CATEGORY_RULES.find((rule) => rule.test(route))
}

const sitemapFile = path.join(outDir, 'sitemap.xml')
const sitemapRoutes = new Set()
if (fs.existsSync(sitemapFile)) {
  const xml = fs.readFileSync(sitemapFile, 'utf8')
  for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapRoutes.add(normalizeRoute(loc))
}

const pages = []
const errors = []
for (const file of walk(outDir)) {
  const route = normalizeRoute(routeFromFile(file))
  const html = fs.readFileSync(file, 'utf8')
  const robots = extractRobots(html)
  const isNoindex = noindex(robots)
  const rule = categoryFor(route)
  const inSitemap = sitemapRoutes.has(route)
  const canonical = extractCanonical(html)

  const row = {
    route,
    category: rule.name,
    expected: rule.expected,
    robots,
    noindex: isNoindex,
    inSitemap,
    canonical,
  }
  pages.push(row)

  if (rule.expected === 'noindex' && !isNoindex) {
    errors.push(`${route} is ${rule.name} but emits ${robots}`)
  }
  if (inSitemap && isNoindex) {
    errors.push(`${route} is in sitemap.xml but emits ${robots}`)
  }
}

const categories = {}
for (const row of pages) {
  const bucket = categories[row.category] ||= { total: 0, indexable: 0, noindex: 0, inSitemap: 0 }
  bucket.total += 1
  bucket[row.noindex ? 'noindex' : 'indexable'] += 1
  if (row.inSitemap) bucket.inSitemap += 1
}

for (const required of ['internal-search', 'herb-profile', 'compound-profile', 'guide', 'evidence', 'learn']) {
  if (!categories[required]?.total) errors.push(`expected built category "${required}" was not observed`)
}

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    pages: pages.length,
    indexable: pages.filter((p) => !p.noindex).length,
    noindex: pages.filter((p) => p.noindex).length,
    sitemapUrls: sitemapRoutes.size,
  },
  categories,
  errors,
  pages,
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`[page-category-robots] audited ${pages.length} built HTML pages across ${Object.keys(categories).length} categories`)
for (const [name, counts] of Object.entries(categories).sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`[page-category-robots] ${name}: ${counts.indexable} indexable / ${counts.noindex} noindex / ${counts.total} total`)
}
console.log('[page-category-robots] report: reports/page-category-robots.json')

if (errors.length) {
  console.error(`\n[page-category-robots] ${errors.length} crawl-policy error(s):`)
  for (const error of errors.slice(0, 50)) console.error(`[page-category-robots]   ${error}`)
  process.exit(1)
}

console.log('[page-category-robots] OK: category-level robots policy is internally consistent')
