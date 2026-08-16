#!/usr/bin/env npx tsx
/** Claim-level evidence strength report derived from the canonical research-quality snapshot. */

import fs from 'node:fs'
import path from 'node:path'

import { buildResearchQualitySnapshot } from '../../lib/research-quality-snapshot'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'claim-evidence-strength.json')
const { analysis, topology } = buildResearchQualitySnapshot(ROOT)
const { claimAnalyses: claims, structuredClaimAnalyses } = analysis
const underlyingStudyIndependence = topology.underlyingStudyIndependence

const tierCounts = claims.reduce<Record<string, number>>((counts, claim) => {
  counts[claim.supportTier] = (counts[claim.supportTier] ?? 0) + 1
  return counts
}, {})
const structuredTierCounts = structuredClaimAnalyses.reduce<Record<string, number>>((counts, claim) => {
  counts[claim.structuredSupportTier] = (counts[claim.structuredSupportTier] ?? 0) + 1
  return counts
}, {})
const adjustedTierByClaim = new Map(
  underlyingStudyIndependence.claims.map((claim) => [
    `${claim.url}::${claim.claimId}`,
    claim.independenceAdjustedStructuredSupportTier,
  ]),
)
const approvedAdjustedStructuredTierCounts = claims.reduce<Record<string, number>>((counts, claim) => {
  const tier = adjustedTierByClaim.get(`${claim.url}::${claim.claimId}`) ?? claim.structuredSupportTier
  counts[tier] = (counts[tier] ?? 0) + 1
  return counts
}, {})
const unapproved = structuredClaimAnalyses.filter((claim) => !claim.approved)
const unapprovedUnsupported = unapproved.filter((claim) => claim.structuredSupportTier === 'unsupported')
const unapprovedWeakStructured = unapproved.filter((claim) => claim.weakStructuredClaim)

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    structuredClaims: structuredClaimAnalyses.length,
    approvedClaims: claims.length,
    unapprovedClaims: unapproved.length,
    outcomeClaims: claims.filter((claim) => claim.outcomeClaim).length,
    supportTiers: tierCounts,
    structuredSupportTiers: structuredTierCounts,
    approvedIndependenceAdjustedStructuredSupportTiers: approvedAdjustedStructuredTierCounts,
    supportTierDowngradesByDependence: underlyingStudyIndependence.summary.supportTierDowngrades,
    collapsedPublicationsByDependence: underlyingStudyIndependence.summary.collapsedPublicationCount,
    weakApprovedStructuredClaims: claims.filter((claim) => claim.weakStructuredClaim).length,
    highConfidenceWeakStructuredClaims: structuredClaimAnalyses.filter((claim) => claim.highConfidenceWeakStructured).length,
    highConfidenceWeakOutcome: claims.filter((claim) => claim.highConfidenceWeakOutcome).length,
    unapprovedUnsupportedStructuredClaims: unapprovedUnsupported.length,
    unapprovedWeakStructuredClaims: unapprovedWeakStructured.length,
  },
  claims,
  independenceAdjustedSupport: {
    summary: underlyingStudyIndependence.summary,
    downgradedClaims: underlyingStudyIndependence.supportTierDowngrades,
    reducedClaims: underlyingStudyIndependence.reducedClaims,
  },
  editorialBacklog: {
    unsupportedStructuredClaims: unapprovedUnsupported,
    weakStructuredClaims: unapprovedWeakStructured,
  },
}

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

console.log('\nClaim-level evidence strength')
console.log('='.repeat(72))
console.log(`Structured claims                  ${report.summary.structuredClaims}`)
console.log(`Approved claims                    ${report.summary.approvedClaims}`)
console.log(`Unapproved claims                  ${report.summary.unapprovedClaims}`)
console.log(`Outcome claims                     ${report.summary.outcomeClaims}`)
console.log(`Dependence-adjusted tier downgrades ${report.summary.supportTierDowngradesByDependence}`)
console.log(`Collapsed dependent publications   ${report.summary.collapsedPublicationsByDependence}`)
console.log(`Weak approved structured claims    ${report.summary.weakApprovedStructuredClaims}`)
console.log(`High-confidence weak structured    ${report.summary.highConfidenceWeakStructuredClaims}`)
console.log(`High-confidence weak outcomes      ${report.summary.highConfidenceWeakOutcome}`)
console.log(`Unapproved unsupported claims      ${report.summary.unapprovedUnsupportedStructuredClaims}`)
console.log(`Unapproved weak structured claims  ${report.summary.unapprovedWeakStructuredClaims}`)
console.log('\nPublication-level structured support tiers:')
for (const [tier, count] of Object.entries(structuredTierCounts).sort((a, b) => b[1] - a[1])) console.log(`  ${tier.padEnd(26)} ${count}`)
console.log('\nApproved independence-adjusted structured support tiers:')
for (const [tier, count] of Object.entries(approvedAdjustedStructuredTierCounts).sort((a, b) => b[1] - a[1])) console.log(`  ${tier.padEnd(26)} ${count}`)
console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
