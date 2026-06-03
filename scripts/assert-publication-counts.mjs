#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')

const DEFAULTS = {
  herbs: 4,
  compounds: 150,
  blogPosts: 10,
  sitemapUrls: 200,
}

function intFromEnv(name, fallback) {
  const raw = process.env[name]
  if (raw == null || raw.trim() === '') return fallback
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    console.error(`[publication-counts] Invalid ${name}=${raw}. Expected a non-negative integer.`)
    process.exit(1)
  }
  return parsed
}

function collectRoutesFromDist() {
  if (!fs.existsSync(DIST)) {
    console.error('[publication-counts] dist/ is missing. Run build + postbuild first.')
    process.exit(1)
  }

  const routes = []
  const stack = [DIST]
  while (stack.length > 0) {
    const next = stack.pop()
    const entries = fs.readdirSync(next, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(next, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
      } else if (entry.isFile() && entry.name.toLowerCase() === 'index.html') {
        const relPath = path.relative(DIST, fullPath).replace(/\\/g, '/')
        const route = relPath === 'index.html' ? '/' : `/${relPath.replace(/\/index\.html$/, '')}`
        routes.push(route)
      }
    }
  }

  return routes
}

function countSitemapUrls() {
  const sitemapPath = path.join(DIST, 'sitemap.xml')
  if (!fs.existsSync(sitemapPath)) {
    console.error('[publication-counts] dist/sitemap.xml is missing. Run sitemap generation first.')
    process.exit(1)
  }
  const xml = fs.readFileSync(sitemapPath, 'utf8')
  return (xml.match(/<loc>/g) || []).length
}

function main() {
  const minimums = {
    herbs: intFromEnv('MIN_HERB_ROUTES', DEFAULTS.herbs),
    compounds: intFromEnv('MIN_COMPOUND_ROUTES', DEFAULTS.compounds),
    blogPosts: intFromEnv('MIN_BLOG_POST_ROUTES', DEFAULTS.blogPosts),
    sitemapUrls: intFromEnv('MIN_SITEMAP_URLS', DEFAULTS.sitemapUrls),
  }

  const routes = collectRoutesFromDist()
  const counts = {
    herbs: routes.filter(route => /^\/herbs\/[^/]+$/.test(route)).length,
    compounds: routes.filter(route => /^\/compounds\/[^/]+$/.test(route)).length,
    blogPosts: routes.filter(route => /^\/blog\/[^/]+$/.test(route)).length,
    sitemapUrls: countSitemapUrls(),
  }

  console.log('[publication-counts] Observed vs minimum thresholds:')
  console.log(` - herb routes: ${counts.herbs} (min ${minimums.herbs})`)
  console.log(` - compound routes: ${counts.compounds} (min ${minimums.compounds})`)
  console.log(` - blog post routes: ${counts.blogPosts} (min ${minimums.blogPosts})`)
  console.log(` - sitemap URLs: ${counts.sitemapUrls} (min ${minimums.sitemapUrls})`)

  const failures = Object.entries(minimums).flatMap(([key, min]) => {
    const actual = counts[key]
    return actual < min ? [`${key}: ${actual} < ${min}`] : []
  })

  if (failures.length > 0) {
    console.error('[publication-counts] FAIL threshold regression detected:')
    failures.forEach(failure => console.error(` - ${failure}`))
    process.exit(1)
  }

  console.log('[publication-counts] PASS publication route counts are above configured minimums.')
}

main()
