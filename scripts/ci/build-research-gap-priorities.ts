#!/usr/bin/env npx tsx
/** Build the prioritized remediation queue from canonical research-quality policy. */

import fs from 'node:fs'
import path from 'node:path'

import { analyzeResearchQuality } from '../../lib/research-quality-analysis'
import { buildResearchGapQueue, RESEARCH_GAP_WEIGHTS } from '../../lib/research-quality-policy'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')
const OUTPUT = path.join(REPORT_DIR, 'research-gaps.json')
const ranked = buildResearchGapQueue(analyzeResearchQuality(ROOT))

const report = {
  generatedAt: new Date().toISOString(),
  source: 'lib/research-quality-analysis.ts + lib/research-quality-policy.ts',
  scoring: {
    note: 'Scores prioritize structural invalidity first, then approved-claim weakness, effective-study concentration, evidence-mix imbalance, and finally low-weight editorial backlog for unapproved structured claims. They are triage weights, not evidence grades.',
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
  },
  queue: ranked,
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`)

console.log('\nPrioritized research-gap queue')
console.log('='.repeat(72))
console.log(`Profiles with gaps  ${report.summary.profilesWithResearchGaps}`)
console.log(`Critical            ${report.summary.critical}`)
console.log(`High                ${report.summary.high}`)
console.log(`Medium              ${report.summary.medium}`)
console.log(`Low                 ${report.summary.low}`)
for (const item of ranked.slice(0, 10)) {
  console.log(`  ${String(item.score).padStart(3)} · ${item.url} · ${item.reasons.length} finding(s)`)
}
console.log(`\nReport: ${path.relative(ROOT, OUTPUT)}`)
