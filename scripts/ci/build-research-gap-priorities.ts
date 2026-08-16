#!/usr/bin/env npx tsx
/** Build one prioritized remediation queue from the canonical research reports. */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')
const OUTPUT = path.join(REPORT_DIR, 'research-gaps.json')

function readJson(name: string): Record<string, any> {
  const file = path.join(REPORT_DIR, name)
  if (!fs.existsSync(file)) return {}
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return {}
  }
}

const topology = readJson('source-integrity.json')
const strength = readJson('claim-evidence-strength.json')
const queue = new Map<string, { url: string; score: number; reasons: Array<{ kind: string; weight: number; detail?: string }> }>()

function add(url: string, kind: string, weight: number, detail?: string) {
  if (!url) return
  const item = queue.get(url) ?? { url, score: 0, reasons: [] }
  item.score += weight
  item.reasons.push({ kind, weight, ...(detail ? { detail } : {}) })
  queue.set(url, item)
}

for (const item of topology.claimTopology?.unsupportedClaims ?? []) {
  add(item.url, 'unsupported-approved-claim', 100, item.claimId)
}
for (const item of topology.claimTopology?.danglingRefs ?? []) {
  add(item.url, 'dangling-claim-source-edge', 100, `${item.claimId} -> ${item.sourceRefId}`)
}
for (const item of topology.claimTopology?.singleStudyClaims ?? []) {
  add(item.url, 'single-study-approved-claim', 5, item.claimId)
}
for (const profile of topology.claimTopology?.concentratedProfiles ?? []) {
  const share = Number(profile.studyDependencyShare ?? 0)
  const weight = Math.round(20 + share * 30)
  add(profile.url, 'high-study-dependency', weight, `${Math.round(share * 100)}% of approved claims depend on one canonical study`)
}
for (const profile of topology.claimTopology?.reviewDominatedProfiles ?? []) {
  add(profile.url, 'narrative-review-dominated-profile', 15)
}
for (const profile of topology.claimTopology?.noPrimaryHumanProfiles ?? []) {
  add(profile.url, 'approved-claims-without-primary-human-study', 20)
}
for (const claim of strength.highConfidenceWeakOutcome ?? []) {
  add(claim.url, 'high-confidence-weak-outcome-claim', 40, String(claim.claimId ?? ''))
}
for (const claim of strength.narrativeOnlyOutcomeClaims ?? []) {
  add(claim.url, 'narrative-only-outcome-claim', 25, String(claim.claimId ?? ''))
}
for (const claim of strength.noClassifiedEvidence ?? []) {
  add(claim.url, 'unclassified-linked-evidence', 20, String(claim.claimId ?? ''))
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
  scoring: {
    note: 'Scores prioritize structural invalidity first, then claim-strength and canonical-study concentration weaknesses. They are triage weights, not evidence grades.',
    weights: {
      unsupportedApprovedClaim: 100,
      danglingClaimSourceEdge: 100,
      highConfidenceWeakOutcome: 40,
      highStudyDependency: '20 + dependency share × 30',
      narrativeOnlyOutcome: 25,
      noPrimaryHumanStudy: 20,
      unclassifiedLinkedEvidence: 20,
      narrativeReviewDominatedProfile: 15,
      singleStudyApprovedClaim: 5,
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
