#!/usr/bin/env node
/**
 * Sitemap completeness check.
 *
 * validate-sitemap.mjs already checks that every URL *in* sitemap.xml has a
 * corresponding built file (catches false positives — stale/broken sitemap
 * entries). It does NOT catch the opposite failure: a real, built,
 * indexable page that never made it into the sitemap at all (a false
 * negative). Two real bugs of exactly that shape shipped silently in this
 * repo before this check existed:
 *   - app/articles/[slug] existed with zero sitemap coverage
 *   - app/guides/other/** (and app/guides/compare/**) were nested two
 *     directory levels deep and were silently dropped by a scanner that
 *     only looked one level under app/guides/
 *
 * This script recursively finds every static (non-dynamic-segment) route
 * under app/, filters out routes with an explicit noindex signal in their
 * own metadata (mirroring the same textual check app/sitemap.ts already
 * uses) or in the curated EXCLUDED_ROUTES allowlist below, and fails if any
 * remaining route is missing from the built sitemap.xml.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, 'app')
const OUT_DIR = path.join(ROOT, 'out')
const REQUIRE_BUILT = process.argv.includes('--require-built')

// Directories that are never page routes (Next.js internals, tests, API-ish
// utility pages that are intentionally excluded from search indexing).
const SKIP_DIR_NAMES = new Set(['__tests__', 'api'])

// Route paths (relative to app/, route groups already stripped) that are
// real, working pages but are deliberately excluded from the sitemap. Keep
// this list short and documented — anything added here should have a real
// reason, not just "the checker complained so I silenced it."
const EXCLUDED_ROUTES = new Set([
  'build', // app/(public)/build — internal dev-only stack builder, already noindex
  'guides/anxiety/natural-alternatives-to-anxiety-medication', // canonicalizes to guides/anxiety/best-herbs-for-anxiety (deliberate duplicate-content consolidation)
  'guides/anxiety/natural-anxiolytics-beyond-ashwagandha', // canonicalizes to guides/anxiety/best-herbs-for-anxiety (deliberate duplicate-content consolidation)
])

const SPECIAL_FILE_ROUTES = new Set([
  'robots.ts',
  'sitemap.ts',
  'opengraph-image.tsx',
  'twitter-image.tsx',
  'manifest.ts',
  'icon.tsx',
  'apple-icon.tsx',
])

function stripRouteGroups(routeSegments) {
  // Route groups like (public) are stripped from the URL by Next.js.
  return routeSegments.filter((segment) => !/^\(.*\)$/.test(segment))
}

function findPageFile(dirPath) {
  for (const name of ['page.tsx', 'page.ts']) {
    const filePath = path.join(dirPath, name)
    if (fs.existsSync(filePath)) return filePath
  }
  return null
}

function hasNoindexSignal(pageFilePath) {
  try {
    const content = fs.readFileSync(pageFilePath, 'utf8')
    return (
      /robots\s*:\s*\{\s*index\s*:\s*false/.test(content) ||
      /robots\s*:\s*["'][^"']*noindex/i.test(content) ||
      /dynamic\s*=\s*['"]force-dynamic['"]/.test(content)
    )
  } catch {
    return false
  }
}

function collectStaticRoutes(dirPath, routeSegments) {
  const results = []
  let entries
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return results
  }

  const ownPageFile = findPageFile(dirPath)
  if (ownPageFile) {
    const cleanSegments = stripRouteGroups(routeSegments)
    const routePath = cleanSegments.length > 0 ? `/${cleanSegments.join('/')}` : '/'
    if (!hasNoindexSignal(ownPageFile) && !EXCLUDED_ROUTES.has(cleanSegments.join('/'))) {
      results.push(routePath)
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (SKIP_DIR_NAMES.has(entry.name)) continue
    if (/^\[/.test(entry.name)) continue // dynamic segments are data-driven, validated separately
    results.push(...collectStaticRoutes(path.join(dirPath, entry.name), [...routeSegments, entry.name]))
  }

  return results
}

function parseXmlUrls(xmlContent) {
  const urls = []
  const locRegex = /<loc>(.*?)<\/loc>/g
  let match
  while ((match = locRegex.exec(xmlContent)) !== null) {
    urls.push(match[1])
  }
  return urls
}

function normalizePath(url) {
  try {
    const u = new URL(url)
    const p = u.pathname.replace(/\/+$/, '')
    return p === '' ? '/' : p
  } catch {
    return url
  }
}

function main() {
  if (!fs.existsSync(APP_DIR)) {
    console.error('[validate-sitemap-completeness] FAIL: app/ directory does not exist.')
    process.exit(1)
  }

  const staticRoutes = collectStaticRoutes(APP_DIR, []).filter((route) => {
    const leaf = route.split('/').pop() || ''
    return !SPECIAL_FILE_ROUTES.has(leaf)
  })

  if (!fs.existsSync(OUT_DIR)) {
    if (REQUIRE_BUILT) {
      console.error('[validate-sitemap-completeness] FAIL: out/ directory does not exist. Run `npm run build` first.')
      process.exit(1)
    }
    console.log(`[validate-sitemap-completeness] SKIP: out/ directory does not exist yet (pre-build stage). Found ${staticRoutes.length} candidate static routes.`)
    return
  }

  const sitemapPath = path.join(OUT_DIR, 'sitemap.xml')
  if (!fs.existsSync(sitemapPath)) {
    console.error('[validate-sitemap-completeness] FAIL: out/sitemap.xml does not exist.')
    process.exit(1)
  }

  const sitemapUrls = new Set(parseXmlUrls(fs.readFileSync(sitemapPath, 'utf8')).map(normalizePath))

  const missing = staticRoutes.filter((route) => !sitemapUrls.has(route)).sort()

  console.log(`[validate-sitemap-completeness] Found ${staticRoutes.length} static app/ routes without an explicit noindex signal; ${sitemapUrls.size} URLs in sitemap.xml.`)

  if (missing.length > 0) {
    console.error(`[validate-sitemap-completeness] FAIL: ${missing.length} real, indexable route(s) are missing from sitemap.xml:`)
    for (const route of missing) {
      console.error(`  - ${route}`)
    }
    console.error('')
    console.error('If a route is intentionally excluded, add it to EXCLUDED_ROUTES in this script with a comment explaining why.')
    console.error('If not, the sitemap generator in app/sitemap.ts is silently dropping real content — check')
    console.error('readAppGuidePageSlugs()-style directory scanners for a depth limit, and shouldIndexRoute() in')
    console.error('src/lib/seo.ts for a regex that only matches a subset of the route\'s path depth.')
    process.exit(1)
  }

  console.log('[validate-sitemap-completeness] PASS: every static app/ route is covered by sitemap.xml.')
}

main()
