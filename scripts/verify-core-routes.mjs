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
const appOutputRoot = path.join(repoRoot, '.next', 'server', 'app')

function routeToBuildPath(route) {
  if (route === '/') return path.join(appOutputRoot, 'page.js')
  return path.join(appOutputRoot, route.replace(/^\//, ''), 'page.js')
}

function assertExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[verify:core-routes] Missing ${label}: ${path.relative(repoRoot, filePath)}`)
  }
}

for (const route of coreRoutes) {
  assertExists(routeToBuildPath(route), `build output for route ${route}`)
}

assertExists(path.join(repoRoot, 'public', '_redirects'), 'Cloudflare fallback redirects file')

console.log(`[verify:core-routes] Verified ${coreRoutes.length} core routes and public/_redirects.`)
