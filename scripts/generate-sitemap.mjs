import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const outDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..', 'dist')

const site = (process.env.SITE_URL || 'https://thehippiescientist.net').replace(/\/+$/, '')
const basePath = normalizeBasePath(process.env.BASE_PATH || process.env.VITE_BASE_PATH || '/')

const corePaths = ['/', '/herbs', '/compounds', '/build', '/blog', '/learning', '/about']

const disallowedPaths = [
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

function normalizeBasePath(value) {
  if (!value || value === '/') return '/'
  return `/${String(value).replace(/^\/+|\/+$/g, '')}/`
}

function normalizePathname(loc) {
  if (!loc || loc === '/') return '/'
  const pathname = `/${String(loc).replace(/^\/+|\/+$/g, '')}`
  return pathname === '/' ? '/' : pathname
}

function toPublicUrl(pathname) {
  const clean = normalizePathname(pathname)
  const withBase = basePath === '/' ? clean : `${basePath.replace(/\/$/, '')}${clean}`
  return `${site}${withBase === '/' ? '/' : withBase}`
}

function normalizeDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function statDate(filePath) {
  try {
    return normalizeDate(fs.statSync(filePath).mtimeMs)
  } catch {
    return null
  }
}

function readJson(relPath, fallback = []) {
  const full = path.resolve(__dirname, '..', relPath)
  if (!fs.existsSync(full)) return fallback
  try {
    const parsed = JSON.parse(fs.readFileSync(full, 'utf-8'))
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function buildExists(...segments) {
  return fs.existsSync(path.join(outDir, ...segments))
}

function publicExists(...segments) {
  return fs.existsSync(path.resolve(__dirname, '..', 'public', ...segments))
}

function routeExists(routePath) {
  const clean = String(routePath || '').replace(/^\/+|\/+$/g, '')
  if (!clean) return buildExists('index.html') || publicExists('index.html')

  return (
    buildExists(clean, 'index.html') ||
    buildExists(`${clean}.html`) ||
    publicExists(clean, 'index.html') ||
    publicExists(`${clean}.html`)
  )
}

function toSlug(value) {
  // Keep sitemap entity URLs in sync with src/lib/slug.ts runtime routing logic.
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getIndexableEntityRoutes(entityType) {
  const dirName = entityType === 'herb' ? 'herbs' : 'compounds'
  const dataFile = entityType === 'herb' ? 'public/data/herbs.json' : 'public/data/compounds.json'
  const records = readJson(dataFile)
  const today = new Date().toISOString().slice(0, 10)

  return dedupeByPath(
    records
      .map((row) => {
        const fallbackName = entityType === 'herb' ? row?.commonName || row?.name : row?.name
        const slug = toSlug(row?.slug || fallbackName)
        if (!slug) return null

        return {
          path: `/${dirName}/${slug}`,
          lastmod: today,
        }
      })
      .filter(Boolean),
  )
}

function getIndexableBlogRoutes() {
  const posts = readJson('src/data/blog/posts.json')
  const allowed = []

  for (const post of posts) {
    const slug = String(post?.slug || '').replace(/^\/+|\/+$/g, '')
    if (!slug) continue

    const route = `/blog/${slug}`

    allowed.push({
      path: route,
      lastmod: normalizeDate(post?.date),
    })
  }

  return dedupeByPath(allowed)
}

function dedupeByPath(rows) {
  const seen = new Set()
  const unique = []

  for (const row of rows) {
    const normalized = normalizePathname(row.path)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    unique.push({ ...row, path: normalized })
  }

  return unique
}

function toUrlEntry(loc, { priority = 0.6, changefreq = 'weekly', lastmod } = {}) {
  const normalized = normalizePathname(loc)
  if (!normalized) return null
  const tags = [
    `    <loc>${toPublicUrl(normalized)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
  ].filter(Boolean)

  return ['  <url>', ...tags, '  </url>'].join('\n')
}

function buildSitemapXml() {
  const entries = []

  for (const corePath of corePaths) {
    entries.push({
      path: corePath,
      changefreq: corePath === '/blog' ? 'daily' : 'weekly',
      priority: corePath === '/' ? 1.0 : corePath === '/herbs' || corePath === '/compounds' ? 0.9 : 0.8,
    })
  }

  entries.push(...getIndexableEntityRoutes('herb').map((row) => ({ ...row, priority: 0.7, changefreq: 'monthly' })))
  entries.push(...getIndexableEntityRoutes('compound').map((row) => ({ ...row, priority: 0.7, changefreq: 'monthly' })))
  entries.push(...getIndexableBlogRoutes().map((row) => ({ ...row, priority: 0.6, changefreq: 'weekly' })))

  const urlEntries = dedupeByPath(entries)
    .map((entry) => toUrlEntry(entry.path, entry))
    .filter(Boolean)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
}

function buildRobotsTxt() {
  const sitemapUrl = toPublicUrl('/sitemap.xml')
  const lines = ['User-agent: *', 'Allow: /']

  for (const blocked of disallowedPaths) {
    lines.push(`Disallow: ${blocked}`)
  }

  lines.push(`Sitemap: ${sitemapUrl}`)
  lines.push(`Sitemap: ${toPublicUrl('/rss.xml')}`)
  lines.push(`Sitemap: ${toPublicUrl('/feed.xml')}`)
  return `${lines.join('\n')}\n`
}

function run() {
  fs.mkdirSync(outDir, { recursive: true })

  const sitemapPath = path.join(outDir, 'sitemap.xml')
  fs.writeFileSync(sitemapPath, buildSitemapXml(), 'utf-8')

  const robotsPath = path.join(outDir, 'robots.txt')
  fs.writeFileSync(robotsPath, buildRobotsTxt(), 'utf-8')

  console.log('[crawl] wrote', sitemapPath)
  console.log('[crawl] wrote', robotsPath)
}

run()
