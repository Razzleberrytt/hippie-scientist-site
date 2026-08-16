#!/usr/bin/env npx tsx
/** Build the prioritized remediation queue from the canonical research-quality snapshot. */

import fs from 'node:fs'
import path from 'node:path'

import {
  RESEARCH_GAP_DIMENSION_CAPS,
  RESEARCH_GAP_WEIGHTS,
  type ResearchGapDimension,
} from '../../lib/research-quality-policy'
import { buildResearchQualitySnapshot } from '../../lib/research-quality-snapshot'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')
const OUTPUT = path.join(REPORT_DIR, 'research-gaps.json')
const { researchGapQueue: ranked } = buildResearchQualitySnapshot(ROOT)

const dimensions = Object.keys(RESEARCH_GAP_DIMENSION_CAPS) as ResearchGapDimension[]
const dimensionRollup = Object.fromEntries(dimensions.map((dimension) => {
  const affected = ranked.filter((item) => Number(item.dimensionRawScores[dimension] ?? 0) > 0)
  const rawScore = affected.reduce((sum, item) => sum + Number(item.dimensionRawScores[dimension] ?? 0), 0)
  const cappedScore = affected.reduce((sum, item) => sum + Number(item.dimensionScores[dimension] ?? 0), 0)
  return [dimension, {
    profiles: affected.length,
    rawScore,
    cappedScore,
    cappedProfiles: affected.filter((item) => item.cappedDimensions.includes(dimension)).length,
  }]
}))

const reasonCounts = new Map<string, { profiles: Set<string>; findings: number; totalWeight: number }>()
for (const item of ranked) {
  for (const reason of item.reasons) {
    const aggregate = reasonCounts.get(reason.kind) ?? { profiles: new Set<string>(), findings: 0, totalWeight: 0 }
    aggregate.profiles.add(item.url)
    aggregate.findings += 1
    aggregate.totalWeight += reason.weight
    reasonCounts.set(reason.kind, aggregate)
  }
}
const topReasonKinds = [...reasonCounts.entries()]
  .map(([kind, aggregate]) => ({
    kind,
    profiles: aggregate.profiles.size,
    findings: aggregate.findings,
    totalWeight: aggregate.totalWeight,
  }))
  .sort((a, b) => b.profiles - a.profiles || b.totalWeight - a.totalWeight || b.findings - a.findings || a.kind.localeCompare(b.kind))

const report = {
  schemaVersion: 4,
  generatedAt: new Date().toISOString(),
  source: 'lib/research-quality-snapshot.ts -> lib/research-quality-policy.ts',
  scoring: {
    note: 'Reasons are grouped into canonical dimensions. rawScore preserves full diagnostic weight; score sums dimension-capped subtotals so correlated findings corroborate a weakness without unlimited double-counting. Scores are triage weights, not evidence grades.',
    dimensionCaps: RESEARCH_GAP_DIMENSION_CAPS,
    weights: {
      ...RESEARCH_GAP_WEIGHTS,
      highStudyDependency: '25 + dominant supported-claim share × 30 + concentration bonus (max 15)',
    },
  },
  summary: {
    profilesWithResearchGaps: ranked.length,
    critical: ranked.filter((item) => item.score >= 100).length,
    high: ranked.filter((item) => item.score >= 60 && item.score < 100).length,
    medium: ranked.filter((item) => item.score >= 25 && item.score < 60).length,
    low: ranked.filter((item) => item.score < 25).length,
    profilesWithCappedDimensions: ranked.filter((item) => item.cappedDimensions.length > 0).length,
    totalRawScore: ranked.reduce((sum, item) => sum + item.rawScore, 0),
    totalCappedScore: ranked.reduce((sum, item) => sum + item.score, 0),
  },
  dimensionRollup,
  topReasonKinds,
  queue: ranked,
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`)

console.log('\nPrioritized research-gap queue')
console.log('='.repeat(72))
console.log(`Profiles with gaps          ${report.summary.profilesWithResearchGaps}`)
console.log(`Critical                    ${report.summary.critical}`)
console.log(`High                        ${report.summary.high}`)
console.log(`Medium                      ${report.summary.medium}`)
console.log(`Low                         ${report.summary.low}`)
console.log(`Dimension-capped profiles   ${report.summary.profilesWithCappedDimensions}`)
console.log(`Queue score                 ${report.summary.totalCappedScore} capped / ${report.summary.totalRawScore} raw`)
console.log('\nTop dimensions by affected profiles:')
for (const [dimension, values] of Object.entries(dimensionRollup)
  .sort((a, b) => b[1].profiles - a[1].profiles || b[1].rawScore - a[1].rawScore)
  .slice(0, 6)) {
  console.log(`  ${dimension.padEnd(20)} ${String(values.profiles).padStart(4)} profiles · ${String(values.cappedScore).padStart(5)} capped / ${String(values.rawScore).padStart(5)} raw`)
}
console.log('\nTop root causes:')
for (const reason of topReasonKinds.slice(0, 8)) {
  console.log(`  ${reason.kind.padEnd(42)} ${String(reason.profiles).padStart(4)} profiles · ${String(reason.findings).padStart(4)} finding(s)`)
}
console.log('\nHighest-priority profiles:')
for (const item of ranked.slice(0, 10)) {
  const capNote = item.cappedDimensions.length ? ` · capped: ${item.cappedDimensions.join(',')}` : ''
  console.log(`  ${String(item.score).padStart(3)} (${String(item.rawScore).padStart(3)} raw) · ${item.url} · ${item.reasons.length} finding(s)${capNote}`)
}
console.log(`\nReport: ${path.relative(ROOT, OUTPUT)}`)
