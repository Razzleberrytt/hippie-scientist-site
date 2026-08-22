#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const coreGoalsSource = fs.readFileSync(path.join(repoRoot, 'lib/core-goals.ts'), 'utf8')
const coreGoalRoutes = [...coreGoalsSource.matchAll(/href:\s*'([^']+)'/g)]
  .map((match) => match[1])
  .filter((route) => route.startsWith('/goals/'))

if (coreGoalRoutes.length === 0) {
  throw new Error('[verify:core-routes] No canonical goal routes found in lib/core-goals.ts')
}

const coreRoutes = [
  '/',
  '/start',
  '/library',
  '/research',
  '/goals',
  ...coreGoalRoutes,
  '/herbs',
  '/compounds',
  '/guides',
  '/learn',
  '/info/about',
  '/info/contact',
  '/info/privacy',
  '/info/disclaimer',
  '/herbs/ashwagandha/',
  '/safety-checker/',
]

const staticDir = process.env.STATIC_OUTPUT_DIR || 'out'
const staticOutputRoot = path.join(repoRoot, staticDir)

function routeToStaticPath(route) {
  if (route === '/') return path.join(staticOutputRoot, 'index.html')
  return path.join(staticOutputRoot, route.replace(/^\//, ''), 'index.html')
}

function assertExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[verify:core-routes] Missing ${label}: ${path.relative(repoRoot, filePath)}`)
  }
}

assertExists(staticOutputRoot, 'static export directory')

for (const route of coreRoutes) {
  assertExists(routeToStaticPath(route), `static export output for route ${route}`)
}

assertExists(path.join(staticOutputRoot, '_redirects'), 'Cloudflare redirects file')

const LOADING_SENTINEL = 'Loading evidence-driven research'
const spinnerCheckRoutes = ['/', '/herbs', '/compounds']
let spinnerFailures = 0

for (const route of spinnerCheckRoutes) {
  const filePath = routeToStaticPath(route)
  if (!fs.existsSync(filePath)) continue

  const content = fs.readFileSync(filePath, 'utf8')
  if (content.includes(LOADING_SENTINEL)) {
    console.error(`[verify:core-routes] Loading spinner detected on ${route}; data pipeline may have produced stale or missing JSON.`)
    spinnerFailures++
  }
}

if (spinnerFailures > 0) {
  throw new Error(`[verify:core-routes] ${spinnerFailures} page(s) contain the loading spinner; build is not production-ready.`)
}

const routeContentExpectations = [
  {
    route: '/',
    required: ['The Hippie Scientist'],
  },
  {
    route: '/research',
    required: ['Follow the evidence all the way back to the research.', 'Search the complete citation index'],
    forbidden: [LOADING_SENTINEL],
  },
  {
    route: '/herbs',
    required: ['Herb Profiles &amp; Research Library', 'Herb profiles index'],
    forbidden: ['Compound Profiles and Mechanism Guides', 'Find the right supplement path for your goals.'],
  },
  {
    route: '/compounds',
    required: ['Compound Library', 'Published compound profiles index', 'Compound research library'],
    forbidden: ['Herb Profiles &amp; Research Library', 'Find the right supplement path for your goals.'],
  },
  {
    route: '/guides',
    required: ['Evidence Library', 'Browse the reference databases'],
    forbidden: [LOADING_SENTINEL, 'Find the right supplement path for your goals.'],
  },
]

let contentFailures = 0

for (const expectation of routeContentExpectations) {
  const filePath = routeToStaticPath(expectation.route)
  if (!fs.existsSync(filePath)) continue

  const content = fs.readFileSync(filePath, 'utf8')

  for (const required of expectation.required || []) {
    if (!content.includes(required)) {
      console.error(`[verify:core-routes] Missing expected content on ${expectation.route}: ${required}`)
      contentFailures++
    }
  }

  for (const forbidden of expectation.forbidden || []) {
    if (content.includes(forbidden)) {
      console.error(`[verify:core-routes] Unexpected cross-route content on ${expectation.route}: ${forbidden}`)
      contentFailures++
    }
  }
}

if (contentFailures > 0) {
  throw new Error(`[verify:core-routes] ${contentFailures} core-route content expectation(s) failed.`)
}

// Sitemap validation: must be valid XML-ish urlset and contain required routes per task (P0 fix)
const sitemapPath = path.join(staticOutputRoot, 'sitemap.xml')
let sitemapContent = ''
if (fs.existsSync(sitemapPath)) {
  sitemapContent = fs.readFileSync(sitemapPath, 'utf8')
}
if (!sitemapContent || !sitemapContent.includes('<urlset')) {
  console.error('[verify:core-routes] sitemap.xml missing, empty, or invalid (no urlset)')
  contentFailures++
}
// Mirror src/lib/site.ts: NEXT_PUBLIC_SITE_URL=https://www.thehippiescientist.net
// is normalized to the non-www apex, which is the canonical production host.
const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
const SITE_HOST = rawSiteUrl === 'https://www.thehippiescientist.net'
  ? 'https://thehippiescientist.net'
  : (rawSiteUrl || 'https://thehippiescientist.net')
const requiredSitemapUrls = [
  `${SITE_HOST}/`,
  `${SITE_HOST}/start/`,
  `${SITE_HOST}/library/`,
  `${SITE_HOST}/research/`,
  `${SITE_HOST}/goals/`,
  ...coreGoalRoutes.map((route) => `${SITE_HOST}${route}`),
  `${SITE_HOST}/info/about/`,
  `${SITE_HOST}/info/contact/`,
  `${SITE_HOST}/info/privacy/`,
  `${SITE_HOST}/info/disclaimer/`,
  `${SITE_HOST}/guides/`,
  `${SITE_HOST}/herbs/`,
  `${SITE_HOST}/compounds/`,
  `${SITE_HOST}/guides/compare/`,
  '/guides/', // at least some guide or research note
  '/herbs/', // detail
  '/compounds/', // detail
]
for (const u of requiredSitemapUrls) {
  if (!sitemapContent.includes(u)) {
    console.error(`[verify:core-routes] sitemap missing required url: ${u}`)
    contentFailures++
  }
}
// spot check a couple top/* and collections presence (may be partial)
if (!sitemapContent.includes('/best-supplements-for-') && !sitemapContent.includes('/collections/')) {
  console.warn('[verify:core-routes] sitemap may be missing top/best or collections (non-fatal in this check)')
}

if (contentFailures > 0) {
  throw new Error(`[verify:core-routes] ${contentFailures} core-route content expectation(s) failed.`)
}

console.log(`[verify:core-routes] Verified ${coreRoutes.length} core routes, ${staticDir}/_redirects, loading-spinner check, route content expectations, and sitemap.xml (required routes + xml) passed.`)
