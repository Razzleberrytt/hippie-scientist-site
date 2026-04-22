#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { getSharedRouteManifest } from './shared-route-manifest.mjs'

const DIST = path.resolve(process.cwd(), 'dist')
const REPORT_PATH = path.join(DIST, 'route-manifest-report.json')

const { approvedRoutes, prerenderRoutes, sitemapRoutes, metadata, routeMeta, routeDirectives } =
  getSharedRouteManifest()

function routeHtmlPath(route) {
  if (route === '/') return path.join(DIST, 'index.html')
  const clean = route.replace(/^\/+|\/+$/g, '')
  return path.join(DIST, clean, 'index.html')
}

function hasHtml(route) {
  return fs.existsSync(routeHtmlPath(route))
}

function difference(left, right) {
  const rightSet = new Set(right)
  return left.filter(route => !rightSet.has(route))
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapePattern(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function verifySampleRoute(route) {
  const htmlPath = routeHtmlPath(route)
  if (!fs.existsSync(htmlPath)) {
    return { route, ok: false, reason: 'missing-html-file' }
  }

  const html = fs.readFileSync(htmlPath, 'utf8')
  const meta = routeMeta.get(route) || {}
  const expectedTitle = meta.title || 'The Hippie Scientist'
  const expectedCanonical = `https://thehippiescientist.net${route === '/' ? '/' : route}`

  const hasTitle = new RegExp(`<title>\\s*${escapePattern(expectedTitle)}\\s*<\\/title>`, 'i').test(html)
  const hasCanonical = new RegExp(
    `<link[^>]+rel=["']canonical["'][^>]+href=["']${escapePattern(expectedCanonical)}["']`,
    'i'
  ).test(html)

  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  const bodyScope = mainMatch?.[1] || html
  const rootText = stripTags(bodyScope)
  const hasBodyContent = rootText.length >= 80

  if (!hasTitle) return { route, ok: false, reason: 'missing-route-title' }
  if (!hasCanonical) return { route, ok: false, reason: 'missing-route-canonical' }
  if (!hasBodyContent) return { route, ok: false, reason: 'missing-meaningful-body-content' }

  return { route, ok: true, bodyLength: rootText.length }
}

function verifyHeadTags(route) {
  const htmlPath = routeHtmlPath(route)
  if (!fs.existsSync(htmlPath)) {
    return { route, ok: false, reason: 'missing-html-file' }
  }
  const html = fs.readFileSync(htmlPath, 'utf8')
  const expectedCanonical = `https://thehippiescientist.net${route === '/' ? '/' : route}`
  const directives = routeDirectives.get(route) || {}

  const titleCount = (html.match(/<title[\s>]/gi) || []).length
  if (titleCount !== 1) return { route, ok: false, reason: `duplicate-or-missing-title:${titleCount}` }

  const requiredTagPatterns = [
    /<meta[^>]+name=["']description["'][^>]*>/i,
    /<meta[^>]+property=["']og:title["'][^>]*>/i,
    /<meta[^>]+property=["']og:description["'][^>]*>/i,
    /<meta[^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:card["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:title["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:description["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]*>/i,
  ]

  for (const pattern of requiredTagPatterns) {
    if (!pattern.test(html)) return { route, ok: false, reason: `missing-tag:${pattern}` }
  }

  const canonicalRegex = new RegExp(
    `<link[^>]+rel=["']canonical["'][^>]+href=["']${escapePattern(expectedCanonical)}["']`,
    'i'
  )
  if (!canonicalRegex.test(html)) return { route, ok: false, reason: 'missing-canonical' }

  const robotsNoindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
  if (Boolean(directives.noindex) !== robotsNoindex) {
    return { route, ok: false, reason: 'noindex-directive-mismatch' }
  }

  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  const bodyScope = mainMatch?.[1] || html
  const bodyText = stripTags(bodyScope)
  return { route, ok: true, bodyLength: bodyText.length, titleCount }
}

const sitemapEligiblePrerenderRoutes = prerenderRoutes.filter(route => routeDirectives.get(route)?.noindex !== true)
const onlyInSitemap = difference(sitemapRoutes, sitemapEligiblePrerenderRoutes)
const onlyInPrerender = difference(sitemapEligiblePrerenderRoutes, sitemapRoutes)

const samples = []
const blogDetail = prerenderRoutes.find(route => route.startsWith('/blog/') && !route.includes('/page/'))
const herbDetail = prerenderRoutes.find(route => route.startsWith('/herbs/'))
const compoundDetail = prerenderRoutes.find(route => route.startsWith('/compounds/'))
const collectionDetail = metadata.indexableCollections?.[0]?.route || prerenderRoutes.find(route => route.startsWith('/collections/'))
for (const route of ['/', '/blog', blogDetail, '/herbs', herbDetail, '/compounds', compoundDetail, collectionDetail]) {
  if (route && !samples.includes(route)) samples.push(route)
}

const sampleChecks = samples.map(verifySampleRoute)
const headChecks = prerenderRoutes.map(verifyHeadTags)

const report = {
  approvedRouteCount: approvedRoutes.length,
  prerenderRouteCount: prerenderRoutes.length,
  sitemapRouteCount: sitemapRoutes.length,
  onlyInSitemap,
  onlyInPrerender,
  sampleChecks,
  headChecksSummary: {
    checked: headChecks.length,
    failures: headChecks.filter(check => !check.ok).length,
  },
}

fs.mkdirSync(DIST, { recursive: true })
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))

if (onlyInSitemap.length > 0 || onlyInPrerender.length > 0) {
  console.error('[verify-prerender] Route manifest mismatch between sitemap and prerender sets.')
  if (onlyInSitemap.length > 0) {
    console.error(` - onlyInSitemap (${onlyInSitemap.length}): ${onlyInSitemap.slice(0, 20).join(', ')}`)
  }
  if (onlyInPrerender.length > 0) {
    console.error(` - onlyInPrerender (${onlyInPrerender.length}): ${onlyInPrerender.slice(0, 20).join(', ')}`)
  }
  process.exit(1)
}

const missing = prerenderRoutes.filter(route => !hasHtml(route))

if (missing.length > 0) {
  console.error(`[verify-prerender] Missing ${missing.length} prerendered route(s).`)
  missing.slice(0, 20).forEach(route => console.error(` - ${route}`))
  if (missing.length > 20) {
    console.error(` ...and ${missing.length - 20} more`)
  }
  process.exit(1)
}

const failingSamples = sampleChecks.filter(item => !item.ok)
if (failingSamples.length > 0) {
  console.error('[verify-prerender] Sample content checks failed:')
  failingSamples.forEach(item => console.error(` - ${item.route}: ${item.reason}`))
  process.exit(1)
}

const failingHeadChecks = headChecks.filter(item => !item.ok)
if (failingHeadChecks.length > 0) {
  console.error('[verify-prerender] Full-route SEO checks failed:')
  failingHeadChecks.slice(0, 40).forEach(item => console.error(` - ${item.route}: ${item.reason}`))
  if (failingHeadChecks.length > 40) {
    console.error(` ...and ${failingHeadChecks.length - 40} more`)
  }
  process.exit(1)
}

console.log(
  `[verify-prerender] OK: ${prerenderRoutes.length} routes (${metadata.blogPosts} blog posts, ${metadata.herbRoutes} herbs, ${metadata.compoundRoutes} compounds, ${metadata.collectionRoutes} collections).`
)
console.log(
  `[verify-prerender] sample content routes: ${sampleChecks.map(check => check.route).join(', ')}`
)
console.log(`[verify-prerender] wrote ${REPORT_PATH}`)
