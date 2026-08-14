#!/usr/bin/env node
/**
 * validate-content-quality-gate.mjs
 *
 * The publish gate for ingredient pages: a profile earns indexation, it is not
 * granted it by existing. Every herb/compound is scored on the six dimensions
 * that make a profile worth a click, and any *indexable* page below the floor
 * is reported as a gate violation.
 *
 *   evidence    graded, with a stated rationale
 *   citations   real sources attached to the profile
 *   safety      cautions / contraindications / interactions
 *   dosing      an actual dose, not a placeholder
 *   mechanism   how it plausibly works
 *   substance   a unique, non-boilerplate summary of real length
 *
 * Usage:
 *   node scripts/ci/validate-content-quality-gate.mjs
 *   node scripts/ci/validate-content-quality-gate.mjs --strict        # exit 1 on violations
 *   node scripts/ci/validate-content-quality-gate.mjs --min=60        # override pass score
 *   node scripts/ci/validate-content-quality-gate.mjs --kind=herb
 *
 * Output: ops/reports/content-quality-gate.json
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  REPORTS_DIR,
  ROOT,
  isMeaningful,
  loadProfileCorpus,
  median,
  percent,
} from '../lib/profile-corpus.mjs'

/* ------------------------------------------------------------------ args -- */

const argv = process.argv.slice(2)
const flag = (name, fallback = undefined) => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const STRICT = flag('strict', false) === true
const MIN_SCORE = Number(flag('min', 60))
const KIND = flag('kind', null)
const REPORT_PATH = path.join(REPORTS_DIR, 'content-quality-gate.json')

/* --------------------------------------------------------------- scoring -- */

/**
 * Dimensions are weighted by how much they change a reader's decision. Evidence
 * and citations dominate because the site's whole proposition is evidence-first;
 * a page that cannot cite anything has no business being indexed.
 */
const DIMENSIONS = [
  {
    key: 'evidence',
    weight: 25,
    label: 'Evidence grade + rationale',
    score(entry) {
      let score = 0
      if (entry.evidenceGrade.band !== 'unrated') score += 0.6
      if (isMeaningful(entry.evidenceRationale, 40)) score += 0.4
      else if (entry.reviewStatus === 'sourced') score += 0.2
      return Math.min(1, score)
    },
  },
  {
    key: 'citations',
    weight: 25,
    label: 'Sourced citations',
    score(entry) {
      // 3+ sources reads as a genuinely researched profile; 1-2 is a start.
      if (entry.sourceCount >= 5) return 1
      if (entry.sourceCount >= 3) return 0.8
      if (entry.sourceCount === 2) return 0.5
      if (entry.sourceCount === 1) return 0.25
      return 0
    },
  },
  {
    key: 'safety',
    weight: 15,
    label: 'Safety, contraindications, interactions',
    score(entry) {
      let score = 0
      if (isMeaningful(entry.safety, 25)) score += 0.7
      if (entry.interactions.length > 0) score += 0.3
      return Math.min(1, score)
    },
  },
  {
    key: 'dosing',
    weight: 15,
    label: 'Actionable dosing',
    score(entry) {
      if (!isMeaningful(entry.dosing, 8)) return 0
      // A dose without a number is not a dose.
      return /\d/.test(entry.dosing) ? 1 : 0.4
    },
  },
  {
    key: 'mechanism',
    weight: 10,
    label: 'Mechanism of action',
    score(entry) {
      if (entry.mechanisms.length >= 3) return 1
      if (entry.mechanisms.length === 2) return 0.7
      if (entry.mechanisms.length === 1) return 0.4
      return 0
    },
  },
  {
    key: 'substance',
    weight: 10,
    label: 'Unique, substantial summary',
    score(entry, context) {
      const body = entry.description.length > entry.summary.length ? entry.description : entry.summary
      if (!isMeaningful(body, 120)) return 0
      if (context.duplicateSummaries.has(entry.slug)) return 0.2
      if (body.length >= 600) return 1
      if (body.length >= 300) return 0.8
      return 0.5
    },
  },
]

const MAX_WEIGHT = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0)

/** Summaries reused verbatim across profiles are boilerplate, not content. */
function findDuplicateSummaries(entries) {
  const seen = new Map()
  for (const entry of entries) {
    const body = (entry.description || entry.summary).toLowerCase().replace(/\s+/g, ' ').trim()
    if (body.length < 80) continue
    const key = body.slice(0, 200)
    if (!seen.has(key)) seen.set(key, [])
    seen.get(key).push(entry.slug)
  }
  const duplicates = new Set()
  for (const slugs of seen.values()) {
    if (slugs.length > 1) for (const slug of slugs) duplicates.add(slug)
  }
  return duplicates
}

function scoreEntry(entry, context) {
  const breakdown = {}
  let total = 0
  for (const dimension of DIMENSIONS) {
    const ratio = dimension.score(entry, context)
    const points = Math.round(ratio * dimension.weight * 10) / 10
    breakdown[dimension.key] = { ratio: Math.round(ratio * 100) / 100, points, weight: dimension.weight }
    total += points
  }
  const score = Math.round((total / MAX_WEIGHT) * 100)

  const failing = Object.entries(breakdown)
    .filter(([, value]) => value.ratio < 0.5)
    .map(([key]) => key)

  return { score, breakdown, failing }
}

