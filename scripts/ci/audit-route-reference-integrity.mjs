#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const assetExt = /\.(?:css|js|json|png|jpe?g|gif|webp|avif|svg|ico|txt|xml|map|woff2?)$/i

if (!fs.existsSync(outDir)) {
  console.log('[route-reference-integrity] SKIP: out/ not found')
  process.exit(0)
}

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_next' || entry.name === 'pagefind') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkHtml(full, files)
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full)
  }
  return files
}

function routeFromFile(file) {
  const rel = path.relative(outDir, file).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`
}

function normalizeRoute(value) {
  const route = String(value || '').split(/[?#]/)[0]
  if (!route || route === '/') return '/'
  return route.replace(/\/+$/, '') || '/'
}

function redirectSources() {
  const candidates = [path.join(outDir, '_redirects'), path.join(root, 'public', '_redirects')]
  const file = candidates.find((candidate) => fs.existsSync(candidate))
  if (!file) return []
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 3 && /^30[1278]$/.test(parts[2]))
    .map(([source]) => source)
    .filter((source) => source?.startsWith('/'))
}

function coveredByRedirect(route, sources) {
  const normalized = normalizeRoute(route)
  return sources.some((source) => {
    if (source.endsWith('/*')) return normalized.startsWith(normalizeRoute(source.slice(0, -1)))
    if (source.includes(':splat')) return normalized.startsWith(normalizeRoute(source.split(':splat')[0]))
    return normalized === normalizeRoute(source)
  })
}

function countBy(rows, key, limit = 30) {
  const counts = new Map()
  for (const row of rows) counts.set(row[key], (counts.get(row[key]) || 0) + 1)
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)))
    .slice(0, limit)
}

const htmlFiles = walkHtml(outDir)
const routes = new Set(htmlFiles.map(routeFromFile).map(normalizeRoute))
const redirects = redirectSources()
const linkPattern = /href=["'](\/[^"'#\s>]*)["']/g
const unresolved = []

for (const file of htmlFiles) {
  const source = normalizeRoute(routeFromFile(file))
  const html = fs.readFileSync(file, 'utf8')
  for (const match of html.matchAll(linkPattern)) {
    const href = match[1]
    const route = normalizeRoute(href)
    if (href.startsWith('//')) continue
    if (route.startsWith('/_next/') || route.startsWith('/cdn-cgi/')) continue
    if (assetExt.test(route) || route.split('/').pop()?.includes('.')) continue
    if (routes.has(route) || coveredByRedirect(route, redirects)) continue
    unresolved.push({ source, href, route })
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  scannedRoutes: routes.size,
  unresolvedReferences: unresolved.length,
  uniqueRoutes: new Set(unresolved.map((row) => row.route)).size,
  affectedPages: new Set(unresolved.map((row) => row.source)).size,
  frequentRoutes: countBy(unresolved, 'route'),
  frequentSourcePages: countBy(unresolved, 'source'),
  references: unresolved,
}

fs.mkdirSync(path.join(root, 'ops', 'reports'), { recursive: true })
fs.writeFileSync(
  path.join(root, 'ops', 'reports', 'route-reference-integrity.json'),
  JSON.stringify(report, null, 2),
)

console.log(
  `[route-reference-integrity] pages=${report.scannedRoutes} references=${report.unresolvedReferences} uniqueRoutes=${report.uniqueRoutes} affectedPages=${report.affectedPages}`,
)
for (const row of report.frequentRoutes) console.warn(`[route-reference-integrity] route ${row.value} (${row.count})`)
for (const row of report.frequentSourcePages.slice(0, 10)) console.warn(`[route-reference-integrity] source ${row.value} (${row.count})`)
