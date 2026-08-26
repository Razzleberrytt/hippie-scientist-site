#!/usr/bin/env node

/**
 * Rewrite internal HTML links that point at exact redirect sources so crawlers
 * discover the final canonical destination directly.
 *
 * Redirects remain in place for legacy/external traffic. This only repairs the
 * links emitted by the static export, avoiding needless redirect hops and the
 * Search Console "Page with redirect" noise caused by our own navigation.
 */

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const redirectsPath = path.join(outDir, '_redirects')
const reportPath = path.join(root, 'ops', 'reports', 'canonicalized-internal-redirect-links.json')

function normalizeRoute(value) {
  const clean = String(value || '').split(/[?#]/)[0].trim()
  if (!clean.startsWith('/')) return null
  const normalized = clean.length > 1 ? clean.replace(/\/+$/, '') : '/'
  return normalized || '/'
}

function parseExactRedirects() {
  if (!fs.existsSync(redirectsPath)) {
    throw new Error('Missing out/_redirects. Run redirect generation before canonicalizing internal links.')
  }

  const map = new Map()
  for (const rawLine of fs.readFileSync(redirectsPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const [sourceRaw, targetRaw, statusRaw] = line.split(/\s+/)
    if (!sourceRaw || !targetRaw || !/^30[1278]$/.test(statusRaw || '')) continue
    if (/[*:]/.test(sourceRaw) || !targetRaw.startsWith('/')) continue

    const source = normalizeRoute(sourceRaw)
    const target = normalizeRoute(targetRaw)
    if (!source || !target || source === target) continue
    map.set(source, target)
  }
  return map
}

function resolveFinalTarget(route, redirects) {
  let current = route
  const seen = new Set([current])
  for (let hop = 0; hop < 10; hop += 1) {
    const next = redirects.get(current)
    if (!next || seen.has(next)) break
    current = next
    seen.add(current)
  }
  return current
}

function preserveSuffix(original, finalTarget) {
  const suffixMatch = original.match(/([?#].*)$/)
  const suffix = suffixMatch ? suffixMatch[1] : ''
  const lastSegment = finalTarget.split('/').filter(Boolean).pop() || ''
  const isFileLike = lastSegment.includes('.')
  const target = finalTarget === '/' || isFileLike ? finalTarget : `${finalTarget}/`
  return `${target}${suffix}`
}

const redirects = parseExactRedirects()
let filesChanged = 0
let linksRewritten = 0
const byRedirect = new Map()

const hrefPattern = /href=(['"])(\/[^'"\s>]*)\1/gi

for (const filePath of walkHtml(outDir)) {
  const original = fs.readFileSync(filePath, 'utf8')
  let changedInFile = 0

  const rewritten = original.replace(hrefPattern, (full, quote, href) => {
    const route = normalizeRoute(href)
    if (!route || !redirects.has(route)) return full

    const finalTarget = resolveFinalTarget(route, redirects)
    if (finalTarget === route) return full

    changedInFile += 1
    linksRewritten += 1
    const key = `${route} -> ${finalTarget}`
    byRedirect.set(key, (byRedirect.get(key) || 0) + 1)
    return `href=${quote}${preserveSuffix(href, finalTarget)}${quote}`
  })

  if (changedInFile > 0 && rewritten !== original) {
    fs.writeFileSync(filePath, rewritten)
    filesChanged += 1
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  redirectsConsidered: redirects.size,
  filesChanged,
  linksRewritten,
  summary: [...byRedirect.entries()]
    .map(([redirect, count]) => ({ redirect, count }))
    .sort((a, b) => b.count - a.count || a.redirect.localeCompare(b.redirect)),
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(
  `[canonicalize-internal-redirect-links] PASS: rewrote ${linksRewritten} link(s) across ${filesChanged} HTML file(s).`,
)

function* walkHtml(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_next' || entry.name === 'pagefind') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walkHtml(fullPath)
    else if (entry.isFile() && entry.name.endsWith('.html')) yield fullPath
  }
}
