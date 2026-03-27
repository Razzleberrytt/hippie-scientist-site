#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { getSharedRouteManifest } from './shared-route-manifest.mjs'

const DIST = path.resolve(process.cwd(), 'dist')
const REPORT_PATH = path.join(DIST, 'route-manifest-report.json')

const { approvedRoutes, prerenderRoutes, sitemapRoutes, metadata, routeMeta } = getSharedRouteManifest()

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

const onlyInSitemap = difference(sitemapRoutes, prerenderRoutes)
const onlyInPrerender = difference(prerenderRoutes, sitemapRoutes)

const samples = []
const blogDetail = prerenderRoutes.find(route => route.startsWith('/blog/') && !route.includes('/page/'))
const herbDetail = prerenderRoutes.find(route => route.startsWith('/herbs/'))
const compoundDetail = prerenderRoutes.find(route => route.startsWith('/compounds/'))
const collectionDetail = prerenderRoutes.find(route => route.startsWith('/collections/'))
for (const route of ['/', '/blog', blogDetail, '/herbs', herbDetail, '/compounds', compoundDetail, collectionDetail]) {
  if (route && !samples.includes(route)) samples.push(route)
}

const sampleChecks = samples.map(verifySampleRoute)

const report = {
  approvedRouteCount: approvedRoutes.length,
  prerenderRouteCount: prerenderRoutes.length,
  sitemapRouteCount: sitemapRoutes.length,
  onlyInSitemap,
  onlyInPrerender,
  sampleChecks,
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

console.log(
  `[verify-prerender] OK: ${prerenderRoutes.length} routes (${metadata.blogPosts} blog posts, ${metadata.herbRoutes} herbs, ${metadata.compoundRoutes} compounds, ${metadata.collectionRoutes} collections).`
)
console.log(
  `[verify-prerender] sample content routes: ${sampleChecks.map(check => check.route).join(', ')}`
)
console.log(`[verify-prerender] wrote ${REPORT_PATH}`)
