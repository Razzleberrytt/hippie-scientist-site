#!/usr/bin/env node
/**
 * Audit the robots directive actually emitted in built herb/compound HTML.
 *
 * The existing indexability checks validate the *data* (`indexability_status`,
 * `robots`, `sitemap_included` in public/data) and the *sitemap*. Neither reads
 * the HTML that ships, so a page whose record says PUBLISH could still render
 * `noindex` — which is exactly the failure mode that shows up in Search Console
 * as "Excluded by 'noindex' tag" on a URL nobody meant to exclude.
 *
 * This reads every built profile page, extracts its robots meta, and compares it
 * against the governance decision in the record. A mismatch in either direction
 * is an error. Records that are deliberately noindexed are reported with their
 * governance reason so the noindexed set stays explainable rather than mystery.
 *
 * Usage:
 *   node scripts/ci/audit-profile-robots.mjs
 *   node scripts/ci/audit-profile-robots.mjs --json    # machine-readable summary
 */
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'out')
const reportPath = path.join(repoRoot, 'reports/profile-robots-audit.json')
const asJson = process.argv.includes('--json')

const DATASETS = [
  { kind: 'herb', segment: 'herbs', file: 'public/data/herbs.json' },
  { kind: 'compound', segment: 'compounds', file: 'public/data/compounds.json' },
]

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'))
}

/**
 * Editor-curated slugs deliberately outrank the automated governance score, so a
 * NOINDEX record that ships as indexable is expected for these — that override is
 * the entire purpose of the allowlist (see src/lib/index-allowlist.ts).
 */
function readAllowlist(exportName) {
  const source = fs.readFileSync(path.join(repoRoot, 'src/lib/index-allowlist.ts'), 'utf8')
  const block = source.match(new RegExp(`${exportName}[^=]*=\\s*\\[([\\s\\S]*?)\\]`))
  if (!block) return new Set()
  return new Set([...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1]))
}

const curated = {
  herb: readAllowlist('CURATED_INDEXABLE_HERB_SLUGS'),
  compound: readAllowlist('CURATED_INDEXABLE_COMPOUND_SLUGS'),
}

/**
 * Paths that 301 elsewhere. Their page is still exported, but it must ship
 * noindex regardless of what the record says — the canonical URL is the redirect
 * target, and Cloudflare serves the redirect before the static file anyway.
 */
const redirectSources = new Set(
  fs
    .readFileSync(path.join(repoRoot, 'public/_redirects'), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/)[0])
    .filter((source) => source.startsWith('/'))
    .map((source) => source.replace(/\/+$/, '')),
)

/**
 * Next emits robots either as `<meta name="robots" content="...">` or, when only
 * some directives are set, as separate `index`/`follow` tokens. Read the content
 * attribute and normalize; a page with no robots meta at all is indexable by
 * default, which is what `index,follow` means here.
 */
function extractRobots(html) {
  const match = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i)
  if (!match) return 'index,follow'
  return match[1]
    .toLowerCase()
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
    .join(',')
}

function extractCanonical(html) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)
  return match ? match[1] : ''
}

function isNoindex(robots) {
  return robots.split(',').includes('noindex')
}

const results = []
const errors = []

for (const { kind, segment, file } of DATASETS) {
  const records = new Map(
    readJson(file)
      .filter((record) => record && record.slug)
      .map((record) => [String(record.slug), record]),
  )

  const segmentDir = path.join(outDir, segment)
  if (!fs.existsSync(segmentDir)) {
    console.error(`[profile-robots] missing ${segment}/ in out/ — run a build first`)
    process.exit(1)
  }

  for (const entry of fs.readdirSync(segmentDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const htmlPath = path.join(segmentDir, entry.name, 'index.html')
    if (!fs.existsSync(htmlPath)) continue

    const html = fs.readFileSync(htmlPath, 'utf8')
    const robots = extractRobots(html)
    const record = records.get(entry.name)
    const status = String(record?.indexability_status || '').toUpperCase()

    const routeKey = `/${segment}/${entry.name}`
    const isRedirectSource = redirectSources.has(routeKey)
    const isCurated = curated[kind].has(entry.name)

    const row = {
      kind,
      slug: entry.name,
      route: `${routeKey}/`,
      robots,
      emittedNoindex: isNoindex(robots),
      status: status || 'UNKNOWN',
      reasons: Array.isArray(record?.indexability_reasons) ? record.indexability_reasons : [],
      canonical: extractCanonical(html),
      curated: isCurated,
      redirectSource: isRedirectSource,
    }
    results.push(row)

    // A record cleared for publication must not ship noindex, and a record held
    // back by governance must not ship as indexable — except where an explicit,
    // reviewed override says otherwise.
    if (status === 'PUBLISH' && row.emittedNoindex && !isRedirectSource) {
      errors.push(`${row.route} record is PUBLISH but HTML emits "${robots}"`)
    }
    if ((status === 'NOINDEX' || status === 'BLOCKED') && !row.emittedNoindex && !isCurated) {
      errors.push(`${row.route} record is ${status} but HTML emits "${robots}"`)
    }
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    built: results.length,
    indexable: results.filter((r) => !r.emittedNoindex).length,
    noindex: results.filter((r) => r.emittedNoindex).length,
  },
  byKind: Object.fromEntries(
    ['herb', 'compound'].map((kind) => {
      const rows = results.filter((r) => r.kind === kind)
      return [
        kind,
        {
          built: rows.length,
          indexable: rows.filter((r) => !r.emittedNoindex).length,
          noindex: rows.filter((r) => r.emittedNoindex).length,
        },
      ]
    }),
  ),
  noindexReasons: results
    .filter((r) => r.emittedNoindex)
    .reduce((acc, r) => {
      for (const reason of r.reasons.length ? r.reasons : ['no-recorded-reason']) {
        acc[reason] = (acc[reason] || 0) + 1
      }
      return acc
    }, {}),
  overrides: {
    curatedIndexedDespiteNoindexRecord: results.filter((r) => r.curated && r.status === 'NOINDEX').length,
    redirectSourcesNoindexed: results.filter((r) => r.redirectSource && r.emittedNoindex).length,
  },
  mismatches: errors,
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify({ ...summary, profiles: results }, null, 2)}\n`)

if (asJson) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  const { built, indexable, noindex } = summary.totals
  console.log(`[profile-robots] ${built} profile pages built`)
  console.log(`[profile-robots]   index,follow: ${indexable}`)
  console.log(`[profile-robots]   noindex:      ${noindex}`)
  for (const [kind, counts] of Object.entries(summary.byKind)) {
    console.log(`[profile-robots]   ${kind}s: ${counts.indexable} indexable / ${counts.built} built`)
  }
  const topReasons = Object.entries(summary.noindexReasons)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  if (topReasons.length) {
    console.log('[profile-robots] noindex reasons:')
    for (const [reason, count] of topReasons) console.log(`[profile-robots]   ${count.toString().padStart(4)}  ${reason}`)
  }
  console.log(`[profile-robots] report: reports/profile-robots-audit.json`)
}

if (errors.length) {
  console.error(`\n[profile-robots] ${errors.length} robots/governance mismatch(es):`)
  for (const error of errors.slice(0, 25)) console.error(`[profile-robots]   ${error}`)
  process.exit(1)
}

console.log('[profile-robots] OK: emitted robots matches the governance decision on every profile')
