#!/usr/bin/env npx tsx
/** Claim-level evidence strength report derived from the canonical research-quality analysis. */

import fs from 'node:fs'
import path from 'node:path'

import { analyzeResearchQuality } from '../../lib/research-quality-analysis'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'claim-evidence-strength.json')
const { claimAnalyses: claims } = analyzeResearchQuality(ROOT)

const tierCounts = claims.reduce<Record<string, number>>((counts, claim) => {
  counts[claim.supportTier] = (counts[claim.supportTier] ?? 0) + 1
  return counts
}, {})

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    approvedClaims: claims.length,
    outcomeClaims: claims.filter((claim) => claim.outcomeClaim).length,
    supportTiers: tierCounts,
    highConfidenceWeakOutcome: claims.filter((claim) => claim.highConfidenceWeakOutcome).length,
  },
  claims,
}

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

console.log('\nClaim-level evidence strength')
console.log('='.repeat(72))
console.log(`Approved claims               ${report.summary.approvedClaims}`)
console.log(`Outcome claims                ${report.summary.outcomeClaims}`)
for (const [tier, count] of Object.entries(tierCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`${tier.padEnd(29)} ${count}`)
}
console.log(`High-confidence weak outcomes ${report.summary.highConfidenceWeakOutcome}`)
console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
