#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { getSharedRouteManifest } from './shared-route-manifest.mjs'

const DIST = path.resolve(process.cwd(), 'dist')
const REPORT_PATH = path.join(DIST, 'route-manifest-report.json')

const { approvedRoutes, prerenderRoutes, sitemapRoutes, metadata } = getSharedRouteManifest()

function hasHtml(route) {
  if (route === '/') {
    return fs.existsSync(path.join(DIST, 'index.html'))
  }

  const clean = route.replace(/^\/+|\/+$/g, '')
  return (
    fs.existsSync(path.join(DIST, clean, 'index.html')) || fs.existsSync(path.join(DIST, `${clean}.html`))
  )
}

function difference(left, right) {
  const rightSet = new Set(right)
  return left.filter(route => !rightSet.has(route))
}

const onlyInSitemap = difference(sitemapRoutes, prerenderRoutes)
const onlyInPrerender = difference(prerenderRoutes, sitemapRoutes)

const report = {
  approvedRouteCount: approvedRoutes.length,
  prerenderRouteCount: prerenderRoutes.length,
  sitemapRouteCount: sitemapRoutes.length,
  onlyInSitemap,
  onlyInPrerender,
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

console.log(
  `[verify-prerender] OK: ${prerenderRoutes.length} routes (${metadata.blogPosts} blog posts, ${metadata.herbRoutes} herbs, ${metadata.compoundRoutes} compounds, ${metadata.collectionRoutes} collections).`
)
console.log(`[verify-prerender] wrote ${REPORT_PATH}`)
