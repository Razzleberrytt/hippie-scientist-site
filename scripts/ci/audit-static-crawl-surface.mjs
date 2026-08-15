#!/usr/bin/env node
/**
 * Static-export crawl audit for backlog 455–460.
 *
 * Verifies that paginated libraries are indexable/self-canonical and form a
 * crawlable chain, and that core research/navigation content is present in HTML
 * without requiring client-side JavaScript.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const reportPath = path.join(root, 'reports/static-crawl-surface.json')

if (!fs.existsSync(outDir)) {
  console.error('[static-crawl] missing out/ — run a production build first')
  process.exit(1)
}

function normalizeRoute(input) {
  let value = input || '/'
  try { value = new URL(value, 'https://thehippiescientist.net').pathname } catch {}
  value = value.replace(/\/+/g, '/')
  if (!value.startsWith('/')) value = `/${value}`
  if (value !== '/' && !value.endsWith('/')) value += '/'
  return value
}

function routeToFile(route) {
  const clean = normalizeRoute(route)
  if (clean === '/') return path.join(outDir, 'index.html')
  return path.join(outDir, clean.slice(1), 'index.html')
}

function readRoute(route) {
  const file = routeToFile(route)
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
}

function robots(html) {
  const match = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/i)
  return match?.[1]?.toLowerCase() || 'index,follow'
}

function canonical(html) {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)
  return normalizeRoute(match?.[1] || '')
}

function links(html) {
  const values = []
  for (const [, href] of html.matchAll(/<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>/gi)) {
    if (/^(?:mailto:|tel:|javascript:)/i.test(href)) continue
    try {
      const url = new URL(href, 'https://thehippiescientist.net')
      if (url.hostname !== 'thehippiescientist.net') continue
      values.push(normalizeRoute(url.pathname))
    } catch {}
  }
  return [...new Set(values)]
}

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|#39);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function scriptSummary(html) {
  const external = [...html.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1])
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
  return {
    externalCount: external.length,
    nextChunkCount: external.filter((src) => src.includes('/_next/static/')).length,
    inlineBytes: inline.reduce((sum, body) => sum + Buffer.byteLength(body), 0),
  }
}

const errors = []
const warnings = []
const pagination = {}

for (const segment of ['herbs', 'compounds']) {
  const baseDir = path.join(outDir, segment, 'page')
  const pageNumbers = fs.existsSync(baseDir)
    ? fs.readdirSync(baseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name))
      .map((entry) => Number(entry.name))
      .sort((a, b) => a - b)
    : []

  pagination[segment] = { pages: pageNumbers, checks: [] }

  for (const page of pageNumbers) {
    const route = `/${segment}/page/${page}/`
    const html = readRoute(route)
    if (!html) {
      errors.push(`${route} is missing static HTML`)
      continue
    }

    const emittedRobots = robots(html)
    const emittedCanonical = canonical(html)
    const hrefs = links(html)
    const previous = page === 2 ? `/${segment}/` : `/${segment}/page/${page - 1}/`
    const next = pageNumbers.includes(page + 1) ? `/${segment}/page/${page + 1}/` : null

    if (emittedRobots.split(',').includes('noindex')) errors.push(`${route} must be crawlable but emits ${emittedRobots}`)
    if (emittedCanonical !== route) errors.push(`${route} canonical is ${emittedCanonical || '(missing)'}`)
    if (!hrefs.includes(previous)) errors.push(`${route} does not link to previous page ${previous}`)
    if (next && !hrefs.includes(next)) errors.push(`${route} does not link to next page ${next}`)

    pagination[segment].checks.push({ route, robots: emittedRobots, canonical: emittedCanonical, previous, next })
  }
}

const discovery = {}
for (const segment of ['herbs', 'compounds']) {
  const route = `/${segment}/`
  const html = readRoute(route)
  const profilePattern = new RegExp(`^/${segment}/[^/]+/$`)
  const profileLinks = links(html).filter((href) => profilePattern.test(href) && !href.includes('/page/'))
  discovery[segment] = { profileLinksInStaticHtml: profileLinks.length, examples: profileLinks.slice(0, 10) }
  if (profileLinks.length < 6) errors.push(`${route} exposes only ${profileLinks.length} profile links in static HTML`)
}

const keyRoutes = [
  '/',
  '/herbs/',
  '/compounds/',
  '/search/',
  '/herbs/ashwagandha/',
  '/compounds/l-theanine/',
  '/guides/sleep/',
  '/safety-checker/',
]

const staticHtml = []
for (const route of keyRoutes) {
  const html = readRoute(route)
  if (!html) {
    warnings.push(`${route} was not present in this export; skipped representative static-HTML check`)
    continue
  }
  const text = visibleText(html)
  const hasH1 = /<h1\b/i.test(html)
  const script = scriptSummary(html)
  const row = { route, visibleTextChars: text.length, hasH1, internalLinks: links(html).length, ...script }
  staticHtml.push(row)

  if (!hasH1 && route !== '/') errors.push(`${route} has no H1 in static HTML`)
  if (text.length < 250) errors.push(`${route} exposes only ${text.length} visible text characters without JavaScript`)
  if (route !== '/search/' && links(html).length < 3) errors.push(`${route} exposes fewer than 3 internal links in static HTML`)

  // This is deliberately a high ceiling: the purpose is to detect accidental
  // client-bundle explosions while Lighthouse/performance budgets handle tighter
  // optimization. Core research routes should not quietly grow without bound.
  if (script.nextChunkCount > 40) errors.push(`${route} loads ${script.nextChunkCount} Next.js chunks (budget: 40)`)
}

const searchHtml = readRoute('/search/')
if (searchHtml && !robots(searchHtml).split(',').includes('noindex')) {
  errors.push('/search/ must remain noindex even though its clean navigation links are crawlable')
}

const report = {
  generatedAt: new Date().toISOString(),
  pagination,
  discovery,
  representativeStaticHtml: staticHtml,
  warnings,
  errors,
}
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`[static-crawl] pagination: herbs=${pagination.herbs.pages.length}, compounds=${pagination.compounds.pages.length}`)
console.log(`[static-crawl] static discovery: herbs=${discovery.herbs.profileLinksInStaticHtml}, compounds=${discovery.compounds.profileLinksInStaticHtml}`)
for (const row of staticHtml) {
  console.log(`[static-crawl] ${row.route} text=${row.visibleTextChars} chars links=${row.internalLinks} chunks=${row.nextChunkCount}`)
}
for (const warning of warnings) console.warn(`[static-crawl] WARN: ${warning}`)
console.log('[static-crawl] report: reports/static-crawl-surface.json')

if (errors.length) {
  console.error(`\n[static-crawl] ${errors.length} error(s):`)
  for (const error of errors.slice(0, 50)) console.error(`[static-crawl]   ${error}`)
  process.exit(1)
}
console.log('[static-crawl] OK: pagination and core content remain crawlable in static HTML')
