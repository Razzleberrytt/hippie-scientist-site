#!/usr/bin/env npx tsx
/** Build one prioritized remediation queue directly from canonical research-quality analysis. */

import fs from 'node:fs'
import path from 'node:path'

import { analyzeResearchQuality } from '../../lib/research-quality-analysis'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')
const OUTPUT = path.join(REPORT_DIR, 'research-gaps.json')
const { profileAnalyses, claimAnalyses, structuredClaimAnalyses } = analyzeResearchQuality(ROOT)
const queue = new Map<string, { url: string; score: number; reasons: Array<{ kind: string; weight: number; detail?: string }> }>()

function add(url: string, kind: string, weight: number, detail?: string) {
  if (!url) return
  const item = queue.get(url) ?? { url, score: 0, reasons: [] }
  item.score += weight
  item.reasons.push({ kind, weight, ...(detail ? { detail } : {}) })
  queue.set(url, item)
}

for (const claim of claimAnalyses) {
  if (claim.structuredSupportTier === 'unsupported') {
    add(claim.url, 'unsupported-approved-claim', 100, claim.claimId)
  }
  for (const sourceRefId of claim.danglingSourceRefs) {
    add(claim.url, 'dangling-claim-source-edge', 100, `${claim.claimId} -> ${sourceRefId}`)
  }
  if (claim.singleStudy) {
    add(claim.url, 'single-study-approved-claim', 5, claim.claimId)
  }

  if (claim.structuredSupportTier === 'unclassified') {
    add(
      claim.url,
      'claim-support-unclassified',
      20 + (claim.highConfidenceWeakStructured ? 15 : 0),
      `${claim.claimId} · ${claim.predicate}${claim.highConfidenceWeakStructured ? ' · high confidence' : ''}`,
    )
  } else if (claim.structuredSupportTier === 'narrative-only') {
    add(
      claim.url,
      'claim-support-narrative-only',
      (claim.outcomeClaim ? 25 : 15) + (claim.highConfidenceWeakStructured ? 15 : 0),
      `${claim.claimId} · ${claim.predicate}${claim.highConfidenceWeakStructured ? ' · high confidence' : ''}`,
    )
  } else if (claim.supportTier === 'indirect-only') {
    add(
      claim.url,
      'claim-support-indirect-only',
      20 + (claim.highConfidenceWeakOutcome ? 15 : 0),
      `${claim.claimId}${claim.highConfidenceWeakOutcome ? ' · high confidence' : ''}`,
    )
  }
}

for (const claim of structuredClaimAnalyses.filter((item) => !item.approved)) {
  if (claim.structuredSupportTier === 'unsupported') {
    add(claim.url, 'unsupported-unapproved-structured-claim', 4, `${claim.claimId} · ${claim.reviewStatus || 'unreviewed'}`)
    continue
  }
  if (claim.structuredSupportTier === 'unclassified' || claim.structuredSupportTier === 'narrative-only') {
    add(
      claim.url,
      `unapproved-claim-support-${claim.structuredSupportTier}`,
      3,
      `${claim.claimId} · ${claim.predicate} · ${claim.reviewStatus || 'unreviewed'}`,
    )
  } else if (claim.supportTier === 'indirect-only') {
    add(claim.url, 'unapproved-claim-support-indirect-only', 3, `${claim.claimId} · ${claim.reviewStatus || 'unreviewed'}`)
  }
}

for (const profile of profileAnalyses) {
  if (profile.overDependentOnSingleStudy) {
    const share = profile.dominantStudySupportedClaimShare
    const concentrationBonus = Math.round(Math.min(15, profile.studyConcentrationIndex * 20))
    add(
      profile.url,
      'high-study-dependency',
      Math.round(25 + share * 30 + concentrationBonus),
      `${Math.round(share * 100)}% of supported approved claims depend on one canonical study; effective study count ${profile.effectiveStudyCount}`,
    )
  }
  if (profile.narrativeDominatedVsPrimaryHuman) {
    const ratio = profile.narrativeToPrimaryHumanRatio === null
      ? 'no primary-human studies'
      : `${profile.narrativeToPrimaryHumanRatio}:1 narrative-to-primary-human ratio`
    add(profile.url, 'narrative-review-dominated-profile', 20, ratio)
  }
  if (profile.noPrimaryHuman) {
    add(profile.url, 'approved-claims-without-primary-human-study', 20)
  }
}

const ranked = [...queue.values()]
  .map((item) => ({
    ...item,
    score: Math.round(item.score),
    reasonCounts: item.reasons.reduce<Record<string, number>>((counts, reason) => {
      counts[reason.kind] = (counts[reason.kind] ?? 0) + 1
      return counts
    }, {}),
  }))
  .sort((a, b) => b.score - a.score || b.reasons.length - a.reasons.length || a.url.localeCompare(b.url))

const report = {
  generatedAt: new Date().toISOString(),
  source: 'lib/research-quality-analysis.ts',
  scoring: {
    note: 'Scores prioritize structural invalidity first, then predicate-agnostic structured-support weakness, effective-study concentration, evidence-mix imbalance, and finally low-weight editorial backlog for unapproved structured claims. They are triage weights, not evidence grades.',
    weights: {
      unsupportedApprovedClaim: 100,
      danglingClaimSourceEdge: 100,
      highStudyDependency: '25 + dominant supported-claim share × 30 + concentration bonus (max 15)',
      narrativeOnlyOutcomeSupport: 25,
      narrativeOnlyOtherStructuredSupport: 15,
      indirectOutcomeSupport: 20,
      unclassifiedStructuredSupport: 20,
      highConfidenceWeakClaimBonus: 15,
      noPrimaryHumanStudy: 20,
      narrativeReviewDominatedProfile: 20,
      singleStudyApprovedClaim: 5,
      unsupportedUnapprovedStructuredClaim: 4,
      weakUnapprovedStructuredClaim: 3,
    },
  },
  summary: {
    profilesWithResearchGaps: ranked.length,
    weakApprovedStructuredClaims: claimAnalyses.filter((claim) => claim.weakStructuredClaim).length,
    weakUnapprovedStructuredClaims: structuredClaimAnalyses.filter((claim) => !claim.approved && claim.weakStructuredClaim).length,
    highConfidenceWeakStructuredClaims: structuredClaimAnalyses.filter((claim) => claim.highConfidenceWeakStructured).length,
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
console.log(`Profiles with gaps                ${report.summary.profilesWithResearchGaps}`)
console.log(`Weak approved structured claims   ${report.summary.weakApprovedStructuredClaims}`)
console.log(`Weak unapproved structured claims ${report.summary.weakUnapprovedStructuredClaims}`)
console.log(`High-confidence weak structured   ${report.summary.highConfidenceWeakStructuredClaims}`)
console.log(`Critical                          ${report.summary.critical}`)
console.log(`High                              ${report.summary.high}`)
console.log(`Medium                            ${report.summary.medium}`)
console.log(`Low                               ${report.summary.low}`)
for (const item of ranked.slice(0, 10)) {
  console.log(`  ${String(item.score).padStart(3)} · ${item.url} · ${item.reasons.length} finding(s)`)
}
console.log(`\nReport: ${path.relative(ROOT, OUTPUT)}`)