/** What to do about a page that fails — the action, not just the number. */
function recommendAction(entry, result) {
  if (!entry.indexable) return 'already-noindex'
  if (result.score >= MIN_SCORE) return 'keep'
  if (entry.sourceCount === 0 && result.score < 35) return 'noindex-or-consolidate'
  if (result.failing.includes('citations')) return 'add-citations'
  if (result.failing.includes('dosing') || result.failing.includes('safety')) return 'complete-core-fields'
  return 'upgrade'
}

/* ------------------------------------------------------------------ main -- */

function main() {
  const kinds = KIND ? [KIND] : ['herb', 'compound']
  const { entries } = loadProfileCorpus({ kinds })
  const context = { duplicateSummaries: findDuplicateSummaries(entries) }

  const scored = entries.map((entry) => {
    const result = scoreEntry(entry, context)
    return {
      kind: entry.kind,
      slug: entry.slug,
      name: entry.name,
      url: entry.url,
      indexable: entry.indexable,
      score: result.score,
      passes: result.score >= MIN_SCORE,
      failingDimensions: result.failing,
      breakdown: result.breakdown,
      action: recommendAction(entry, result),
      signals: {
        sourceCount: entry.sourceCount,
        claimCount: entry.claimCount,
        evidenceBand: entry.evidenceGrade.band,
        mechanismCount: entry.mechanisms.length,
        hasDosing: isMeaningful(entry.dosing, 8),
        hasSafety: isMeaningful(entry.safety, 25),
        summaryChars: (entry.description || entry.summary).length,
      },
    }
  })

  const byKind = {}
  for (const kind of kinds) {
    const rows = scored.filter((r) => r.kind === kind)
    const indexable = rows.filter((r) => r.indexable)
    const violations = indexable.filter((r) => !r.passes)

    const dimensionFailures = {}
    for (const row of indexable) {
      for (const key of row.failingDimensions) dimensionFailures[key] = (dimensionFailures[key] ?? 0) + 1
    }

    byKind[kind] = {
      total: rows.length,
      indexable: indexable.length,
      noindex: rows.length - indexable.length,
      passing: indexable.length - violations.length,
      violations: violations.length,
      passRate: percent(indexable.length - violations.length, indexable.length),
      medianScore: median(indexable.map((r) => r.score)),
      medianScoreAll: median(rows.map((r) => r.score)),
      dimensionFailures,
      // Non-indexed pages that already clear the bar are wasted inventory.
      readyToPromote: rows
        .filter((r) => !r.indexable && r.passes)
        .map((r) => ({ slug: r.slug, score: r.score, url: r.url }))
        .sort((a, b) => b.score - a.score),
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    minScore: MIN_SCORE,
    dimensions: DIMENSIONS.map(({ key, weight, label }) => ({ key, weight, label })),
    summary: byKind,
    profiles: scored.sort((a, b) => a.score - b.score),
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  printSummary(report)

  const totalViolations = Object.values(byKind).reduce((sum, k) => sum + k.violations, 0)
  if (STRICT && totalViolations > 0) {
    console.error(`\n[quality-gate] FAILED — ${totalViolations} indexable profile(s) below the score floor of ${MIN_SCORE}.`)
    process.exit(1)
  }
}

function printSummary(report) {
  console.log('\nContent quality gate')
  console.log('='.repeat(64))
  console.log(`Pass floor: ${report.minScore}/100`)

  for (const [kind, stats] of Object.entries(report.summary)) {
    console.log(`\n${kind}s`)
    console.log(`  total / indexable    ${stats.total} / ${stats.indexable}  (noindex: ${stats.noindex})`)
    console.log(`  passing indexable    ${stats.passing}  (${stats.passRate}%)`)
    console.log(`  gate violations      ${stats.violations}`)
    console.log(`  median score         ${stats.medianScore} indexable · ${stats.medianScoreAll} all`)
    const failures = Object.entries(stats.dimensionFailures).sort((a, b) => b[1] - a[1])
    if (failures.length) {
      console.log('  weakest dimensions across indexable pages:')
      for (const [key, count] of failures) console.log(`    ${String(count).padStart(5)}  ${key}`)
    }
    if (stats.readyToPromote.length) {
      console.log(`  noindexed pages already passing the gate: ${stats.readyToPromote.length}`)
      for (const row of stats.readyToPromote.slice(0, 8)) console.log(`    ${String(row.score).padStart(3)}  ${row.url}`)
    }
  }

  const actions = {}
  for (const row of report.profiles) {
    if (!row.indexable || row.passes) continue
    actions[row.action] = (actions[row.action] ?? 0) + 1
  }
  if (Object.keys(actions).length) {
    console.log('\nRecommended actions for failing indexable pages:')
    for (const [action, count] of Object.entries(actions).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(count).padStart(5)}  ${action}`)
    }
  }

  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
}

main()
