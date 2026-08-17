#!/usr/bin/env node
/**
 * THS-177 — a redirected route must not also ship an indexable page.
 *
 * `public/_redirects` 301s a route at the CDN edge, but the static export can
 * still contain a full page at that same path. When it does, one piece of
 * content exists at two URLs, each declaring itself canonical, and the only
 * thing preventing duplicate indexation is the edge rule firing every time.
 *
 * Seven legacy routes are in that state today. Each is a real decision — either
 * the redirect is stale and the page should be reachable, or the page is
 * orphaned and should stop building — and both answers are editorial rather
 * than mechanical, so this does not pick one. It records them as a baseline and
 * fails on anything new, so the list can only shrink.
 *
 * Requires a build. Without `out/` there is nothing to check and the audit
 * skips rather than reporting a false all-clear.
 *
 * Usage: node scripts/ci/validate-redirect-indexability.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'out')
const REDIRECTS = path.join(ROOT, 'public', '_redirects')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'redirect-indexability.json')

/**
 * Known conflicts awaiting an editorial decision on which URL owns the content.
 * Keyed by redirect source. Removing an entry here is the goal; adding one
 * requires deciding this duplicate is acceptable, which it generally is not.
 */
const BASELINE = new Set([
  '/articles/ashwagandha',
  '/articles/l-theanine',
  '/best-supplements-for-adhd',
  '/magnesium-for-adhd',
  '/l-theanine-for-adhd',
  '/citicoline-vs-alpha-gpc',
  '/omega-3-for-adhd',
])

function parseRedirects() {
  if (!fs.existsSync(REDIRECTS)) return []
  return fs
    .readFileSync(REDIRECTS, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [source, destination, status] = line.split(/\s+/)
      return { source, destination, status }
    })
    .filter((rule) => rule.source && rule.destination)
}

/** Trailing-slash normalization is not a duplicate; it is the same page. */
function isSlashNormalization(rule) {
  return rule.source.replace(/\/+$/, '') === rule.destination.replace(/\/+$/, '')
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.log('[redirect-indexability] SKIPPED — no out/ directory; run a build first.')
    return
  }

  const violations = []
  for (const rule of parseRedirects()) {
    // Wildcard and placeholder rules do not map to one built path.
    if (rule.source.includes('*') || rule.source.includes(':')) continue
    if (isSlashNormalization(rule)) continue

    const relative = rule.source.replace(/^\/+|\/+$/g, '')
    if (!relative) continue
    const file = path.join(OUT_DIR, relative, 'index.html')
    if (!fs.existsSync(file)) continue

    const html = fs.readFileSync(file, 'utf8')
    // An error page is not indexable content, and an explicit noindex already
    // resolves the duplicate.
    if (html.includes('__next_error__')) continue
    if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html)) continue

    const canonical = (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) ?? [])[1] ?? ''
    violations.push({
      source: rule.source,
      destination: rule.destination,
      status: rule.status ?? '',
      canonical,
      // A page canonicalising to itself while redirecting elsewhere is the
      // clearest form of the conflict.
      selfCanonical: canonical.replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '') === rule.source.replace(/\/+$/, ''),
      known: BASELINE.has(rule.source.replace(/\/+$/, '')),
    })
  }

  const unknown = violations.filter((v) => !v.known)
  const known = violations.filter((v) => v.known)

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), total: violations.length, known: known.length, unknown: unknown.length, violations }, null, 2)}\n`,
  )

  console.log('\nRedirect indexability')
  console.log('='.repeat(66))
  console.log(`Redirected routes that also build an indexable page  ${violations.length}`)
  console.log(`  known, awaiting an editorial decision              ${known.length}`)
  console.log(`  new                                                ${unknown.length}`)
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (!unknown.length) {
    if (known.length) {
      console.log('\nNo new duplicates. The known list is in BASELINE in this file;')
      console.log('each needs a decision on whether the redirect or the page should win.')
    }
    return
  }

  console.error(`\n[redirect-indexability] FAILED — ${unknown.length} route(s) redirect but still ship an indexable page.\n`)
  for (const v of unknown) {
    console.error(`  ${v.source}  ->  ${v.destination} (${v.status})`)
    console.error(`      page canonical: ${v.canonical || '(none)'}${v.selfCanonical ? '  <- canonicalises to itself' : ''}`)
  }
  console.error('\nEither drop the redirect so the page is reachable, or stop building the')
  console.error('page so the redirect is the only answer. Two live URLs for one page split')
  console.error('their own ranking signals.')
  process.exit(1)
}

main()
