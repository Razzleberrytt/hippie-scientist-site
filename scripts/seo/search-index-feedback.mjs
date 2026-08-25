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

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPriorityConfig } from '../enrichment-pipeline/lib/priority.mjs'

const __filename = fileURLToPath(import.meta.url)
const ROOT = path.resolve(path.dirname(__filename), '..', '..')
const INPUT = path.join(ROOT, 'data-sources', 'search-index-observations.json')
const SHADOW = path.join(ROOT, 'ops', 'reports', 'index-quality-shadow.json')
const PUBLICATION_TRUTH = path.join(ROOT, 'reports', 'profile-publication-truth.json')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const JSON_OUT = path.join(REPORTS_DIR, 'search-index-feedback.json')
const MD_OUT = path.join(REPORTS_DIR, 'search-index-feedback.md')

function loadJson(file) {
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8'))
}

function normalizeUrl(raw) {
  try {
    const url = new URL(String(raw ?? ''), 'https://thehippiescientist.net')
    const pathname = url.pathname.replace(/\/+$/, '') || '/'
    return `https://thehippiescientist.net${pathname}${pathname === '/' ? '' : '/'}`
  } catch {
    return String(raw ?? '').trim()
  }
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

function latestActiveObservations(input, statusWeights) {
  const latest = new Map()
  for (const row of input?.observations || []) {
    if (!row || row.active === false) continue
    const status = String(row.status ?? '').trim().toLowerCase()
    const severity = statusWeights[status]
    if (typeof severity !== 'number') continue
    const url = normalizeUrl(row.url)
    if (!url) continue
    const observedAt = String(row.observed_at ?? '').trim()
    const candidate = {
      engine: String(row.engine ?? '').trim().toLowerCase(),
      status,
      severity,
      url,
      observedAt,
      source: String(row.source ?? '').trim(),
    }
    const previous = latest.get(url)
    if (
      !previous ||
      observedAt > previous.observedAt ||
      (observedAt === previous.observedAt && severity > previous.severity)
    ) {
      latest.set(url, candidate)
    }
  }
  return [...latest.values()].sort((a, b) => b.severity - a.severity || a.url.localeCompare(b.url))
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

function diagnose({ severity, status, shadow }) {
  if (status === 'not_yet_crawled') return 'CRAWL_ATTENTION'
  if (status === 'indexed') {
    if (shadow === 'FAIL_SHADOW' || shadow === 'WATCH') return 'SHADOW_ONLY_INDEXED'
    return 'INDEXED'
  }
  if (severity >= 0.8) {
    if (shadow === 'FAIL_SHADOW') return 'AGREEMENT_HIGH_PRIORITY'
    if (shadow === 'WATCH') return 'PARTIAL_AGREEMENT'
    if (shadow === 'PASS') return 'EXTERNAL_INTERNAL_DISAGREEMENT'
    return 'EXTERNAL_ONLY'
  }
  return shadow === 'FAIL_SHADOW' ? 'SHADOW_WITH_CRAWL_SIGNAL' : 'MONITOR'
}

export function buildFeedbackReport({ input, shadowReport, publicationTruth, statusWeights, generatedAt }) {
  const getShadow = shadowLookup(shadowReport, publicationTruth)
  const observations = latestActiveObservations(input, statusWeights).map((observation) => {
    const identity = profileIdentity(observation.url)
    const shadow = getShadow(identity)
    return {
      ...observation,
      profile: identity,
      shadow,
      diagnosis: diagnose({ ...observation, shadow }),
    }
  })

  const count = (diagnosis) => observations.filter((row) => row.diagnosis === diagnosis).length
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
    '',
    '## Reconciled observations',
    '',
    '| URL | Engine status | Shadow | Diagnosis |',
    '| --- | --- | --- | --- |',
  ]
  for (const row of report.observations) {
    lines.push(`| ${row.url} | ${row.engine}:${row.status} | ${row.shadow} | ${row.diagnosis} |`)
  }
  lines.push(
    '',
    '## Interpretation',
    '',
    '- `AGREEMENT_HIGH_PRIORITY`: external rejection and internal quality diagnostics agree; prioritize differentiated enrichment.',
    '- `EXTERNAL_INTERNAL_DISAGREEMENT`: the external engine rejects a page that the internal shadow model considers strong; inspect crawl prominence, intent fit, duplication, and model blind spots before changing content.',
    '- `CRAWL_ATTENTION`: discovery/crawl allocation signal, not proof of low content quality.',
    '- No diagnosis in this report is an automatic noindex, robots, sitemap, or canonical decision.',
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

  const config = loadPriorityConfig({ force: true })
  const statusWeights = config.signals.search_index_feedback?.status_weights || {}
  const report = buildFeedbackReport({
    input,
    shadowReport,
    publicationTruth,
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
        `${report.summary.crawlAttention} crawl-attention`,
    )
    console.log(`Report: ${path.relative(ROOT, JSON_OUT)}`)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) main()
