#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'out')
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://thehippiescientist.net')
  .replace(/\/$/, '')
  .replace('https://www.thehippiescientist.net', 'https://thehippiescientist.net')

const BLOCKED_PREFIXES = [
  '/_next/',
  '/api/',
  '/assets/',
  '/data/',
  '/og/',
  '/pagefind/',
  '/admin/',
  '/analytics/',
  '/dashboard/',
  '/drafts/',
  '/preview/',
  '/temp/',
  '/tmp/',
  '/dev/',
  '/test/',
]

const BLOCKED_EXACT = new Set([
  '/404/',
  '/500/',
  '/not-found/',
])

function normalizePathname(value) {
  if (!value) return '/'
  const pathOnly = value.split(/[?#]/)[0] || '/'
  const withLeading = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  if (withLeading === '/') return '/'
  return `${withLeading.replace(/\/+$/, '')}/`
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function routeFromHtmlFile(relativePath) {
  const rel = relativePath.split(path.sep).join('/')
  if (!rel.endsWith('.html')) return null
  if (rel === 'index.html') return '/'
  if (rel === '404.html' || rel === '500.html') return null
  if (rel.endsWith('/index.html')) {
    return normalizePathname(`/${rel.slice(0, -'/index.html'.length)}`)
  }
  return normalizePathname(`/${rel.slice(0, -'.html'.length)}`)
}

async function walkHtmlFiles(dir, baseDir = dir, output = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name)
    const relative = path.relative(baseDir, absolute)

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) continue
      await walkHtmlFiles(absolute, baseDir, output)
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      output.push(relative)
    }
  }

  return output
}

async function readRedirectSources() {
  const redirectsPath = path.join(OUT_DIR, '_redirects')
  const sources = new Set()

  try {
    const raw = await fs.readFile(redirectsPath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [source, target, status] = trimmed.split(/\s+/)
      if (!source || !target || !/^30[1278]$/.test(status || '')) continue
      if (source.includes('*')) continue
      const normalizedSource = normalizePathname(source)
      const normalizedTarget = normalizePathname(target)
      if (normalizedSource !== normalizedTarget) sources.add(normalizedSource)
    }
  } catch {
    // No redirects file; continue safely.
  }

  return sources
}

function shouldBlockRoute(routePath, redirectSources) {
  if (!routePath) return true
  if (redirectSources.has(routePath)) return true
  if (BLOCKED_EXACT.has(routePath)) return true
  return BLOCKED_PREFIXES.some((prefix) => routePath.startsWith(prefix))
}

function extractRobotsNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
}

function extractCanonicalPath(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
  if (!match?.[1]) return null

  try {
    const url = new URL(match[1], SITE_URL)
    if (url.hostname.replace(/^www\./, '') !== 'thehippiescientist.net') return null
    return normalizePathname(url.pathname)
  } catch {
    return null
  }
}

async function main() {
  try {
    await fs.access(OUT_DIR)
  } catch {
    console.error('[write-static-sitemap] FAIL: out/ directory does not exist. Run the production build first.')
    process.exit(1)
  }

  const redirectSources = await readRedirectSources()
  const htmlFiles = await walkHtmlFiles(OUT_DIR)
  const urls = new Map()

  for (const htmlFile of htmlFiles) {
    const routePath = routeFromHtmlFile(htmlFile)
    if (shouldBlockRoute(routePath, redirectSources)) continue

    const absolutePath = path.join(OUT_DIR, htmlFile)
    let html = ''
    try {
      html = await fs.readFile(absolutePath, 'utf8')
    } catch {
      continue
    }

    if (extractRobotsNoindex(html)) continue

    const canonicalPath = extractCanonicalPath(html)
    if (canonicalPath && canonicalPath !== routePath) continue

    const stat = await fs.stat(absolutePath)
    const loc = routePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${routePath}`
    const lastmod = stat.mtime.toISOString().slice(0, 10)

    urls.set(loc, { loc, lastmod })
  }

  const sortedUrls = Array.from(urls.values()).sort((a, b) => {
    if (a.loc === `${SITE_URL}/`) return -1
    if (b.loc === `${SITE_URL}/`) return 1
    return a.loc.localeCompare(b.loc)
  })

  if (sortedUrls.length === 0) {
    console.error('[write-static-sitemap] FAIL: no indexable HTML pages found in out/.')
    process.exit(1)
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sortedUrls.map(({ loc, lastmod }) => [
      '  <url>',
      `    <loc>${xmlEscape(loc)}</loc>`,
      `    <lastmod>${xmlEscape(lastmod)}</lastmod>`,
      '  </url>',
    ].join('\n')),
    '</urlset>',
    '',
  ].join('\n')

  const sitemapPath = path.join(OUT_DIR, 'sitemap.xml')
  await fs.writeFile(sitemapPath, xml, 'utf8')

  const check = await fs.readFile(sitemapPath, 'utf8')
  if (/^\s*(?:<!doctype\s+html\b|<html\b)/i.test(check) || !/<urlset\b/i.test(check)) {
    console.error('[write-static-sitemap] FAIL: generated sitemap.xml is not valid sitemap XML.')
    process.exit(1)
  }

  console.log(`[write-static-sitemap] Wrote ${sortedUrls.length} URLs to out/sitemap.xml`)
}

main().catch((error) => {
  console.error('[write-static-sitemap] FAIL')
  console.error(error)
  process.exit(1)
})
