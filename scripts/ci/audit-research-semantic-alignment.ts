#!/usr/bin/env npx tsx

import path from 'node:path'

import { analyzeResearchQuality } from '../../lib/research-quality-analysis'
import {
  analyzeResearchSemanticAlignment,
  writeResearchSemanticAlignmentReport,
} from '../../lib/research-semantic-alignment'

const ROOT = process.cwd()
const analysis = analyzeResearchQuality(ROOT)
const report = analyzeResearchSemanticAlignment(analysis)
const reportPath = writeResearchSemanticAlignmentReport(report, ROOT)

console.log('\nResearch semantic alignment')
console.log('='.repeat(72))
console.log(`Approved claims             ${report.summary.approvedClaims}`)
console.log(`Semantically assessable     ${report.summary.semanticallyAssessableClaims}`)
console.log(`Role mismatches             ${report.summary.roleMismatches}`)
console.log(`Outcome-domain mismatches   ${report.summary.domainMismatches}`)
console.log(`Population mismatches       ${report.summary.populationMismatches}`)
console.log(`Any semantic mismatch       ${report.summary.anyMismatch}`)
console.log(`High-confidence mismatches  ${report.summary.highConfidenceMismatches}`)

for (const finding of report.highConfidenceMismatches.slice(0, 12)) {
  console.log(`  ${finding.url} · ${finding.claimId} · ${finding.reasons.join('; ')}`)
}

console.log(`\nReport: ${path.relative(ROOT, reportPath)}`)
console.log('\n[research-semantic-alignment] advisory — explicit mismatches are triage signals, not automatic scientific verdicts.')
