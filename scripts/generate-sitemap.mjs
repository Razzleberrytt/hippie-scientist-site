import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import slugify from 'slugify'

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
  '/sitemap',
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
  const input = String(value || '').trim()
  if (!input) return ''
  return slugify(input, { lower: true, strict: true })
}

function getIndexableEntityRoutes(entityType) {
  const dirName = entityType === 'herb' ? 'herbs' : 'compounds'
  const dataFile = entityType === 'herb' ? 'public/data/herbs.json' : 'public/data/compounds.json'
  const records = readJson(dataFile)
  const fromData = []

  for (const row of records) {
    const explicitIndexable = row?.indexable
    const explicitNoindex = row?.noindex
    const explicitDraft = row?.draft
    const explicitExcluded = row?.excluded
    if (explicitIndexable === false || explicitNoindex === true || explicitDraft === true || explicitExcluded === true) {
      continue
    }

    const slug = toSlug(row?.slug || row?.id || row?.name || row?.common || row?.latin)
    if (!slug) continue

    const route = `/${dirName}/${slug}`
    if (!routeExists(route)) continue

    fromData.push({
      path: route,
      lastmod: normalizeDate(row?.lastUpdated || row?.updatedAt || row?.date),
    })
  }

  if (fromData.length > 0) return dedupeByPath(fromData)

  const fallbackDir = buildExists(dirName) ? path.join(outDir, dirName) : path.resolve(__dirname, '..', 'public', dirName)
  if (!fs.existsSync(fallbackDir)) return []

  return fs
    .readdirSync(fallbackDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const indexPath = path.join(fallbackDir, entry.name, 'index.html')
      return {
        path: `/${dirName}/${entry.name}`,
        lastmod: statDate(indexPath),
      }
    })
}

function getIndexableBlogRoutes() {
  const posts = readJson('public/blogdata/index.json')
  const allowed = []

  for (const post of posts) {
    const slug = String(post?.slug || '').replace(/^\/+|\/+$/g, '')
    if (!slug) continue

    const explicitIndexable = post?.indexable
    const explicitNoindex = post?.noindex
    const explicitDraft = post?.draft
    const explicitExcluded = post?.excluded

    if (explicitIndexable === false || explicitNoindex === true || explicitDraft === true || explicitExcluded === true) {
      continue
    }

    const route = `/blog/${slug}`
    if (!routeExists(route)) continue

    allowed.push({
      path: route,
      lastmod: normalizeDate(post?.lastUpdated || post?.updatedAt || post?.date),
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
    `<loc>${toPublicUrl(normalized)}</loc>`,
    lastmod ? `<lastmod>${lastmod}</lastmod>` : null,
    `<changefreq>${changefreq}</changefreq>`,
    `<priority>${priority.toFixed(1)}</priority>`,
  ]
    .filter(Boolean)
    .join('')

  return `<url>${tags}</url>`
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

  entries.push(...getIndexableEntityRoutes('herb').map((row) => ({ ...row, priority: 0.7, changefreq: 'weekly' })))
  entries.push(...getIndexableEntityRoutes('compound').map((row) => ({ ...row, priority: 0.7, changefreq: 'weekly' })))
  entries.push(...getIndexableBlogRoutes().map((row) => ({ ...row, priority: 0.7, changefreq: 'weekly' })))

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
