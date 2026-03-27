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
  const { sitemapRoutes, sitemapMeta } = getSharedRouteManifest()
  const urlEntries = sitemapRoutes
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
