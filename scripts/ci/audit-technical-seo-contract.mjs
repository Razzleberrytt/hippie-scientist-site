#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.resolve(ROOT, process.argv.find((arg) => arg.startsWith('--out='))?.split('=')[1] || 'out')
const REDIRECTS_FILE = path.join(ROOT, 'public/_redirects')
const REPORT = path.join(ROOT, 'reports/technical-seo-contract.json')
const CANONICAL_ORIGIN = 'https://thehippiescientist.net'
const FAIL = !process.argv.includes('--warn-only')

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function normalizePath(value) {
  if (!value) return '/'
  try {
    const url = new URL(value, CANONICAL_ORIGIN)
    const pathname = url.pathname || '/'
    if (/\.[a-z0-9]+$/i.test(pathname)) return pathname
    return pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`
  } catch {
    return ''
  }
}

function routeForFile(file) {
  const relative = path.relative(OUT, file).replaceAll(path.sep, '/')
  if (relative === 'index.html') return '/'
  if (relative === '404.html') return '/404.html'
  if (relative.endsWith('/index.html')) return normalizePath(`/${relative.slice(0, -'index.html'.length)}`)
  return normalizePath(`/${relative.replace(/\.html$/, '')}`)
}

function canonicalFromHtml(html) {
  return html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]
    || html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1]
    || ''
}

function robotsNoindex(html) {
  return /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)
    || /<meta\b[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html)
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function internalLinks(html) {
  return Array.from(html.matchAll(/href=["']([^"'#]+)["']/gi), (match) => match[1])
    .map((href) => {
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return null
      if (/^https?:\/\//i.test(href)) {
        try {
          const url = new URL(href)
          if (url.hostname !== 'thehippiescientist.net' && url.hostname !== 'www.thehippiescientist.net') return null
          return normalizePath(url.pathname)
        } catch { return null }
      }
      return href.startsWith('/') ? normalizePath(href) : null
    })
    .filter(Boolean)
}

function parseRedirects() {
  if (!fs.existsSync(REDIRECTS_FILE)) return []
  return fs.readFileSync(REDIRECTS_FILE, 'utf8').split(/\r?\n/).map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 2)
    .map(([from, to, status = '301']) => ({ from: normalizePath(from), to: normalizePath(to), rawTo: to, status }))
    .filter((row) => row.from && row.to)
}

function parseSitemap() {
  const file = path.join(OUT, 'sitemap.xml')
  if (!fs.existsSync(file)) return { entries: [], raw: '' }
  const raw = fs.readFileSync(file, 'utf8')
  const entries = Array.from(raw.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?(?:<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/gi), (match) => ({
    loc: match[1].trim(),
    lastmod: (match[2] || '').trim(),
  }))
  return { entries, raw }
}

const htmlPages = walk(OUT).filter((file) => file.endsWith('.html')).map((file) => ({
  file,
  route: routeForFile(file),
  html: fs.readFileSync(file, 'utf8'),
})).filter((page) => page.route)
const builtRoutes = new Set(htmlPages.map((page) => page.route))
const redirects = parseRedirects()
const redirectMap = new Map(redirects.map((row) => [row.from, row]))
const errors = []
const warnings = []

for (const page of htmlPages) {
  if (page.route === '/404.html') continue
  const canonical = canonicalFromHtml(page.html)
  if (!canonical) {
    errors.push({ type: 'missing-canonical', route: page.route })
    continue
  }
  let canonicalUrl
  try { canonicalUrl = new URL(canonical) } catch {
    errors.push({ type: 'malformed-canonical', route: page.route, canonical })
    continue
  }
  if (canonicalUrl.origin !== CANONICAL_ORIGIN) errors.push({ type: 'wrong-canonical-host', route: page.route, canonical })
  if (canonicalUrl.protocol !== 'https:') errors.push({ type: 'non-https-canonical', route: page.route, canonical })
  if (canonicalUrl.hostname.startsWith('www.')) errors.push({ type: 'www-canonical', route: page.route, canonical })
  const expectedPath = normalizePath(page.route)
  const actualPath = normalizePath(canonicalUrl.pathname)
  if (!robotsNoindex(page.html) && actualPath !== expectedPath && !redirectMap.has(expectedPath)) {
    errors.push({ type: 'canonical-path-mismatch', route: page.route, expectedPath, actualPath })
  }
}

for (const redirect of redirects) {
  const seen = new Set([redirect.from])
  let current = redirect
  let hops = 0
  while (current && redirectMap.has(current.to)) {
    hops += 1
    if (seen.has(current.to)) {
      errors.push({ type: 'redirect-loop', source: redirect.from, at: current.to })
      break
    }
    seen.add(current.to)
    current = redirectMap.get(current.to)
    if (hops > 10) {
      errors.push({ type: 'redirect-loop-or-excessive-chain', source: redirect.from })
      break
    }
  }
  if (hops > 0) errors.push({ type: 'redirect-chain', source: redirect.from, hops: hops + 1 })
  if (redirect.to === '/' && redirect.from !== '/') warnings.push({ type: 'redirect-to-home-review-equivalence', source: redirect.from })
}

for (const page of htmlPages) {
  if (page.route === '/404.html') continue
  for (const target of new Set(internalLinks(page.html))) {
    if (redirectMap.has(target)) errors.push({ type: 'internal-link-to-redirect', source: page.route, target })
    if (!builtRoutes.has(target) && !redirectMap.has(target) && !/\.(xml|txt|json|rss|atom)\/?$/i.test(target)) {
      errors.push({ type: 'broken-internal-link', source: page.route, target })
    }
  }

  const text = visibleText(page.html).toLowerCase()
  const soft404Signals = [
    /\bpage not found\b/,
    /\bcontent not found\b/,
    /\bno matching canonical profile yet\b/,
    /\bdoes not exist\b/,
    /\bwe couldn't find\b/,
  ]
  if (soft404Signals.some((pattern) => pattern.test(text)) && !robotsNoindex(page.html)) {
    errors.push({ type: 'soft-404-content-on-indexable-route', route: page.route })
  }
}

const sitemap = parseSitemap()
const sitemapPaths = new Set()
const lastmods = []
for (const entry of sitemap.entries) {
  let url
  try { url = new URL(entry.loc) } catch {
    errors.push({ type: 'malformed-sitemap-url', loc: entry.loc })
    continue
  }
  if (url.origin !== CANONICAL_ORIGIN) errors.push({ type: 'sitemap-wrong-host', loc: entry.loc })
  const route = normalizePath(url.pathname)
  if (sitemapPaths.has(route)) errors.push({ type: 'duplicate-sitemap-url', route })
  sitemapPaths.add(route)
  if (redirectMap.has(route)) errors.push({ type: 'redirected-url-in-sitemap', route })
  const page = htmlPages.find((candidate) => candidate.route === route)
  if (!page) errors.push({ type: 'sitemap-url-missing-from-build', route })
  else {
    if (robotsNoindex(page.html)) errors.push({ type: 'noindex-url-in-sitemap', route })
    const canonical = canonicalFromHtml(page.html)
    if (canonical && normalizePath(new URL(canonical, CANONICAL_ORIGIN).pathname) !== route) errors.push({ type: 'noncanonical-url-in-sitemap', route, canonical })
  }
  if (entry.lastmod) lastmods.push(entry.lastmod)
}

if (!sitemap.entries.length) errors.push({ type: 'missing-or-empty-sitemap' })
if (sitemap.entries.length > 10000) warnings.push({ type: 'consider-sitemap-index-split', count: sitemap.entries.length })
if (lastmods.length >= 20) {
  const counts = new Map()
  for (const value of lastmods) counts.set(value, (counts.get(value) || 0) + 1)
  const [mostCommon, frequency] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (frequency / lastmods.length > 0.8) {
    errors.push({ type: 'suspicious-uniform-lastmod', value: mostCommon, frequency, total: lastmods.length })
  }
}

const summary = {
  builtHtmlPages: htmlPages.length,
  redirects: redirects.length,
  sitemapUrls: sitemap.entries.length,
  errors: errors.length,
  warnings: warnings.length,
}
fs.mkdirSync(path.dirname(REPORT), { recursive: true })
fs.writeFileSync(REPORT, `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, errors, warnings }, null, 2)}\n`)
console.log('[technical-seo-contract]', summary)
console.log(`Report: ${path.relative(ROOT, REPORT)}`)
if (errors.length && FAIL) process.exitCode = 1
