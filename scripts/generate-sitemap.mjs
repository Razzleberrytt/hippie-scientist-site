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

function normalizeRoutes(list) {
  return uniq(list.map(route => normalizePathname(route)).filter(Boolean))
}

function getBlogEntries(records) {
  return records
    .filter(item => item?.draft !== true)
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

function getHerbSlug(entry) {
  if (typeof entry === 'string') return entry.trim()
  if (!entry || typeof entry !== 'object') return ''
  if (typeof entry.slug === 'string' && entry.slug.trim()) return entry.slug.trim()
  if (typeof entry.route === 'string' && entry.route.trim()) {
    return entry.route.replace(/^\/+herbs\//, '').trim()
  }
  return ''
}

function getCompoundSlug(entry) {
  if (typeof entry === 'string') return entry.trim()
  if (!entry || typeof entry !== 'object') return ''
  if (typeof entry.canonicalCompoundId === 'string' && entry.canonicalCompoundId.trim()) {
    return entry.canonicalCompoundId.trim()
  }
  if (typeof entry.slug === 'string' && entry.slug.trim()) return entry.slug.trim()
  if (typeof entry.route === 'string' && entry.route.trim()) {
    return entry.route.replace(/^\/+compounds\//, '').trim()
  }
  return ''
}

function buildSitemap() {
  const { sitemapRoutes, sitemapMeta, disallowedRoutes } = getSharedRouteManifest()
  const indexableHerbs = readJson('public/data/indexable-herbs.json')
  const indexableCompounds = readJson('public/data/indexable-compounds.json')

  const blogEntries = getBlogEntries(readJson('public/blogdata/index.json'))
  const herbRoutes = normalizeRoutes(indexableHerbs.map(getHerbSlug).filter(Boolean).map(slug => `/herbs/${slug}`))
  const compoundRoutes = normalizeRoutes(indexableCompounds.map(getCompoundSlug).filter(Boolean).map(slug => `/compounds/${slug}`))

  const blockedRoutes = new Set(disallowedRoutes.map(route => normalizePathname(route)))
  const staticRoutes = normalizeRoutes(sitemapRoutes).filter(route => !blockedRoutes.has(route))

  const allRoutes = normalizeRoutes([
    ...staticRoutes,
    ...herbRoutes,
    ...compoundRoutes,
    ...blogEntries.map(entry => entry.route),
  ]).filter(route => !blockedRoutes.has(route))

  for (const route of herbRoutes) {
    sitemapMeta.set(normalizePathname(route), {
      priority: 0.7,
      changefreq: 'monthly',
    })
  }

  for (const route of compoundRoutes) {
    sitemapMeta.set(normalizePathname(route), {
      priority: 0.7,
      changefreq: 'monthly',
    })
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`

  return {
    xml,
    counts: {
      total: allRoutes.length,
      herbs: herbRoutes.length,
      compounds: compoundRoutes.length,
      static: staticRoutes.length,
    },
  }
}

function buildRobotsTxt() {
  const { disallowedRoutes } = getSharedRouteManifest()
  const sitemapUrl = toPublicUrl('/sitemap.xml')
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Allow: /herbs',
    'Allow: /herbs/',
    'Allow: /best-herbs-for-',
  ]

  for (const blocked of disallowedRoutes) {
    lines.push(`Disallow: ${blocked}`)
  }

  lines.push(`Sitemap: ${sitemapUrl}`)
  return `${lines.join('\n')}\n`
}

function run() {
  fs.mkdirSync(outDir, { recursive: true })

  const sitemapPath = path.join(outDir, 'sitemap.xml')
  const sitemap = buildSitemap()
  fs.writeFileSync(sitemapPath, sitemap.xml, 'utf-8')

  const robotsPath = path.join(outDir, 'robots.txt')
  fs.writeFileSync(robotsPath, buildRobotsTxt(), 'utf-8')

  console.log('[crawl] wrote', sitemapPath)
  console.log('[crawl] wrote', robotsPath)
  console.log(
    `[crawl] summary total=${sitemap.counts.total} herbs=${sitemap.counts.herbs} compounds=${sitemap.counts.compounds} static=${sitemap.counts.static}`,
  )
}

run()
