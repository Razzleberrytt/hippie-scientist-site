import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getSharedRouteManifest } from './shared-route-manifest.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const outDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..', 'dist')

const site = (process.env.SITE_URL || 'https://thehippiescientist.net').replace(/\/+$/, '')
const basePath = normalizeBasePath(process.env.BASE_PATH || process.env.VITE_BASE_PATH || '/')
const today = new Date().toISOString().slice(0, 10)

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

function readJson(relativePath) {
  const full = path.resolve(__dirname, '..', relativePath)
  if (!fs.existsSync(full)) return []

  try {
    const parsed = JSON.parse(fs.readFileSync(full, 'utf-8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizeDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

function uniq(list) {
  return [...new Set(list)]
}

function getEntityRoutes(records, prefix) {
  return records
    .map(item => String(item?.slug || '').trim())
    .filter(Boolean)
    .map(slug => normalizePathname(`${prefix}/${slug}`))
}

function getBlogEntries(records) {
  return records
    .map(item => {
      const slug = String(item?.slug || '').trim()
      if (!slug) return null
      return {
        route: normalizePathname(`/blog/${slug}`),
        lastmod: normalizeDate(item?.date),
      }
    })
    .filter(Boolean)
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
  const { sitemapRoutes, sitemapMeta, disallowedRoutes } = getSharedRouteManifest()

  const herbs = getEntityRoutes(readJson('public/data/herbs.json'), '/herbs')
  const compounds = getEntityRoutes(readJson('public/data/compounds.json'), '/compounds')
  const blogEntries = getBlogEntries(readJson('src/data/blog/posts.json'))
  const blogRoutes = blogEntries.map(entry => entry.route)

  const allRoutes = uniq([...sitemapRoutes, ...herbs, ...compounds, ...blogRoutes]).filter(
    route => !disallowedRoutes.includes(route)
  )

  for (const route of herbs) {
    sitemapMeta.set(route, { priority: 0.7, changefreq: 'monthly', lastmod: today })
  }

  for (const route of compounds) {
    sitemapMeta.set(route, { priority: 0.7, changefreq: 'monthly', lastmod: today })
  }

  for (const entry of blogEntries) {
    sitemapMeta.set(entry.route, {
      priority: 0.6,
      changefreq: 'weekly',
      lastmod: entry.lastmod || today,
    })
  }

  const urlEntries = allRoutes
    .map(route => toUrlEntry(route, sitemapMeta.get(route) || {}))
    .filter(Boolean)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
}

function buildRobotsTxt() {
  const { disallowedRoutes } = getSharedRouteManifest()
  const sitemapUrl = toPublicUrl('/sitemap.xml')
  const lines = ['User-agent: *', 'Allow: /']

  for (const blocked of disallowedRoutes) {
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
