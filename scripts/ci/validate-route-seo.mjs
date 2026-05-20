#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const exists = (p) => fs.existsSync(path.join(root, p))

const pageFiles = execSync("rg --files app -g '**/page.tsx' -g '**/page.ts' -g '**/page.jsx' -g '**/page.js'", { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
const sourceFiles = execSync("rg --files app components lib", { encoding: 'utf8' }).trim().split('\n').filter(Boolean)

const toRoute = (file) => {
  const rel = file.replace(/^app\//, '').replace(/\/page\.(tsx|ts|jsx|js)$/, '')
  if (!rel) return '/'
  return '/' + rel.split('/').filter(Boolean).filter((s) => !/^\(.*\)$/.test(s)).join('/')
}
const isDynamic = (r) => /\[[^\]]+\]/.test(r)
const hasGsp = (txt) => /export\s+(async\s+)?function\s+generateStaticParams/.test(txt) || /export\s+const\s+generateStaticParams\s*=/.test(txt) || /export\s*\{[^}]*generateStaticParams[^}]*\}/s.test(txt)

const routes = pageFiles.map((f) => ({ file: f, route: toRoute(f), dynamic: isDynamic(toRoute(f)), gsp: hasGsp(read(f)) }))
const staticRoutes = new Set(routes.filter((r) => !r.dynamic).map((r) => r.route))
const dynamicRoutes = routes.filter((r) => r.dynamic)

const errors = []
const warnings = []

for (const r of routes) {
  if (!r.route.startsWith('/')) errors.push(`Invalid route path ${r.route} from ${r.file}`)
}
for (const r of dynamicRoutes) if (!r.gsp) errors.push(`Dynamic route missing generateStaticParams: ${r.route} (${r.file})`)

if (exists('app/sitemap.ts')) {
  const sitemapText = read('app/sitemap.ts')
  const literals = [...sitemapText.matchAll(/route\('([^']+)'/g)].map((m) => m[1])
  for (const rt of literals) {
    if (rt !== '/' && !staticRoutes.has(rt)) warnings.push(`Sitemap literal route not found in static app routes: ${rt}`)
  }
} else if (!exists('public/sitemap.xml') && !exists('out/sitemap.xml')) {
  warnings.push('No sitemap source found (app/sitemap.ts, public/sitemap.xml, out/sitemap.xml).')
}

if (exists('app/robots.ts')) {
  const robotsText = read('app/robots.ts')
  if (/disallow:\s*['"]\//i.test(robotsText)) errors.push('robots.ts appears to disallow the whole site.')
}

const hrefRegexes = [/href\s*=\s*["'`]([^"'`]+)["'`]/g, /href\s*:\s*["'`]([^"'`]+)["'`]/g]
for (const sf of sourceFiles) {
  const txt = read(sf)
  for (const rx of hrefRegexes) {
    for (const m of txt.matchAll(rx)) {
      const href = m[1]
      if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue
      if (!href.startsWith('/')) continue
      if (href.includes('${')) { warnings.push(`Unresolved dynamic href in ${sf}: ${href}`); continue }
      const pathOnly = href.split('?')[0].split('#')[0]
      const normalized = pathOnly.replace(/\/+$/, '') || '/'
      const existsStatic = staticRoutes.has(normalized)
      const matchesDynamic = dynamicRoutes.some((d) => {
        const re = new RegExp('^' + d.route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\[[^\]]+\\\]/g, '[^/]+') + '$')
        return re.test(normalized)
      })
      if (!existsStatic && !matchesDynamic) warnings.push(`Broken internal href ${href} in ${sf}`)
    }
  }
}

for (const doc of ['README.md', 'SPEC.md', 'AGENTS.md']) {
  if (!exists(doc)) continue
  const txt = read(doc)
  for (const m of txt.matchAll(/`(\/[a-zA-Z0-9_\-/[\]:*]+)`/g)) {
    const raw = m[1]
    if (raw.includes(':') || raw.includes('*') || raw.includes('[')) continue
    const route = raw.replace(/\/+$/, '') || '/'
    if (!staticRoutes.has(route) && !dynamicRoutes.some((d) => route.startsWith(d.route.split('[')[0]))) {
      if (!raw.startsWith('/public/')) warnings.push(`Doc route reference may be stale in ${doc}: ${raw}`)
    }
  }
}

if (warnings.length) {
  console.log('Warnings:')
  warnings.forEach((w) => console.log(`- ${w}`))
}
if (errors.length) {
  console.error('Errors:')
  errors.forEach((e) => console.error(`- ${e}`))
  process.exit(1)
}
console.log(`validate-route-seo passed. Checked ${routes.length} app routes and ${sourceFiles.length} source files.`)
