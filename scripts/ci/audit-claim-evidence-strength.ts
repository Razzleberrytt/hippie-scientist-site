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
const structuredTierCounts = claims.reduce<Record<string, number>>((counts, claim) => {
  counts[claim.structuredSupportTier] = (counts[claim.structuredSupportTier] ?? 0) + 1
  return counts
}, {})

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    approvedClaims: claims.length,
    outcomeClaims: claims.filter((claim) => claim.outcomeClaim).length,
    supportTiers: tierCounts,
    structuredSupportTiers: structuredTierCounts,
    weakStructuredClaims: claims.filter((claim) => claim.weakStructuredSupport).length,
    highConfidenceWeakStructured: claims.filter((claim) => claim.highConfidenceWeakStructured).length,
    highConfidenceWeakOutcome: claims.filter((claim) => claim.highConfidenceWeakOutcome).length,
  },
  claims,
}

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

console.log('\nClaim-level evidence strength')
console.log('='.repeat(72))
console.log(`Approved claims                  ${report.summary.approvedClaims}`)
console.log(`Outcome claims                   ${report.summary.outcomeClaims}`)
console.log(`Weak structured claims           ${report.summary.weakStructuredClaims}`)
console.log(`High-confidence weak structured  ${report.summary.highConfidenceWeakStructured}`)
console.log(`High-confidence weak outcomes    ${report.summary.highConfidenceWeakOutcome}`)
console.log('\nStructured support tiers:')
for (const [tier, count] of Object.entries(structuredTierCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${tier.padEnd(26)} ${count}`)
}
console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
