#!/usr/bin/env node
/**
 * seo:triage-404 — turn a Search Console "Not found (404)" export into curated
 * redirect rules.
 *
 * Google Search Console reported 1,995 404s and 734 redirect-excluded URLs
 * against a site that publishes ~780 indexable pages. Most of Googlebot's crawl
 * budget is being spent on URLs that no longer exist, which is why fresh content
 * is slow to be discovered. The existing recovery workflow is manual — see
 * public/redirect-overrides/020-gsc-404-recovery-2026-08-27.txt, which mapped 58
 * paths by hand — and does not scale to two thousand URLs.
 *
 * This script does the mechanical part: match each dead URL against the routes
 * that actually build, and emit a redirect-override file for the matches plus a
 * review queue for the near-misses. A human still approves the output; nothing
 * here writes to public/_redirects.
 *
 * IMPORTANT — unmatched URLs are left as 404 on purpose. Bulk-redirecting
 * unrelated dead URLs to a hub page is treated by Google as a soft 404 and is
 * worse than the 404 it replaces: it burns the same crawl budget, dilutes the
 * hub's relevance, and can suppress the hub itself. A 404 for a page that
 * genuinely no longer exists is the correct, healthy answer. Only redirect when
 * there is a real equivalent.
 *
 * Usage:
 *   node scripts/seo/triage-404-export.mjs --input=<export.csv> [options]
 *
 *   --input=<path>     GSC export (CSV/TSV) or a plain newline-delimited URL
 *                      list. The first column that looks like a URL or path is
 *                      used, so the standard "URL,Last crawled" export works
 *                      as-is.
 *   --routes=<dir>     Directory of built output to read live routes from.
 *                      Defaults to ./out when present, otherwise falls back to
 *                      public/data/runtime-manifests/route-manifest.json.
 *   --out=<path>       Redirect-override file to write for confident matches.
 *                      Defaults to ops/seo/404-triage-redirects.txt
 *   --review=<path>    TSV review queue for low-confidence matches.
 *                      Defaults to ops/seo/404-triage-review.tsv
 *   --json=<path>      Machine-readable full report.
 *                      Defaults to ops/seo/404-triage-report.json
 *   --apply            Also copy the confident rules into
 *                      public/redirect-overrides/ so the next build picks them
 *                      up. Off by default: review the file first.
 */

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = process.cwd()
const SITE_HOSTS = new Set(['thehippiescientist.net', 'www.thehippiescientist.net'])

