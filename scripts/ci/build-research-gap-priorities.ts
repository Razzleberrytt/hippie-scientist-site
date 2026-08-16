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
  if (claim.supportTier === 'unsupported') {
    add(claim.url, 'unsupported-approved-claim', 100, claim.claimId)
  }
  for (const sourceRefId of claim.danglingSourceRefs) {
    add(claim.url, 'dangling-claim-source-edge', 100, `${claim.claimId} -> ${sourceRefId}`)
  }
  if (claim.singleStudy) {
    add(claim.url, 'single-study-approved-claim', 5, claim.claimId)
  }

  const tier = claim.supportTier
  if (tier === 'unsupported' || tier === 'human-supported' || tier === 'non-outcome') continue
  const baseWeight = tier === 'narrative-only' ? 25 : 20
  const confidenceBonus = claim.highConfidenceWeakOutcome ? 15 : 0
  add(
    claim.url,
    `claim-support-${tier}`,
    baseWeight + confidenceBonus,
    `${claim.claimId}${confidenceBonus ? ' · high confidence' : ''}`,
  )
}

for (const claim of structuredClaimAnalyses.filter((item) => !item.approved)) {
  if (claim.supportTier === 'unsupported') {
    add(claim.url, 'unsupported-unapproved-structured-claim', 4, `${claim.claimId} · ${claim.reviewStatus || 'unreviewed'}`)
    continue
  }
  if (claim.outcomeClaim && ['unclassified', 'narrative-only', 'indirect-only'].includes(claim.supportTier)) {
    add(claim.url, `unapproved-claim-support-${claim.supportTier}`, 3, `${claim.claimId} · ${claim.reviewStatus || 'unreviewed'}`)
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
    note: 'Scores prioritize structural invalidity first, then approved-claim weakness, effective-study concentration, evidence-mix imbalance, and finally low-weight editorial backlog for unapproved structured claims. They are triage weights, not evidence grades.',
    weights: {
      unsupportedApprovedClaim: 100,
      danglingClaimSourceEdge: 100,
      highStudyDependency: '25 + dominant supported-claim share × 30 + concentration bonus (max 15)',
      narrativeOnlyClaimSupport: 25,
      indirectOrUnclassifiedClaimSupport: 20,
      highConfidenceWeakClaimBonus: 15,
      noPrimaryHumanStudy: 20,
      narrativeReviewDominatedProfile: 20,
      singleStudyApprovedClaim: 5,
      unsupportedUnapprovedStructuredClaim: 4,
      weakUnapprovedOutcomeClaim: 3,
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
