#!/usr/bin/env npx tsx
/** Build the prioritized remediation queue from the canonical research-quality snapshot. */

import fs from 'node:fs'
import path from 'node:path'

import { buildResearchGapQueue, RESEARCH_GAP_DIMENSION_CAPS, RESEARCH_GAP_WEIGHTS } from '../../lib/research-quality-policy'
import { buildResearchQualitySnapshot } from '../../lib/research-quality-snapshot'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')
const OUTPUT = path.join(REPORT_DIR, 'research-gaps.json')
const { analysis, topology } = buildResearchQualitySnapshot(ROOT)
const ranked = buildResearchGapQueue(analysis, topology)

const report = {
  schemaVersion: 3,
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
  },
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
for (const item of ranked.slice(0, 10)) {
  const capNote = item.cappedDimensions.length ? ` · capped: ${item.cappedDimensions.join(',')}` : ''
  console.log(`  ${String(item.score).padStart(3)} (${String(item.rawScore).padStart(3)} raw) · ${item.url} · ${item.reasons.length} finding(s)${capNote}`)
}
console.log(`\nReport: ${path.relative(ROOT, OUTPUT)}`)
