#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const VERSION_PATH = path.join(DIST, 'version.json')
const SITEMAP_PATH = path.join(DIST, 'sitemap.xml')

function findPrerenderedRoutes() {
  const routes = []

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }
      if (!entry.isFile() || entry.name !== 'index.html') continue

      const relative = path.relative(DIST, fullPath).replace(/\\/g, '/')
      const routePath = `/${relative.replace(/\/index\.html$/u, '').replace(/^index$/u, '')}`
      routes.push(routePath === '/' ? routePath : routePath.replace(/\/+$/u, ''))
    }
  }

  walk(DIST)
  return routes.sort((a, b) => a.localeCompare(b))
}

function countSitemapUrls() {
  if (!fs.existsSync(SITEMAP_PATH)) return 0
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8')
  return (xml.match(/<loc>/g) || []).length
}

function resolveCommitSha() {
  const envSha = process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA || process.env.COMMIT_SHA
  if (typeof envSha === 'string' && envSha.trim().length > 0) return envSha.trim()

  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || null
  } catch {
    return null
  }
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('[version] dist/ is missing. Run build + postbuild first.')
    process.exit(1)
  }

  const routes = findPrerenderedRoutes()
  const payload = {
    commitSha: resolveCommitSha(),
    buildTimestampIso: new Date().toISOString(),
    herbRouteCount: routes.filter(route => route.startsWith('/herbs/')).length,
    compoundRouteCount: routes.filter(route => route.startsWith('/compounds/')).length,
    blogRouteCount: routes.filter(route => route === '/blog' || route.startsWith('/blog/')).length,
    sitemapUrlCount: countSitemapUrls(),
    totalPrerenderedHtmlRouteCount: routes.length,
  }

  fs.mkdirSync(DIST, { recursive: true })
  fs.writeFileSync(VERSION_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`[version] wrote ${path.relative(ROOT, VERSION_PATH)}`)
}

main()
