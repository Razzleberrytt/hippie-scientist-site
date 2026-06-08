#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const DATASETS = [
  { kind: 'herb', label: 'herbs', file: 'public/data/herbs.json' },
  { kind: 'compound', label: 'compounds', file: 'public/data/compounds.json' },
]

const STATUSES = ['PUBLISH', 'NOINDEX', 'NEEDS_REVIEW', 'BLOCKED', 'UNKNOWN']
const SUMMARY_PATH = 'ops/indexability-review/indexability-summary.json'

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'))
}

function ensureDir(relativePath) {
  fs.mkdirSync(path.join(repoRoot, relativePath), { recursive: true })
}

function statusOf(record) {
  return STATUSES.includes(record?.indexability_status) ? record.indexability_status : 'UNKNOWN'
}

function scoreOf(record) {
  return typeof record?.indexability_score === 'number' && Number.isFinite(record.indexability_score)
    ? record.indexability_score
    : null
}

function percent(count, total) {
  return total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0
}

function sortByScoreDesc(a, b) {
  return (scoreOf(b) ?? -Infinity) - (scoreOf(a) ?? -Infinity)
    || String(a.slug || a.name).localeCompare(String(b.slug || b.name))
}

function sortByScoreAsc(a, b) {
  return (scoreOf(a) ?? Infinity) - (scoreOf(b) ?? Infinity)
    || String(a.slug || a.name).localeCompare(String(b.slug || b.name))
}

function candidate(record, kind) {
  return {
    kind,
    slug: String(record?.slug || ''),
    name: String(record?.name || ''),
    status: statusOf(record),
    score: scoreOf(record),
    robots: typeof record?.robots === 'string' ? record.robots : '',
    sitemap_included: typeof record?.sitemap_included === 'boolean' ? record.sitemap_included : null,
    reasons: Array.isArray(record?.indexability_reasons)
      ? record.indexability_reasons.slice(0, 3).map((reason) => String(reason))
      : [],
  }
}

function summarize(records) {
  const total = records.length
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]))
  const scoreTotals = Object.fromEntries(STATUSES.map((status) => [status, { count: 0, total: 0 }]))
  const sitemapIncluded = records.filter((record) => record?.sitemap_included === true).length
  const robotsDistribution = {}

  for (const record of records) {
    const status = statusOf(record)
    const score = scoreOf(record)
    const robots = typeof record?.robots === 'string' ? record.robots : 'MISSING'

    byStatus[status] += 1
    robotsDistribution[robots] = (robotsDistribution[robots] || 0) + 1

    if (score !== null) {
      scoreTotals[status].count += 1
      scoreTotals[status].total += score
    }
  }

  const percentages = Object.fromEntries(
    STATUSES.map((status) => [status, percent(byStatus[status], total)]),
  )
  const averageScoreByStatus = Object.fromEntries(
    STATUSES.map((status) => {
      const bucket = scoreTotals[status]
      return [status, bucket.count > 0 ? Number((bucket.total / bucket.count).toFixed(1)) : null]
    }),
  )

  return {
    total,
    byStatus,
    percentages,
    averageScoreByStatus,
    sitemapIncluded,
    robotsDistribution: Object.fromEntries(
      Object.entries(robotsDistribution).sort(([a], [b]) => a.localeCompare(b)),
    ),
  }
}

function printDistribution(label, summary) {
  console.log(`${label}: ${summary.total}`)
  console.log('  status distribution:')
  for (const status of STATUSES) {
    console.log(`    ${status}: ${summary.byStatus[status]} (${summary.percentages[status]}%), avg score ${summary.averageScoreByStatus[status] ?? 'n/a'}`)
  }
  console.log(`  sitemap_included: ${summary.sitemapIncluded}`)
  console.log('  robots distribution:')
  for (const [robots, count] of Object.entries(summary.robotsDistribution)) {
    console.log(`    ${robots}: ${count}`)
  }
}

