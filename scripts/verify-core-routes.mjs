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

// Detect loading spinner in core pages — indicates data pipeline failure
const LOADING_SENTINEL = 'Loading evidence-driven research'
const spinnerCheckRoutes = ['/', '/herbs', '/compounds']
let spinnerFailures = 0

for (const route of spinnerCheckRoutes) {
  const filePath = routeToStaticPath(route)
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    if (content.includes(LOADING_SENTINEL)) {
      console.error(`[verify:core-routes] LOADING SPINNER DETECTED on ${route} — data pipeline may have produced stale or missing JSON`)
      spinnerFailures++
    }
  }
}

if (spinnerFailures > 0) {
  throw new Error(`[verify:core-routes] ${spinnerFailures} page(s) contain the loading spinner — build is not production-ready`)
}

console.log(`[verify:core-routes] Verified ${coreRoutes.length} core routes, ${staticDir}/_redirects, and loading-spinner check passed.`)
