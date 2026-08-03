#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const redirectsOutput = path.join(outDir, '_redirects')
const reportPath = path.join(root, 'ops', 'reports', 'internal-redirect-link-report.json')

function normalizeRoute(value) {
  const clean = String(value || '').split(/[?#]/)[0].trim()
  if (!clean.startsWith('/')) return null
  const normalized = clean.length > 1 ? clean.replace(/\/+$/, '') : '/'
  return normalized || '/'
}

function parseRedirectSources(filePath) {
  if (!fs.existsSync(filePath)) return []

  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split(/\s+/))
    .filter(parts => parts.length >= 3 && /^30[1278]$/.test(parts[2]))
    .map(([source, target, status]) => ({
      source: normalizeRoute(source),
      target: normalizeRoute(target),
      status: Number(status),
      rawSource: source,
    }))
    .filter(row => row.source && row.target && row.source !== row.target)
}

function* walkHtml(dir) {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_next' || entry.name === 'pagefind') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walkHtml(fullPath)
    else if (entry.isFile() && entry.name.endsWith('.html')) yield fullPath
  }
}

function routeFromFile(filePath) {
  const relative = path.relative(outDir, filePath).replace(/\\/g, '/')
  if (relative === 'index.html') return '/'
  return normalizeRoute(`/${relative.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`)
}

function matchesRedirect(route, redirect) {
  if (!route || !redirect.source) return false
  const raw = redirect.rawSource
  if (raw.includes('*')) {
    return route.startsWith(normalizeRoute(raw.split('*')[0]) || '/')
  }
  if (raw.includes(':splat')) {
    return route.startsWith(normalizeRoute(raw.split(':splat')[0]) || '/')
  }
  return route === redirect.source
}

if (!fs.existsSync(outDir)) {
  console.error('[audit-internal-redirect-links] Missing out/. Run the production build first.')
  process.exit(1)
}

if (!fs.existsSync(redirectsOutput)) {
  console.error('[audit-internal-redirect-links] Missing out/_redirects. Run the full deployment build first.')
  process.exit(1)
}

const redirects = parseRedirectSources(redirectsOutput)
const findings = []
const hrefPattern = /href=["'](\/[^"'#\s>]*)["']/gi

for (const filePath of walkHtml(outDir)) {
  const sourceRoute = routeFromFile(filePath)
  const html = fs.readFileSync(filePath, 'utf8')

  for (const match of html.matchAll(hrefPattern)) {
    const href = match[1]
    const targetRoute = normalizeRoute(href)
    if (!targetRoute) continue

    const redirect = redirects.find(row => matchesRedirect(targetRoute, row))
    if (!redirect) continue

    findings.push({
      sourceRoute,
      href,
      redirectSource: redirect.source,
      redirectTarget: redirect.target,
      status: redirect.status,
    })
  }
}

const deduped = [...new Map(
  findings.map(row => [`${row.sourceRoute}\u0000${row.href}\u0000${row.redirectTarget}`, row]),
).values()]

const byTarget = new Map()
for (const row of deduped) {
  const key = `${row.redirectSource} -> ${row.redirectTarget}`
  byTarget.set(key, (byTarget.get(key) || 0) + 1)
}

const report = {
  generatedAt: new Date().toISOString(),
  redirectsChecked: redirects.length,
  findings: deduped,
  summary: [...byTarget.entries()]
    .map(([redirect, count]) => ({ redirect, count }))
    .sort((a, b) => b.count - a.count || a.redirect.localeCompare(b.redirect)),
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

if (deduped.length > 0) {
  console.error(`[audit-internal-redirect-links] FAIL: found ${deduped.length} internal links pointing at redirect sources.`)
  for (const row of report.summary.slice(0, 20)) {
    console.error(`  ${row.count}x ${row.redirect}`)
  }
  console.error(`[audit-internal-redirect-links] Full report: ${path.relative(root, reportPath)}`)
  process.exit(1)
}

console.log(`[audit-internal-redirect-links] PASS: checked ${redirects.length} redirects; no internal redirect links found.`)