function printCandidates(title, candidates) {
  console.log(title)
  if (candidates.length === 0) {
    console.log('  none')
    return
  }

  for (const item of candidates) {
    const reasons = item.reasons.length ? item.reasons.join('; ') : 'no reasons'
    console.log(`  ${item.kind}:${item.slug} | ${item.name} | ${item.status} | score ${item.score ?? 'n/a'} | ${item.robots || 'MISSING'} | sitemap ${String(item.sitemap_included)} | ${reasons}`)
  }
}

function buildCandidates(herbs, compounds) {
  const all = [
    ...herbs.map((record) => ({ record, kind: 'herb' })),
    ...compounds.map((record) => ({ record, kind: 'compound' })),
  ]

  return {
    needsReviewHerbs: herbs
      .filter((record) => statusOf(record) === 'NEEDS_REVIEW')
      .sort(sortByScoreDesc)
      .slice(0, 25)
      .map((record) => candidate(record, 'herb')),
    needsReviewCompounds: compounds
      .filter((record) => statusOf(record) === 'NEEDS_REVIEW')
      .sort(sortByScoreDesc)
      .slice(0, 25)
      .map((record) => candidate(record, 'compound')),
    noindexClosestToPublish: all
      .filter(({ record }) => statusOf(record) === 'NOINDEX')
      .sort((a, b) => sortByScoreDesc(a.record, b.record))
      .slice(0, 25)
      .map(({ record, kind }) => candidate(record, kind)),
    suspiciousLowPublish: all
      .filter(({ record }) => statusOf(record) === 'PUBLISH')
      .sort((a, b) => sortByScoreAsc(a.record, b.record))
      .slice(0, 25)
      .map(({ record, kind }) => candidate(record, kind)),
  }
}

function warningsFor(herbs, compounds) {
  const warnings = []
  for (const { records, kind } of [
    { records: herbs, kind: 'herb' },
    { records: compounds, kind: 'compound' },
  ]) {
    const missingMetadata = records.filter((record) =>
      !record?.indexability_status
      || typeof record?.indexability_score !== 'number'
      || !Array.isArray(record?.indexability_reasons)
    ).length

    if (missingMetadata > 0) {
      warnings.push(`${missingMetadata} ${kind} records are missing indexability status, score, or reasons`)
    }
  }

  return warnings
}

function main() {
  const loaded = Object.fromEntries(
    DATASETS.map((dataset) => [dataset.label, readJson(dataset.file)]),
  )
  const herbs = Array.isArray(loaded.herbs) ? loaded.herbs : []
  const compounds = Array.isArray(loaded.compounds) ? loaded.compounds : []
  const counts = {
    herbs: herbs.length,
    compounds: compounds.length,
    total: herbs.length + compounds.length,
  }
  const statusDistributions = {
    herbs: summarize(herbs),
    compounds: summarize(compounds),
  }
  const candidates = buildCandidates(herbs, compounds)
  const warnings = warningsFor(herbs, compounds)

  console.log('Indexability summary')
  printDistribution('Herbs', statusDistributions.herbs)
  printDistribution('Compounds', statusDistributions.compounds)
  printCandidates('Top NEEDS_REVIEW herbs', candidates.needsReviewHerbs)
  printCandidates('Top NEEDS_REVIEW compounds', candidates.needsReviewCompounds)
  printCandidates('Top NOINDEX records closest to PUBLISH', candidates.noindexClosestToPublish)
  printCandidates('Top PUBLISH records with suspicious/low scores', candidates.suspiciousLowPublish)

  if (warnings.length > 0) {
    console.log('Warnings:')
    for (const warning of warnings) {
      console.log(`  ${warning}`)
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    counts,
    statusDistributions,
    candidates,
    warnings,
  }

  ensureDir(path.dirname(SUMMARY_PATH))
  fs.writeFileSync(
    path.join(repoRoot, SUMMARY_PATH),
    `${JSON.stringify(output, null, 2)}\n`,
    'utf8',
  )
}

main()
