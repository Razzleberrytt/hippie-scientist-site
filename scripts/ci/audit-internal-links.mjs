#!/usr/bin/env node

import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const FULL_HTML_AUDIT = process.env.FULL_HTML_AUDIT === '1' || process.env.CI === 'true'
const staticAssetExt = /\.(?:css|js|json|png|jpe?g|gif|webp|avif|svg|ico|txt|xml|map|woff2?)$/i

let files = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_next') continue
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(filePath)
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(filePath)
  }
}

if (!fs.existsSync(outDir)) {
  console.log('[audit-internal-links] SKIP: Build output not found at out/. Run npm run build first.')
  process.exit(0)
}

walk(outDir)

const routeFromFile = (filePath) =>
  '/' + path.relative(outDir, filePath)
    .replace(/index\.html$/, '')
    .replace(/\.html$/, '')
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/'

function readRedirectSourcePatterns() {
  const candidates = [
    path.join(outDir, '_redirects'),
    path.join(root, 'public', '_redirects'),
  ]
  const redirectsPath = candidates.find((candidate) => fs.existsSync(candidate))
  if (!redirectsPath) return { redirectsPath: null, sources: [] }

  const sources = fs.readFileSync(redirectsPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 3 && /^30[1278]$/.test(parts[2]))
    .map(([source]) => source)
    .filter((source) => source?.startsWith('/'))

  return { redirectsPath, sources }
}

const redirectSourceTable = readRedirectSourcePatterns()
const redirectSourcePatterns = redirectSourceTable.sources

if (redirectSourceTable.redirectsPath) {
  console.log(
    `[audit-internal-links] Using redirect sources from ${path.relative(root, redirectSourceTable.redirectsPath)} (${redirectSourcePatterns.length} rules).`,
  )
}

