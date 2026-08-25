#!/usr/bin/env node
/**
 * Reconcile the publication truth that actually ships for every herb and compound.
 *
 * Governance data remains the decision source. This post-build audit reads final
 * HTML, redirects, and sitemap output, writes one operator-facing artifact, and
 * fails when those final surfaces disagree.
 *
 * Usage:
 *   node scripts/ci/audit-profile-robots.mjs
 *   node scripts/ci/audit-profile-robots.mjs --json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'out')
const reportPath = path.join(repoRoot, 'reports/profile-publication-truth.json')
const asJson = process.argv.includes('--json')

const DATASETS = [
  { kind: 'herb', segment: 'herbs', file: 'public/data/herbs.json' },
  { kind: 'compound', segment: 'compounds', file: 'public/data/compounds.json' },
]

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'))
}

function readAllowlist(exportName) {
  const source = fs.readFileSync(path.join(repoRoot, 'src/lib/index-allowlist.ts'), 'utf8')
  const block = source.match(new RegExp(exportName + '[^=]*=\\s*\\[([\\s\\S]*?)\\]'))
  if (!block) return new Set()
  return new Set([...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1]))
}

function normalizeRoute(value) {
  if (!value) return ''
  try {
    const parsed = new URL(value, 'https://thehippiescientist.net')
    const pathname = parsed.pathname.replace(/\/{2,}/g, '/')
    return pathname === '/' ? '/' : pathname.replace(/\/+$/, '') + '/'
  } catch {
    return ''
  }
}

export function parseSitemapProfileRoutes(xml) {
  const routes = new Set()
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const route = normalizeRoute(match[1])
    if (/^\/(?:herbs|compounds)\/[^/]+\/$/.test(route)) routes.add(route)
  }
  return routes
}

export function finalizePublicationRow(row, sitemapRoutes) {
  const route = normalizeRoute(row.route)
  const canonicalRoute = normalizeRoute(row.canonical)
  const canonicalMatches = canonicalRoute === route
  const sitemapIncluded = sitemapRoutes.has(route)
  const sitemapEligible = !row.emittedNoindex && !row.redirectSource && canonicalMatches

  let publicationReason
  if (row.redirectSource) {
    publicationReason = 'redirect-source'
  } else if (row.emittedNoindex) {
    publicationReason = row.reasons.length
      ? 'governance:' + row.reasons.join(' | ')
      : 'rendered-noindex-without-recorded-reason'
  } else if (!canonicalRoute) {
    publicationReason = 'missing-canonical'
  } else if (!canonicalMatches) {
    publicationReason = 'canonicalized-to:' + canonicalRoute
  } else if (sitemapIncluded) {
    publicationReason = 'published'
  } else {
    publicationReason = 'indexable-html-missing-from-sitemap'
  }

  return {
    ...row,
    finalRobots: row.robots,
    canonicalRoute,
    canonicalMatches,
    sitemapEligible,
    sitemapIncluded,
    publicationReason,
    parity: sitemapEligible === sitemapIncluded,
  }
}

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

function run() {
  const builtRedirectsPath = path.join(outDir, '_redirects')
  const sitemapPath = path.join(outDir, 'sitemap.xml')

  if (!fs.existsSync(builtRedirectsPath)) {
    console.error('[profile-publication] missing out/_redirects — run the production build first')
    process.exit(1)
  }
  if (!fs.existsSync(sitemapPath)) {
    console.error('[profile-publication] missing out/sitemap.xml — run the production build first')
    process.exit(1)
  }

  const curated = {
    herb: readAllowlist('CURATED_INDEXABLE_HERB_SLUGS'),
    compound: readAllowlist('CURATED_INDEXABLE_COMPOUND_SLUGS'),
  }

  const redirectSources = new Set(
    fs
      .readFileSync(builtRedirectsPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split(/\s+/)[0])
      .filter((source) => source.startsWith('/'))
      .map((source) => source.replace(/\/+$/, '')),
  )

  const sitemapRoutes = parseSitemapProfileRoutes(fs.readFileSync(sitemapPath, 'utf8'))
  const baseRows = []
  const errors = []

  for (const { kind, segment, file } of DATASETS) {
    const records = new Map(
      readJson(file)
        .filter((record) => record && record.slug)
        .map((record) => [String(record.slug), record]),
    )

    const segmentDir = path.join(outDir, segment)
    if (!fs.existsSync(segmentDir)) {
      console.error('[profile-publication] missing ' + segment + '/ in out/ — run a build first')
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
      const routeKey = '/' + segment + '/' + entry.name
      const redirectSource = redirectSources.has(routeKey)
      const isCurated = curated[kind].has(entry.name)

      const row = {
        kind,
        slug: entry.name,
        route: routeKey + '/',
        robots,
        emittedNoindex: isNoindex(robots),
        status: status || 'UNKNOWN',
        reasons: Array.isArray(record?.indexability_reasons) ? record.indexability_reasons : [],
        canonical: extractCanonical(html),
        curated: isCurated,
        redirectSource,
        recordPresent: Boolean(record),
      }
      baseRows.push(row)
      if (status === 'PUBLISH' && row.emittedNoindex && !redirectSource) {
        errors.push(row.route + ' record is PUBLISH but HTML emits "' + robots + '"')
      }
      if ((status === 'NOINDEX' || status === 'BLOCKED') && !row.emittedNoindex && !isCurated) {
        errors.push(row.route + ' record is ' + status + ' but HTML emits "' + robots + '"')
      }
    }
  }

  const profiles = baseRows
    .map((row) => finalizePublicationRow(row, sitemapRoutes))
    .sort((a, b) => a.route.localeCompare(b.route))
  const builtRoutes = new Set(profiles.map((row) => row.route))

  for (const row of profiles) {
    if (!row.parity) {
      errors.push(
        row.route + ' sitemap parity failed: eligible=' + row.sitemapEligible +
        ' included=' + row.sitemapIncluded + ' reason=' + row.publicationReason,
      )
    }
  }
  for (const route of [...sitemapRoutes].sort()) {
    if (!builtRoutes.has(route)) errors.push(route + ' appears in sitemap but has no built profile artifact')
  }

  const totalsFor = (rows) => ({
    built: rows.length,
    indexableRobots: rows.filter((row) => !row.emittedNoindex).length,
    sitemapEligible: rows.filter((row) => row.sitemapEligible).length,
    sitemapIncluded: rows.filter((row) => row.sitemapIncluded).length,
    noindex: rows.filter((row) => row.emittedNoindex).length,
  })

  const summary = {
    generatedAt: new Date().toISOString(),
    source: {
      governance: 'public/data/{herbs,compounds}.json',
      html: 'out/{herbs,compounds}/*/index.html',
      redirects: 'out/_redirects',
      sitemap: 'out/sitemap.xml',
    },
    totals: totalsFor(profiles),
    byKind: Object.fromEntries(
      ['herb', 'compound'].map((kind) => [kind, totalsFor(profiles.filter((row) => row.kind === kind))]),
    ),
    reasons: profiles.reduce((acc, row) => {
      acc[row.publicationReason] = (acc[row.publicationReason] || 0) + 1
      return acc
    }, {}),
    overrides: {
      curatedIndexedDespiteNoindexRecord: profiles.filter(
        (row) => row.curated && row.status === 'NOINDEX',
      ).length,
      redirectSourcesNoindexed: profiles.filter(
        (row) => row.redirectSource && row.emittedNoindex,
      ).length,
    },
    mismatches: errors,
    profiles,
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2) + '\n')

  if (asJson) {
    const { profiles: _profiles, ...summaryOnly } = summary
    console.log(JSON.stringify(summaryOnly, null, 2))
  } else {
    console.log('[profile-publication] ' + summary.totals.built + ' profile pages reconciled')
    console.log('[profile-publication]   sitemap eligible: ' + summary.totals.sitemapEligible)
    console.log('[profile-publication]   sitemap included: ' + summary.totals.sitemapIncluded)
    console.log('[profile-publication]   noindex:          ' + summary.totals.noindex)
    for (const [kind, counts] of Object.entries(summary.byKind)) {
      console.log(
        '[profile-publication]   ' + kind + 's: ' + counts.sitemapIncluded +
        ' in sitemap / ' + counts.built + ' built',
      )
    }
    console.log('[profile-publication] report: reports/profile-publication-truth.json')
  }

  if (errors.length) {
    console.error('\n[profile-publication] ' + errors.length + ' mismatch(es):')
    for (const error of errors.slice(0, 50)) console.error('[profile-publication]   ' + error)
    process.exit(1)
  }

  console.log('[profile-publication] OK: final HTML, redirects, sitemap, and governance agree')
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) run()
