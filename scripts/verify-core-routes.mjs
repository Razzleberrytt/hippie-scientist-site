#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const coreRoutes = [
  '/',
  '/herbs',
  '/compounds',
  '/build',
  '/blog',
  '/learning',
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

assertExists(path.join(staticOutputRoot, '_redirects'), 'Cloudflare fallback redirects file')

console.log(`[verify:core-routes] Verified ${coreRoutes.length} core routes and ${staticDir}/_redirects.`)
