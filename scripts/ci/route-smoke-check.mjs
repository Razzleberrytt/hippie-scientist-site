#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.resolve(process.env.STATIC_OUTPUT_DIR || 'out')
const REQUIRED_ROUTES = ['/', '/herbs', '/compounds', '/build', '/blog', '/learning', '/about', '/contact', '/privacy', '/disclaimer']

function routeToIndex(route) {
  if (route === '/') return path.join(OUT_DIR, 'index.html')
  return path.join(OUT_DIR, route.replace(/^\//, ''), 'index.html')
}

const missing = REQUIRED_ROUTES
  .map(route => ({ route, file: routeToIndex(route) }))
  .filter(entry => !fs.existsSync(entry.file))

if (!fs.existsSync(path.join(OUT_DIR, '_redirects'))) {
  missing.push({ route: '_redirects', file: path.join(OUT_DIR, '_redirects') })
}

if (missing.length > 0) {
  for (const entry of missing) {
    console.error(`[route-smoke-check] Missing output for ${entry.route}: ${entry.file}`)
  }
  process.exit(1)
}

console.log('[route-smoke-check] OK')
