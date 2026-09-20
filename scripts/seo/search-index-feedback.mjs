#!/usr/bin/env node
/**
 * Search-index feedback reconciliation.
 *
 * Joins operator-supplied search-engine observations with the read-only index
 * quality shadow report and final post-build publication truth. The result is a
 * diagnostic/prioritization report only: it never changes robots, sitemap,
 * canonicals, publication state, or scientific content.
 *
 * Usage (after the production build + shadow report):
 *   npm run build
 *   npm run audit:profile-publication
 *   node scripts/seo/index-quality-shadow.mjs
 *   node scripts/seo/search-index-feedback.mjs
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPriorityConfig } from '../enrichment-pipeline/lib/priority.mjs'

const __filename = fileURLToPath(import.meta.url)
const ROOT = path.resolve(path.dirname(__filename), '..', '..')
const INPUT = path.join(ROOT, 'data-sources', 'search-index-observations.json')
const SHADOW = path.join(ROOT, 'ops', 'reports', 'index-quality-shadow.json')
const PUBLICATION_TRUTH = path.join(ROOT, 'reports', 'profile-publication-truth.json')
const OUT = path.join(ROOT, 'out')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const JSON_OUT = path.join(REPORTS_DIR, 'search-index-feedback.json')
const MD_OUT = path.join(REPORTS_DIR, 'search-index-feedback.md')


const DIAGNOSTIC_ONLY_STATUS_WEIGHTS = Object.freeze({
  crawled_but_not_in_index: 0.8,
  duplicate_without_user_selected_canonical: 0.8,
})

function loadJson(file) {
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8'))
}

export function normalizeObservationUrl(raw) {
  const rawUrl = String(raw ?? '').trim()
  if (!rawUrl) return { rawUrl: '', url: '', query: '', hasQuery: false, observationKey: '' }
  try {
    const parsed = new URL(rawUrl, 'https://thehippiescientist.net')
    const pathname = parsed.pathname.replace(/\/+$/, '') || '/'
    const url = `https://thehippiescientist.net${pathname}${pathname === '/' ? '' : '/'}`
    const query = parsed.search || ''
    return {
      rawUrl,
      url,
      query,
      hasQuery: Boolean(query),
      observationKey: `${url}${query}`,
    }
  } catch {
    return { rawUrl, url: rawUrl, query: '', hasQuery: false, observationKey: rawUrl }
  }
}

export function crawlAgeDays(lastCrawled, observedAt) {
  const crawled = Date.parse(String(lastCrawled ?? '').trim())
  const observed = Date.parse(String(observedAt ?? '').trim())
  if (!Number.isFinite(crawled) || !Number.isFinite(observed) || crawled > observed) return null
  return Math.floor((observed - crawled) / 86_400_000)
}


function normalizeRoute(raw) {
  try {
    const parsed = new URL(String(raw ?? ''), 'https://thehippiescientist.net')
    const pathname = parsed.pathname.replace(/\/+/g, '/').replace(/\/+$/, '') || '/'
    return pathname === '/' ? '/' : pathname + '/'
  } catch {
    return ''
  }
}

function extractRobots(html) {
  const match = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/i)
  return String(match?.[1] || 'index,follow').toLowerCase()
}

function extractCanonicalRoute(html) {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)
  return normalizeRoute(match?.[1] || '')
}

export function buildRouteTruth(outDir = OUT) {
  if (!existsSync(outDir)) return {}

  const sitemapPath = path.join(outDir, 'sitemap.xml')
  const redirectsPath = path.join(outDir, '_redirects')
  const sitemap = new Set()
  if (existsSync(sitemapPath)) {
    const xml = readFileSync(sitemapPath, 'utf8')
    for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
      const route = normalizeRoute(match[1])
      if (route) sitemap.add(route)
    }
  }

  const redirects = new Set()
  if (existsSync(redirectsPath)) {
    for (const line of readFileSync(redirectsPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const source = trimmed.split(/\s+/)[0]
      const route = normalizeRoute(source)
      if (route) redirects.add(route)
    }
  }

  const truth = {}
  const walk = (dir, rel = '') => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '_next' || entry.name === 'pagefind') continue
      const full = path.join(dir, entry.name)
      const nextRel = rel ? path.join(rel, entry.name) : entry.name
      if (entry.isDirectory()) {
        walk(full, nextRel)
        continue
      }
      if (entry.name !== 'index.html') continue
      const route = normalizeRoute(rel ? '/' + rel.replaceAll(path.sep, '/') + '/' : '/')
      const html = readFileSync(full, 'utf8')
      const canonicalRoute = extractCanonicalRoute(html)
      const robots = extractRobots(html)
      truth[route] = {
        exists: true,
        redirectSource: redirects.has(route),
        noindex: robots.split(',').map((token) => token.trim()).includes('noindex'),
        canonicalRoute,
        selfCanonical: canonicalRoute === route,
        sitemapIncluded: sitemap.has(route),
      }
    }
  }
  walk(outDir)

  for (const route of redirects) {
    truth[route] = { ...(truth[route] || { exists: false }), redirectSource: true }
  }
  return truth
}

export function classifyPublicationState(observation, publicationTruth, routeTruth = {}) {
  if (observation?.hasQuery) return 'QUERY_PARAMETER_VARIANT'
  const route = normalizeRoute(observation?.url)
  if (!route) return 'UNCLASSIFIED'

  const profile = (publicationTruth?.profiles || []).find((row) => normalizeRoute(row?.route) === route)
  if (profile) {
    if (profile.redirectSource || profile.publicationReason === 'redirect-source') return 'REDIRECT_SOURCE'
    if (profile.emittedNoindex) return 'INTENTIONAL_NOINDEX'
    if (profile.canonicalMatches === false || String(profile.publicationReason || '').startsWith('canonicalized-to:')) {
      return 'CANONICALIZED_AWAY'
    }
    if (profile.sitemapIncluded === true && profile.publicationReason === 'published') return 'CURRENT_PUBLISHED'
    if (profile.parity === false || profile.publicationReason === 'indexable-html-missing-from-sitemap') {
      return 'CURRENT_PUBLICATION_DEFECT'
    }
  }

  const current = routeTruth?.[route]
  if (current?.redirectSource) return 'REDIRECT_SOURCE'
  if (!current?.exists) return 'HISTORICAL_OR_UNBUILT'
  if (current.noindex) return 'INTENTIONAL_NOINDEX'
  if (current.canonicalRoute && !current.selfCanonical) return 'CANONICALIZED_AWAY'
  if (current.sitemapIncluded && current.selfCanonical) return 'CURRENT_PUBLISHED'
  return 'CURRENT_PUBLICATION_DEFECT'
}

export function profileIdentity(rawUrl) {
  try {
    const pathname = new URL(String(rawUrl ?? ''), 'https://thehippiescientist.net').pathname
    const match = pathname.match(/^\/(herbs|compounds)\/([^/]+)\/?$/i)
    if (!match) return null
    return {
      kind: match[1].toLowerCase() === 'herbs' ? 'herb' : 'compound',
      slug: match[2].toLowerCase(),
    }
  } catch {
    return null
  }
}

function statusSeverity(status, statusWeights) {
  const configured = statusWeights?.[status]
  if (typeof configured === 'number' && Number.isFinite(configured)) return configured
  return DIAGNOSTIC_ONLY_STATUS_WEIGHTS[status]
}

function latestActiveObservations(input, statusWeights) {
  const latest = new Map()
  for (const row of input?.observations || []) {
    if (!row || row.active === false) continue
    const status = String(row.status ?? '').trim().toLowerCase()
    const severity = statusSeverity(status, statusWeights)
    if (typeof severity !== 'number') continue
    const normalized = normalizeObservationUrl(row.url)
    if (!normalized.url) continue
    const observedAt = String(row.observed_at ?? '').trim()
    const lastCrawled = String(row.last_crawled ?? '').trim()
    const candidate = {
      engine: String(row.engine ?? '').trim().toLowerCase(),
      status,
      severity,
      url: normalized.url,
      rawUrl: normalized.rawUrl,
      query: normalized.query,
      hasQuery: normalized.hasQuery,
      observedAt,
      lastCrawled: lastCrawled || null,
      crawlAgeDays: lastCrawled ? crawlAgeDays(lastCrawled, observedAt) : null,
      source: String(row.source ?? '').trim(),
    }
    const previous = latest.get(normalized.observationKey)
    if (
      !previous ||
      observedAt > previous.observedAt ||
      (observedAt === previous.observedAt && severity > previous.severity)
    ) {
      latest.set(normalized.observationKey, candidate)
    }
  }
  return [...latest.values()].sort((a, b) => b.severity - a.severity || a.rawUrl.localeCompare(b.rawUrl))
}

function shadowLookup(shadowReport, publicationTruth) {
  const shadowByKey = new Map()
  for (const row of shadowReport?.failures || []) shadowByKey.set(`${row.kind}:${row.slug}`, 'FAIL_SHADOW')
  for (const row of shadowReport?.watch || []) shadowByKey.set(`${row.kind}:${row.slug}`, 'WATCH')

  const published = new Set(
    (publicationTruth?.profiles || [])
      .filter(
        (row) =>
          row?.publicationReason === 'published' &&
          row?.sitemapIncluded === true &&
          row?.emittedNoindex === false &&
          row?.kind &&
          row?.slug,
      )
      .map((row) => `${row.kind}:${row.slug}`),
  )

  return (identity) => {
    if (!identity) return 'NOT_PROFILE'
    const key = `${identity.kind}:${identity.slug}`
    if (shadowByKey.has(key)) return shadowByKey.get(key)
    if (published.has(key)) return 'PASS'
    return 'NOT_EVALUATED'
  }
}

function diagnose({ severity, status, shadow, hasQuery }) {
  if (hasQuery || status === 'duplicate_without_user_selected_canonical') return 'QUERY_PARAMETER_VARIANT'
  if (status === 'not_yet_crawled') return 'CRAWL_ATTENTION'
  if (status === 'indexed') {
    if (shadow === 'FAIL_SHADOW' || shadow === 'WATCH') return 'SHADOW_ONLY_INDEXED'
    return 'INDEXED'
  }
  if (status === 'crawled_but_not_in_index' && shadow === 'NOT_EVALUATED') return 'INDEX_SELECTION_REVIEW'
  if (severity >= 0.8) {
    if (shadow === 'FAIL_SHADOW') return 'AGREEMENT_HIGH_PRIORITY'
    if (shadow === 'WATCH') return 'PARTIAL_AGREEMENT'
    if (shadow === 'PASS') return 'EXTERNAL_INTERNAL_DISAGREEMENT'
    return 'EXTERNAL_ONLY'
  }
  return shadow === 'FAIL_SHADOW' ? 'SHADOW_WITH_CRAWL_SIGNAL' : 'MONITOR'
}

export function buildFeedbackReport({ input, shadowReport, publicationTruth, routeTruth = {}, statusWeights, generatedAt }) {
  const getShadow = shadowLookup(shadowReport, publicationTruth)
  const observations = latestActiveObservations(input, statusWeights).map((observation) => {
    const identity = observation.hasQuery ? null : profileIdentity(observation.url)
    const shadow = getShadow(identity)
    return {
      ...observation,
      profile: identity,
      publicationState: classifyPublicationState(observation, publicationTruth, routeTruth),
      shadow,
      diagnosis: diagnose({ ...observation, shadow }),
    }
  })

  const count = (diagnosis) => observations.filter((row) => row.diagnosis === diagnosis).length
  const crawlAges = observations.map((row) => row.crawlAgeDays).filter((value) => Number.isInteger(value))
  const publicationStates = observations.reduce((acc, row) => {
    acc[row.publicationState] = (acc[row.publicationState] || 0) + 1
    return acc
  }, {})
  return {
    generatedAt,
    mode: 'observation-only',
    publicationMutation: false,
    inputs: {
      observations: 'data-sources/search-index-observations.json',
      shadow: 'ops/reports/index-quality-shadow.json',
      publicationTruth: 'reports/profile-publication-truth.json',
    },
    summary: {
      observations: observations.length,
      profileObservations: observations.filter((row) => row.profile).length,
      reportOnlyRoutes: observations.filter((row) => !row.profile).length,
      agreementHighPriority: count('AGREEMENT_HIGH_PRIORITY'),
      partialAgreement: count('PARTIAL_AGREEMENT'),
      externalInternalDisagreements: count('EXTERNAL_INTERNAL_DISAGREEMENT'),
      crawlAttention: count('CRAWL_ATTENTION'),
      indexSelectionReview: count('INDEX_SELECTION_REVIEW'),
      queryParameterVariants: count('QUERY_PARAMETER_VARIANT'),
      crawlDatesProvided: crawlAges.length,
      crawlObservationsOlderThan30Days: crawlAges.filter((days) => days > 30).length,
      oldestCrawlAgeDays: crawlAges.length ? Math.max(...crawlAges) : null,
      newestCrawlAgeDays: crawlAges.length ? Math.min(...crawlAges) : null,
      publicationStates,
    },
    observations,
  }
}

function renderMarkdown(report) {
  const lines = [
    '# Search index feedback report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    'Observation-only reconciliation of external index-selection signals and internal shadow quality. **No publication mutation occurs.**',
    '',
    `- Observations: ${report.summary.observations}`,
    `- Profile observations: ${report.summary.profileObservations}`,
    `- Report-only non-profile routes: ${report.summary.reportOnlyRoutes}`,
    `- High-priority agreements: ${report.summary.agreementHighPriority}`,
    `- Partial agreements: ${report.summary.partialAgreement}`,
    `- External/internal disagreements: ${report.summary.externalInternalDisagreements}`,
    `- Crawl-attention observations: ${report.summary.crawlAttention}`,
    `- Crawled-but-not-indexed review observations: ${report.summary.indexSelectionReview}`,
    `- Query-parameter variants: ${report.summary.queryParameterVariants}`,
    `- Observations with explicit crawl dates: ${report.summary.crawlDatesProvided}`,
    '',
    '## Reconciled observations',
    '',
    '| Source URL | Normalized URL | Engine status | Last crawl (age) | Current publication | Shadow | Diagnosis |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ]
  for (const row of report.observations) {
    const crawl = row.lastCrawled ? `${row.lastCrawled} (${row.crawlAgeDays ?? '?'}d)` : '—'
    lines.push(`| ${row.rawUrl} | ${row.url} | ${row.engine}:${row.status} | ${crawl} | ${row.publicationState} | ${row.shadow} | ${row.diagnosis} |`)
  }
  lines.push(
    '',
    '## Interpretation',
    '',
    '- `AGREEMENT_HIGH_PRIORITY`: external rejection and internal quality diagnostics agree; prioritize differentiated enrichment.',
    '- `EXTERNAL_INTERNAL_DISAGREEMENT`: the external engine rejects a page that the internal shadow model considers strong; inspect crawl prominence, intent fit, duplication, and model blind spots before changing content.',
    '- `INDEX_SELECTION_REVIEW`: the engine crawled a route but did not select it, without a matching published-profile quality verdict. This is not automatically a content-quality diagnosis.',
    '- `CRAWL_ATTENTION`: discovery/crawl allocation signal, not proof of low content quality.',
    '- `QUERY_PARAMETER_VARIANT`: preserve the exact source URL and query evidence; never collapse it into the clean canonical route when diagnosing duplicate/canonical behavior.',
    '- Crawl age is descriptive only. It prevents an old crawl verdict from being narrated as a fresh one; it does not automatically change priority or publication.',
    '- No diagnosis in this report is an automatic noindex, robots, sitemap, canonical, or redirect decision.',
    '',
  )
  return lines.join('\n')
}

function main() {
  const input = loadJson(INPUT)
  if (!input?.observations) {
    throw new Error('[search-index-feedback] missing data-sources/search-index-observations.json observations')
  }
  const shadowReport = loadJson(SHADOW)
  if (!shadowReport) {
    throw new Error('[search-index-feedback] missing ops/reports/index-quality-shadow.json; run index-quality-shadow first')
  }
  const publicationTruth = loadJson(PUBLICATION_TRUTH)
  if (!publicationTruth?.profiles) {
    throw new Error('[search-index-feedback] missing reports/profile-publication-truth.json; run the production publication audit first')
  }

  const routeTruth = buildRouteTruth()
  const config = loadPriorityConfig({ force: true })
  const statusWeights = config.signals.search_index_feedback?.status_weights || {}
  const report = buildFeedbackReport({
    input,
    shadowReport,
    publicationTruth,
    routeTruth,
    statusWeights,
    generatedAt: new Date().toISOString(),
  })

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_OUT, renderMarkdown(report))

  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2))
  else {
    console.log(
      `Search index feedback: ${report.summary.observations} observations | ` +
        `${report.summary.agreementHighPriority} agreement-high | ` +
        `${report.summary.externalInternalDisagreements} disagreements | ` +
        `${report.summary.crawlAttention} crawl-attention | ` +
        `${report.summary.indexSelectionReview} crawled-not-selected | ` +
        `${report.summary.queryParameterVariants} query variants`,
    )
    console.log(`Report: ${path.relative(ROOT, JSON_OUT)}`)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) main()