const normalizeRoute = (route) => {
  if (!route) return '/'
  const withoutQuery = route.split(/[?#]/)[0]
  if (withoutQuery === '/') return '/'
  return withoutQuery.replace(/\/+$/, '') || '/'
}

const isRedirectSourceRoute = (route) => redirectSourcePatterns.some((source) => {
  const normalizedRoute = normalizeRoute(route)
  if (source.endsWith('/*')) return normalizedRoute.startsWith(normalizeRoute(source.slice(0, -1)))
  if (source.includes(':splat')) {
    return normalizedRoute.startsWith(normalizeRoute(source.split(':splat')[0]))
  }
  return normalizedRoute === normalizeRoute(source)
})

files = files.filter((filePath) => !isRedirectSourceRoute(routeFromFile(filePath)))

if (!FULL_HTML_AUDIT) {
  const criticalSubpaths = [
    '/index.html',
    '/faq/index.html',
    '/herbs/index.html',
    '/compounds/index.html',
    '/articles/index.html',
    '/guides/index.html',
    '/herbs/ashwagandha/index.html',
    '/compounds/l-theanine/index.html',
    '/articles/best-supplements-for-adhd/index.html',
    '/articles/adhd-stack-guide/index.html',
    '/articles/2c-b-effects/index.html',
  ]
  files = files.filter((filePath) => {
    const relative = '/' + path.relative(outDir, filePath).replace(/\\/g, '/')
    return criticalSubpaths.includes(relative)
  })
  console.log(
    `[audit-internal-links] Running in targeted mode. Scanning ${files.length} critical pages (use FULL_HTML_AUDIT=1 to audit all files).`,
  )
}

const routes = new Set(files.map(routeFromFile))
const graph = new Map([...routes].map((route) => [route, new Set()]))
const inboundGraph = new Map([...routes].map((route) => [route, new Set()]))
const hrefRe = /href=["'](\/[^"'#\s>]*)["']/g
const robotsNoindexRe = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b)[^>]*>/i

function nonCanonicalInternalHref(href) {
  if (!href || href === '/' || href.includes('?') || href.includes('#')) return null
  if (staticAssetExt.test(href)) return null
  if (href.endsWith('/')) return null
  if (href.split('/').pop()?.includes('.')) return null
  return { href, canonicalHref: `${href}/` }
}

function topCounts(rows, key, limit = 25) {
  const counts = new Map()
  for (const row of rows) {
    const value = String(row[key] || '').trim()
    if (!value) continue
    counts.set(value, (counts.get(value) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit)
}

function summarizeNonCanonicalLinks(rows) {
  return {
    total: rows.length,
    topHrefs: topCounts(rows, 'href'),
    topCanonicalHrefs: topCounts(rows, 'canonicalHref'),
    topSourceRoutes: topCounts(rows, 'source'),
  }
}

async function run() {
  const batchSize = 100
  const noindexRoutes = new Set()
  const nonCanonicalInternalLinks = []

  console.log(`[internal-links] Starting audit of ${files.length} HTML files in batches of ${batchSize}...`)

  for (let i = 0; i < files.length; i += batchSize) {
    console.log(
      `[internal-links] Processing batch ${i / batchSize + 1}/${Math.ceil(files.length / batchSize)} (files ${i} to ${Math.min(i + batchSize, files.length)})...`,
    )
    const batch = files.slice(i, i + batchSize)

    await Promise.all(batch.map(async (filePath, index) => {
      const route = routeFromFile(filePath)
      const fileIndex = i + index
      console.log(`[internal-links] Scanning ${fileIndex}: ${route}`)
      const html = await fsPromises.readFile(filePath, 'utf8')
      if (robotsNoindexRe.test(html)) noindexRoutes.add(route)

      const start = Date.now()
      for (const match of html.matchAll(hrefRe)) {
        const href = match[1]
        if (!href.startsWith('/')) continue

        const nonCanonical = nonCanonicalInternalHref(href)
        if (nonCanonical) nonCanonicalInternalLinks.push({ source: route, ...nonCanonical })

        const target = normalizeRoute(href)
        if (graph.has(target)) {
          graph.get(route).add(target)
          if (target !== route) inboundGraph.get(target).add(route)
        }
      }

      const duration = Date.now() - start
      if (duration > 100) {
        console.log(`[internal-links] Warning: File ${fileIndex} ${route} took ${duration}ms to scan regex`)
      }
    }))
  }

  const orphanRoutes = [...inboundGraph.entries()]
    .filter(([, incoming]) => incoming.size === 0)
    .map(([route]) => route)
  const weaklyConnected = [...inboundGraph.entries()]
    .filter(([, incoming]) => incoming.size > 0 && incoming.size < 3)
    .map(([route, incoming]) => ({ route, inbound: incoming.size }))
  const internalLinkDensity = [...graph.entries()]
    .map(([route, outbound]) => ({ route, outbound: outbound.size }))
    .sort((a, b) => b.outbound - a.outbound)
  const nonCanonicalSummary = summarizeNonCanonicalLinks(nonCanonicalInternalLinks)

  const report = {
    generatedAt: new Date().toISOString(),
    redirectSource: redirectSourceTable.redirectsPath
      ? path.relative(root, redirectSourceTable.redirectsPath).replace(/\\/g, '/')
      : null,
    redirectRulesChecked: redirectSourcePatterns.length,
    totalRoutes: routes.size,
    orphanRoutes,
    weaklyConnected,
    internalLinkDensity: internalLinkDensity.slice(0, 100),
    nonCanonicalInternalLinks,
    nonCanonicalSummary,
  }

  fs.mkdirSync(path.join(root, 'ops', 'reports'), { recursive: true })
  fs.writeFileSync(
    path.join(root, 'ops', 'reports', 'internal-link-report.json'),
    JSON.stringify(report, null, 2),
  )

  const nonIndexable = orphanRoutes.filter((route) =>
    route === '/404' ||
    route === '/500' ||
    route.startsWith('/_not-found') ||
    route.startsWith('/sitemap.xml') ||
    route.startsWith('/robots.txt') ||
    route.startsWith('/opengraph-image') ||
    route.startsWith('/twitter-image') ||
    route.startsWith('/blogdata') ||
    noindexRoutes.has(route),
  )
  const blockingOrphans = orphanRoutes.filter((route) => !nonIndexable.includes(route))
  const topNonCanonicalSource = nonCanonicalSummary.topSourceRoutes[0]

  console.log(
    `internal-links: routes=${routes.size}, orphan=${orphanRoutes.length}, blockingOrphan=${blockingOrphans.length}, weak=${weaklyConnected.length}, nonCanonical=${nonCanonicalInternalLinks.length}`,
  )
  if (topNonCanonicalSource) {
    console.log(`[internal-links] top non-canonical source: ${topNonCanonicalSource.value} (${topNonCanonicalSource.count})`)
  }
  if (nonCanonicalInternalLinks.length) {
    console.error(`[internal-links] found ${nonCanonicalInternalLinks.length} non-canonical internal hrefs`)
    if (process.env.CI === 'true') process.exitCode = 1
  }
  if (blockingOrphans.length) {
    console.error(`[internal-links] found ${blockingOrphans.length} orphaned crawlable routes`)
    if (process.env.CI === 'true') process.exitCode = 1
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