function arg(name, fallback = null) {
  const hit = process.argv.find((value) => value.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}
const hasFlag = (name) => process.argv.includes(`--${name}`)

// ---------------------------------------------------------------------------
// Path normalization
// ---------------------------------------------------------------------------

// The site sets trailingSlash: true, so the canonical form of every page path
// ends in a slash. Compare on a slashless, lowercased, percent-decoded key so
// that /Compounds/Artichoke%20Extract and /compounds/artichoke-extract/ collapse
// to the same thing.
function toPath(raw) {
  const value = String(raw ?? '').trim().replace(/^["']|["']$/g, '')
  if (!value) return null
  let pathname = value
  if (/^https?:\/\//i.test(value)) {
    let url
    try {
      url = new URL(value)
    } catch {
      return null
    }
    if (!SITE_HOSTS.has(url.hostname.toLowerCase())) return null
    pathname = url.pathname
  }
  if (!pathname.startsWith('/')) return null
  return pathname
}

function decodePath(pathname) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

function canonical(pathname) {
  if (!pathname) return null
  const [bare] = pathname.split(/[?#]/)
  const trimmed = bare.replace(/\/+$/, '')
  return trimmed === '' ? '/' : `${trimmed}/`
}

function matchKey(pathname) {
  const decoded = decodePath(canonical(pathname) ?? '')
  return decoded
    .toLowerCase()
    .replace(/\/+$/, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-{2,}/g, '-')
}

const lastSegment = (key) => key.split('/').filter(Boolean).pop() ?? ''

// ---------------------------------------------------------------------------
// Live routes
// ---------------------------------------------------------------------------

function liveRoutesFromBuild(dir) {
  const routes = new Set()
  const walk = (current, rel) => {
    let entries
    try {
      entries = fs.readdirSync(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.name === '_next' || entry.name === 'pagefind') continue
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) walk(full, `${rel}/${entry.name}`)
      else if (entry.name === 'index.html') routes.add(rel === '' ? '/' : `${rel}/`)
    }
  }
  walk(dir, '')
  return routes
}

function liveRoutesFromManifest() {
  const manifestPath = path.join(ROOT, 'public', 'data', 'runtime-manifests', 'route-manifest.json')
  if (!fs.existsSync(manifestPath)) return null
  const rows = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const routes = new Set()
  for (const row of rows) {
    const route = canonical(row?.route ?? row?.path ?? '')
    if (route) routes.add(route)
  }
  return routes
}

// ---------------------------------------------------------------------------
// Rules already in place
// ---------------------------------------------------------------------------

function existingRedirectSources() {
  const sources = new Set()
  const ingest = (text) => {
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const from = trimmed.split(/\s+/)[0]
      const asPath = toPath(from)
      if (asPath) sources.add(matchKey(asPath))
    }
  }
  const redirectsPath = path.join(ROOT, 'public', '_redirects')
  if (fs.existsSync(redirectsPath)) ingest(fs.readFileSync(redirectsPath, 'utf8'))
  const overridesDir = path.join(ROOT, 'public', 'redirect-overrides')
  if (fs.existsSync(overridesDir)) {
    for (const file of fs.readdirSync(overridesDir)) {
      if (!/\.(txt|redirects)$/i.test(file)) continue
      ingest(fs.readFileSync(path.join(overridesDir, file), 'utf8'))
    }
  }
  return sources
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const carry = prev[j]
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      diagonal = carry
    }
  }
  return prev[b.length]
}

function buildIndex(routes) {
  const byKey = new Map()
  const bySegment = new Map()
  for (const route of routes) {
    const key = matchKey(route)
    byKey.set(key, route)
    const segment = lastSegment(key)
    if (!segment) continue
    if (!bySegment.has(segment)) bySegment.set(segment, [])
    bySegment.get(segment).push(route)
  }
  return { byKey, bySegment }
}

const sectionOf = (key) => key.split('/').filter(Boolean)[0] ?? ''

function classify(deadPath, index) {
  const key = matchKey(deadPath)
  const segment = lastSegment(key)
  const section = sectionOf(key)

  // 0. The canonical form of this URL is already a live page, so the export
  //    entry was a slash/case/encoding variant rather than a missing page.
  //    Emitting a rule here would point the path at itself — an infinite
  //    redirect. Cloudflare already canonicalizes the slash, so there is
  //    nothing to write.
  const exact = index.byKey.get(key)
  if (exact) {
    if (matchKey(exact) === key && canonical(deadPath) === exact) {
      return { target: exact, confidence: 'already-live', reason: 'canonical form of this URL is already a live page' }
    }
    return { target: exact, confidence: 'exact', reason: 'live route differs only by slash/case/encoding' }
  }

  if (!segment) return { target: null, confidence: 'none', reason: 'no usable path segment' }

  const moved = index.bySegment.get(segment) ?? []

  // 1. The same slug lives at exactly one other path — the shape left behind by
  //    a section rename (/articles/x -> /guides/adhd/x).
  if (moved.length === 1) {
    return { target: moved[0], confidence: 'slug-moved', reason: `slug "${segment}" is live at a different path` }
  }

  // 2. The slug exists in several sections. Prefer a section that is itself a
  //    near-miss of the dead one, which is how singular/plural renames look
  //    (/herb/ashwagandha -> /herbs/ashwagandha). Anything less clear-cut goes
  //    to review rather than guessing between eight locales.
  if (moved.length > 1) {
    const sectionMatches = moved.filter((route) => editDistance(section, sectionOf(matchKey(route))) <= 1)
    if (sectionMatches.length === 1) {
      return {
        target: sectionMatches[0],
        confidence: 'slug-moved',
        reason: `section "${section}" renamed to "${sectionOf(matchKey(sectionMatches[0]))}"`,
      }
    }
    return {
      target: null,
      confidence: 'ambiguous',
      reason: `slug "${segment}" matches ${moved.length} live routes: ${moved.slice(0, 4).join(', ')}`,
    }
  }

  // 3. Near-miss slug, restricted to routes in the same section so a typo fix
  //    cannot turn into an unrelated redirect. Uniqueness is judged within the
  //    section, because a slug like "ashwagandha" legitimately exists in every
  //    locale and would otherwise never qualify.
  const inSection = new Map()
  for (const [candidateSegment, routes] of index.bySegment) {
    const sameSection = routes.filter((route) => sectionOf(matchKey(route)) === section)
    if (sameSection.length === 1) inSection.set(candidateSegment, sameSection[0])
  }
  let best = null
  for (const [candidateSegment, route] of inSection) {
    const distance = editDistance(segment, candidateSegment)
    if (distance <= 2 && (!best || distance < best.distance)) {
      best = { distance, route, candidateSegment }
    }
  }
  if (best) {
    return {
      target: best.route,
      confidence: 'near-miss',
      reason: `slug "${segment}" is ${best.distance} edit(s) from live "${best.candidateSegment}"`,
    }
  }

  return { target: null, confidence: 'none', reason: 'no live equivalent — leave as 404' }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function readInputPaths(inputPath) {
  const text = fs.readFileSync(inputPath, 'utf8')
  const seen = new Set()
  const paths = []
  for (const [lineNumber, line] of text.split(/\r?\n/).entries()) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // Header rows from the GSC export.
    if (lineNumber === 0 && /^"?url"?\s*[,\t]/i.test(trimmed)) continue
    let candidate = null
    for (const cell of trimmed.split(/[,\t]/)) {
      candidate = toPath(cell)
      if (candidate) break
    }
    if (!candidate) continue
    const key = matchKey(candidate)
    if (seen.has(key)) continue
    seen.add(key)
    paths.push(canonical(candidate))
  }
  return paths
}

function main() {
  const inputPath = arg('input')
  if (!inputPath) {
    console.error('usage: node scripts/seo/triage-404-export.mjs --input=<gsc-export.csv> [--routes=out] [--apply]')
    console.error('Export the "Not found (404)" table from Search Console → Page indexing → EXPORT.')
    process.exit(2)
  }
  if (!fs.existsSync(inputPath)) {
    console.error(`[404-triage] input not found: ${inputPath}`)
    process.exit(1)
  }

  const routesDir = arg('routes', fs.existsSync(path.join(ROOT, 'out')) ? path.join(ROOT, 'out') : null)
  let routes
  let routeSource
  if (routesDir && fs.existsSync(routesDir)) {
    routes = liveRoutesFromBuild(routesDir)
    routeSource = path.relative(ROOT, routesDir) || routesDir
  } else {
    routes = liveRoutesFromManifest()
    routeSource = 'public/data/runtime-manifests/route-manifest.json'
    if (!routes) {
      console.error('[404-triage] no built output and no route manifest — run `npm run build` first')
      process.exit(1)
    }
    console.warn('[404-triage] WARNING: using the committed route manifest, which can be stale.')
    console.warn('[404-triage] Run `npm run build` and re-run against out/ before trusting the output.')
  }

  const index = buildIndex(routes)
  const alreadyHandled = existingRedirectSources()
  const deadPaths = readInputPaths(inputPath)

  const buckets = { exact: [], 'slug-moved': [], 'near-miss': [], ambiguous: [], none: [], 'already-redirected': [], 'already-live': [] }
  for (const deadPath of deadPaths) {
    if (alreadyHandled.has(matchKey(deadPath))) {
      buckets['already-redirected'].push({ from: deadPath, to: null, reason: 'a redirect rule already covers this path' })
      continue
    }
    const verdict = classify(deadPath, index)
    buckets[verdict.confidence].push({ from: deadPath, to: verdict.target, reason: verdict.reason })
  }

  const confident = [...buckets.exact, ...buckets['slug-moved']]
  const review = [...buckets['near-miss'], ...buckets.ambiguous]

  const outPath = path.resolve(ROOT, arg('out', 'ops/seo/404-triage-redirects.txt'))
  const reviewPath = path.resolve(ROOT, arg('review', 'ops/seo/404-triage-review.tsv'))
  const jsonPath = path.resolve(ROOT, arg('json', 'ops/seo/404-triage-report.json'))
  for (const target of [outPath, reviewPath, jsonPath]) fs.mkdirSync(path.dirname(target), { recursive: true })

  const header = [
    '# Generated by scripts/seo/triage-404-export.mjs — review before shipping.',
    `# Source export: ${path.relative(ROOT, path.resolve(inputPath)) || inputPath}`,
    `# Live routes read from: ${routeSource} (${routes.size} routes)`,
    '#',
    '# Only exact and slug-moved matches are included. Near-misses and ambiguous',
    '# slugs are in the review queue; URLs with no live equivalent are deliberately',
    '# left as 404 rather than redirected to a hub, which Google treats as a soft 404.',
    '',
  ]
  const body = confident.map((row) => `${row.from} ${row.to} 301`)
  fs.writeFileSync(outPath, `${[...header, ...body].join('\n')}\n`, 'utf8')

  const reviewRows = ['from\tsuggested_to\tconfidence\treason']
  for (const row of buckets['near-miss']) reviewRows.push(`${row.from}\t${row.to ?? ''}\tnear-miss\t${row.reason}`)
  for (const row of buckets.ambiguous) reviewRows.push(`${row.from}\t\tambiguous\t${row.reason}`)
  for (const row of buckets.none) reviewRows.push(`${row.from}\t\tno-match\t${row.reason}`)
  fs.writeFileSync(reviewPath, `${reviewRows.join('\n')}\n`, 'utf8')

  fs.writeFileSync(jsonPath, `${JSON.stringify({
    input: path.relative(ROOT, path.resolve(inputPath)) || inputPath,
    routeSource,
    liveRoutes: routes.size,
    totalDeadUrls: deadPaths.length,
    counts: Object.fromEntries(Object.entries(buckets).map(([name, rows]) => [name, rows.length])),
    buckets,
  }, null, 2)}\n`, 'utf8')

  const pct = (n) => (deadPaths.length ? `${((n / deadPaths.length) * 100).toFixed(1)}%` : '0%')
  console.log(`\n[404-triage] ${deadPaths.length} dead URL(s) against ${routes.size} live routes (${routeSource})\n`)
  console.log(`  exact match          ${String(buckets.exact.length).padStart(5)}  ${pct(buckets.exact.length)}`)
  console.log(`  slug moved           ${String(buckets['slug-moved'].length).padStart(5)}  ${pct(buckets['slug-moved'].length)}`)
  console.log(`  already live         ${String(buckets['already-live'].length).padStart(5)}  ${pct(buckets['already-live'].length)}   <- re-submit, do not redirect`)
  console.log(`  near miss (review)   ${String(buckets['near-miss'].length).padStart(5)}  ${pct(buckets['near-miss'].length)}`)
  console.log(`  ambiguous (review)   ${String(buckets.ambiguous.length).padStart(5)}  ${pct(buckets.ambiguous.length)}`)
  console.log(`  already redirected   ${String(buckets['already-redirected'].length).padStart(5)}  ${pct(buckets['already-redirected'].length)}`)
  console.log(`  no live equivalent   ${String(buckets.none.length).padStart(5)}  ${pct(buckets.none.length)}   <- correctly stay 404`)
  console.log(`\n  ${confident.length} rule(s) written to ${path.relative(ROOT, outPath)}`)
  console.log(`  ${review.length + buckets.none.length} row(s) to review in ${path.relative(ROOT, reviewPath)}`)
  console.log(`  full report: ${path.relative(ROOT, jsonPath)}`)

  if (hasFlag('apply')) {
    if (confident.length === 0) {
      console.log('\n[404-triage] --apply given but there is nothing confident to apply.')
    } else {
      const stamped = path.join(ROOT, 'public', 'redirect-overrides', '030-gsc-404-triage.txt')
      fs.copyFileSync(outPath, stamped)
      console.log(`\n[404-triage] applied ${confident.length} rule(s) to ${path.relative(ROOT, stamped)}`)
      console.log('[404-triage] run `npm run build` and re-check verify:postbuild before shipping.')
    }
  } else if (confident.length) {
    console.log('\n  Re-run with --apply to copy these into public/redirect-overrides/.')
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export { canonical, classify, matchKey, toPath }
