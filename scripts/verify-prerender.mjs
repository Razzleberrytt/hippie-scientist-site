#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { getPrerenderPlan } from './prerender-routes.mjs'

const DIST = path.resolve(process.cwd(), 'dist')
const { routes, metadata } = getPrerenderPlan()

function hasHtml(route) {
  if (route === '/') {
    return fs.existsSync(path.join(DIST, 'index.html'))
  }

  const clean = route.replace(/^\/+|\/+$/g, '')
  return (
    fs.existsSync(path.join(DIST, clean, 'index.html')) || fs.existsSync(path.join(DIST, `${clean}.html`))
  )
}

const missing = routes.filter(route => !hasHtml(route))

if (missing.length > 0) {
  console.error(`[verify-prerender] Missing ${missing.length} prerendered route(s).`)
  missing.slice(0, 20).forEach(route => console.error(` - ${route}`))
  if (missing.length > 20) {
    console.error(` ...and ${missing.length - 20} more`)
  }
  process.exit(1)
}

console.log(
  `[verify-prerender] OK: ${routes.length} routes (${metadata.blogPosts} blog posts, ${metadata.herbRoutes} herbs, ${metadata.compoundRoutes} compounds).`
)
