#!/usr/bin/env npx tsx
/** Claim-level evidence strength audit over independent canonical studies. */

import fs from 'node:fs'
import path from 'node:path'

import {
  approvedClaims,
  canonicalStudyClass,
  canonicalStudyGroups,
  canonicalStudyIdentityMap,
  listResearchProfiles,
  loadPubmedCache,
  NARRATIVE_STUDY_CLASSES,
  PRIMARY_HUMAN_STUDY_CLASSES,
  SYNTHESIS_STUDY_CLASSES,
  uniqueClaimStudyIdentities,
  uniqueSourceRefs,
} from '../../lib/research-coverage'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'claim-evidence-strength.json')
const cache = loadPubmedCache(ROOT)
const claims: Array<Record<string, unknown>> = []

type SupportTier = 'unsupported' | 'unclassified' | 'narrative-only' | 'indirect-only' | 'human-supported' | 'non-outcome'

for (const { url, record } of listResearchProfiles(ROOT)) {
  const identities = canonicalStudyIdentityMap(record)
  const groups = canonicalStudyGroups(record)

  for (const claim of approvedClaims(record)) {
    const refs = uniqueSourceRefs(claim)
    const studyIds = uniqueClaimStudyIdentities(claim, identities)
    const designs = studyIds
      .map((studyId) => groups.get(studyId))
      .filter((group): group is NonNullable<typeof group> => Boolean(group))
      .map((group) => canonicalStudyClass(group, cache))
    const classified = designs.filter((design) => design !== 'unclassified')
    const primaryHuman = classified.filter((design) => PRIMARY_HUMAN_STUDY_CLASSES.has(design)).length
    const synthesis = classified.filter((design) => SYNTHESIS_STUDY_CLASSES.has(design)).length
    const narrative = classified.filter((design) => NARRATIVE_STUDY_CLASSES.has(design)).length
    const predicate = String(claim.predicate ?? '')
    const outcomeClaim = predicate === 'supports_outcome'
    const confidence = Number(claim.confidence ?? 0)
    const strongHumanSupport = primaryHuman + synthesis > 0

    let supportTier: SupportTier = 'non-outcome'
    if (studyIds.length === 0) supportTier = 'unsupported'
    else if (classified.length === 0) supportTier = 'unclassified'
    else if (outcomeClaim && narrative === classified.length) supportTier = 'narrative-only'
    else if (outcomeClaim && !strongHumanSupport) supportTier = 'indirect-only'
    else if (outcomeClaim) supportTier = 'human-supported'

    const weakOutcome = supportTier === 'narrative-only' || supportTier === 'indirect-only'

    claims.push({
      url,
      claimId: String(claim.id ?? 'unknown-claim'),
      predicate,
      confidence,
      sourceRefCount: refs.length,
      studyCount: studyIds.length,
      classifiedStudyCount: classified.length,
      primaryHuman,
      synthesis,
      narrative,
      designs,
      outcomeClaim,
      supportTier,
      highConfidenceWeakOutcome: outcomeClaim && confidence >= 0.75 && (weakOutcome || supportTier === 'unclassified' || supportTier === 'unsupported'),
    })
  }
}

const tierCounts = claims.reduce<Record<string, number>>((counts, claim) => {
  const tier = String(claim.supportTier)
  counts[tier] = (counts[tier] ?? 0) + 1
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
