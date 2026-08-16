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
      unsupported: studyIds.length === 0,
      noClassifiedEvidence: studyIds.length > 0 && classified.length === 0,
      narrativeOnlyOutcomeClaim: outcomeClaim && classified.length > 0 && narrative === classified.length,
      outcomeWithoutPrimaryOrSynthesis: outcomeClaim && classified.length > 0 && !strongHumanSupport,
      highConfidenceWeakOutcome: outcomeClaim && confidence >= 0.75 && !strongHumanSupport,
    })
  }
}

const unsupported = claims.filter((claim) => claim.unsupported)
const noClassifiedEvidence = claims.filter((claim) => claim.noClassifiedEvidence)
const narrativeOnlyOutcomeClaims = claims.filter((claim) => claim.narrativeOnlyOutcomeClaim)
const outcomeWithoutPrimaryOrSynthesis = claims.filter((claim) => claim.outcomeWithoutPrimaryOrSynthesis)
const highConfidenceWeakOutcome = claims.filter((claim) => claim.highConfidenceWeakOutcome)

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    approvedClaims: claims.length,
    outcomeClaims: claims.filter((claim) => claim.outcomeClaim).length,
    unsupported: unsupported.length,
    noClassifiedEvidence: noClassifiedEvidence.length,
    narrativeOnlyOutcomeClaims: narrativeOnlyOutcomeClaims.length,
    outcomeWithoutPrimaryOrSynthesis: outcomeWithoutPrimaryOrSynthesis.length,
    highConfidenceWeakOutcome: highConfidenceWeakOutcome.length,
  },
  unsupported,
  noClassifiedEvidence,
  narrativeOnlyOutcomeClaims,
  outcomeWithoutPrimaryOrSynthesis,
  highConfidenceWeakOutcome,
  claims,
}

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

console.log('\nClaim-level evidence strength')
console.log('='.repeat(72))
console.log(`Approved claims                    ${report.summary.approvedClaims}`)
console.log(`Outcome claims                     ${report.summary.outcomeClaims}`)
console.log(`Unsupported claims                 ${report.summary.unsupported}`)
console.log(`No classified linked evidence     ${report.summary.noClassifiedEvidence}`)
console.log(`Narrative-review-only outcomes     ${report.summary.narrativeOnlyOutcomeClaims}`)
console.log(`Outcomes without primary/synthesis ${report.summary.outcomeWithoutPrimaryOrSynthesis}`)
console.log(`High-confidence weak outcomes      ${report.summary.highConfidenceWeakOutcome}`)
console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
