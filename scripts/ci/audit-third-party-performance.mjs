#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const reportPath = path.join(root, 'reports/third-party-performance.json')

if (!fs.existsSync(outDir)) {
  console.error('[third-party-performance] missing out/ — run a production build first')
  process.exit(1)
}

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else if (entry.isFile() && entry.name === 'index.html') files.push(full)
  }
  return files
}

function routeFromFile(file) {
  const rel = path.relative(outDir, file).split(path.sep).join('/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/index\.html$/, '')}`
}

const allowedThirdPartyHosts = new Set([
  'www.googletagmanager.com',
  'analytics.ahrefs.com',
  'static.cloudflareinsights.com',
  'challenges.cloudflare.com',
])

const pages = []
const errors = []
const warnings = []
const hostCounts = new Map()

for (const file of walk(outDir)) {
  const html = fs.readFileSync(file, 'utf8')
  const route = routeFromFile(file)
  const thirdPartyScripts = []
  const images = []

  for (const match of html.matchAll(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>/gi)) {
    const attrs = `${match[1]} ${match[3]}`
    const src = match[2]
    let url
    try { url = new URL(src, 'https://thehippiescientist.net') } catch { continue }
    if (url.hostname === 'thehippiescientist.net') continue

    const deferred = /\b(?:async|defer)\b/i.test(attrs)
    const host = url.hostname
    hostCounts.set(host, (hostCounts.get(host) || 0) + 1)
    thirdPartyScripts.push({ host, src, deferred })

    if (!allowedThirdPartyHosts.has(host)) {
      errors.push(`${route} loads unapproved third-party script host ${host}`)
    }
    if (!deferred && host !== 'challenges.cloudflare.com') {
      errors.push(`${route} loads ${host} without async/defer`)
    }
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = match[1]
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1] || ''
    const hasWidth = /\bwidth=["'][^"']+["']/i.test(attrs)
    const hasHeight = /\bheight=["'][^"']+["']/i.test(attrs)
    const lazy = /\bloading=["']lazy["']/i.test(attrs)
    images.push({ src, hasWidth, hasHeight, lazy })
    if (src && (!hasWidth || !hasHeight)) {
      warnings.push(`${route} image ${src} lacks explicit width/height in emitted HTML`)
    }
  }

  pages.push({ route, thirdPartyScripts, imageCount: images.length })
}

const sourceAudits = [
  'src/lib/loadAnalytics.ts',
  'components',
  'src/components',
]

const scriptSignals = []
function scanSource(target) {
  const full = path.join(root, target)
  if (!fs.existsSync(full)) return
  const entries = fs.statSync(full).isDirectory() ? walkSource(full) : [full]
  for (const file of entries) {
    const text = fs.readFileSync(file, 'utf8')
    if (!/(googletagmanager|analytics\.ahrefs|cloudflareinsights|challenges\.cloudflare|mailchimp|newsletter)/i.test(text)) continue
    scriptSignals.push(path.relative(root, file).split(path.sep).join('/'))
  }
}
function walkSource(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkSource(full))
    else if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name)) out.push(full)
  }
  return out
}
sourceAudits.forEach(scanSource)

const report = {
  generatedAt: new Date().toISOString(),
  pageCount: pages.length,
  thirdPartyHosts: Object.fromEntries([...hostCounts].sort(([a], [b]) => a.localeCompare(b))),
  sourceFilesWithThirdPartyOrNewsletterSignals: [...new Set(scriptSignals)].sort(),
  warningCount: warnings.length,
  warnings: warnings.slice(0, 200),
  errors,
  pages: pages.filter((page) => page.thirdPartyScripts.length),
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`[third-party-performance] audited ${pages.length} pages`)
console.log(`[third-party-performance] external script hosts: ${[...hostCounts.keys()].join(', ') || 'none'}`)
console.log(`[third-party-performance] image-dimension warnings: ${warnings.length}`)
console.log('[third-party-performance] report: reports/third-party-performance.json')

if (errors.length) {
  console.error(`\n[third-party-performance] ${errors.length} blocking issue(s):`)
  errors.slice(0, 50).forEach((error) => console.error(`[third-party-performance]   ${error}`))
  process.exit(1)
}

console.log('[third-party-performance] OK: third-party scripts are approved and non-blocking')
