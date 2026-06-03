#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const coreRoutes = [
  '/',
  '/herbs',
  '/compounds',
  '/blog',
  '/learn',
  '/about',
  '/contact',
  '/privacy',
  '/disclaimer',
]

const repoRoot = process.cwd()
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
    route: '/herbs',
    required: ['Herb Profiles &amp; Research Library', 'Herb profiles index'],
    forbidden: ['Compound Profiles and Mechanism Guides'],
  },
  {
    route: '/compounds',
    required: ['Compound &amp; Nootropic Profiles', 'Compound profiles index'],
    forbidden: ['Herb Profiles &amp; Research Library'],
  },
  {
    route: '/blog',
    required: ['Research Notes', 'All research notes'],
    forbidden: [LOADING_SENTINEL],
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

console.log(`[verify:core-routes] Verified ${coreRoutes.length} core routes, ${staticDir}/_redirects, loading-spinner check, and route content expectations passed.`)
