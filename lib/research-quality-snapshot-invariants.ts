import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { ResearchQualityGate } from './research-quality-gate'
import type { ResearchGapItem } from './research-quality-policy'
import type { ResearchQualityTopology } from './research-quality-topology'

export type ResearchSnapshotInvariantFailure = {
  kind: string
  detail: string
}

export type ResearchSnapshotInvariantReport = {
  passed: boolean
  failures: ResearchSnapshotInvariantFailure[]
  summary: {
    failures: number
    unknownProfileReferences: number
    unknownClaimReferences: number
    countMismatches: number
  }
}

function claimKey(url: string, claimId: string): string {
  return `${url}::${claimId}`
}

/**
 * Cross-check the canonical research snapshot against itself. These are
 * implementation invariants, not scientific judgments: if they fail, two
 * derived products disagree about the same underlying graph and the snapshot
 * must not be treated as authoritative.
 */
export function validateResearchQualitySnapshotInvariants(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology,
  gate: ResearchQualityGate,
  researchGapQueue: ResearchGapItem[],
): ResearchSnapshotInvariantReport {
  const failures: ResearchSnapshotInvariantFailure[] = []
  const profileUrls = new Set(analysis.profileAnalyses.map((profile) => profile.url))
  const approvedClaimKeys = new Set(analysis.claimAnalyses.map((claim) => claimKey(claim.url, claim.claimId)))

  const add = (kind: string, detail: string) => failures.push({ kind, detail })
  const requireProfile = (kind: string, url: string, detail: string) => {
    if (!profileUrls.has(url)) add(kind, `${detail}: unknown profile ${url}`)
  }
  const requireApprovedClaim = (kind: string, url: string, claimId: string) => {
    if (!approvedClaimKeys.has(claimKey(url, claimId))) add(kind, `unknown approved claim ${url}::${claimId}`)
  }

  if (topology.semanticAlignment.summary.approvedClaims !== analysis.claimAnalyses.length) {
    add(
      'semantic-approved-claim-count-mismatch',
      `semantic=${topology.semanticAlignment.summary.approvedClaims}; analysis=${analysis.claimAnalyses.length}`,
    )
  }

  if (gate.summary.structuralFailures !== gate.structuralFailures.length) {
    add('gate-structural-count-mismatch', `summary=${gate.summary.structuralFailures}; rows=${gate.structuralFailures.length}`)
  }
  if (gate.summary.severeStudyClassConflicts !== gate.severeStudyClassConflicts.length) {
    add(
      'gate-study-class-count-mismatch',
      `summary=${gate.summary.severeStudyClassConflicts}; rows=${gate.severeStudyClassConflicts.length}`,
    )
  }
  if (gate.summary.blockingFailures !== gate.structuralFailures.length + gate.severeStudyClassConflicts.length) {
    add(
      'gate-blocking-count-mismatch',
      `summary=${gate.summary.blockingFailures}; computed=${gate.structuralFailures.length + gate.severeStudyClassConflicts.length}`,
    )
  }
  if (gate.passed !== (gate.summary.blockingFailures === 0)) {
    add('gate-pass-state-mismatch', `passed=${gate.passed}; blocking=${gate.summary.blockingFailures}`)
  }

  for (const finding of topology.semanticAlignment.findings) {
    requireProfile('semantic-unknown-profile', finding.url, finding.claimId)
    requireApprovedClaim('semantic-unknown-claim', finding.url, finding.claimId)
  }
  for (const finding of topology.semanticAlignment.concentrationFindings) {
    requireApprovedClaim('semantic-concentration-unknown-claim', finding.url, finding.claimId)
  }
  for (const finding of topology.claimLanguageCalibration.directEvidenceFindings) {
    requireApprovedClaim('language-calibration-unknown-claim', finding.url, finding.claimId)
  }
  for (const claim of topology.claimCitationMetadata.claims) {
    requireApprovedClaim('citation-metadata-unknown-claim', claim.url, claim.claimId)
  }
  for (const claim of topology.claimEvidenceDiversity) {
    requireApprovedClaim('evidence-diversity-unknown-claim', claim.url, claim.claimId)
  }
  for (const claim of topology.claimProvenanceIndependence) {
    requireApprovedClaim('provenance-independence-unknown-claim', claim.url, claim.claimId)
  }
  for (const claim of topology.claimEvidenceAge) {
    requireApprovedClaim('evidence-age-unknown-claim', claim.url, claim.claimId)
  }
  for (const gap of researchGapQueue) {
    requireProfile('gap-queue-unknown-profile', gap.url, 'research gap queue')
  }

  const unknownProfileReferences = failures.filter((failure) => failure.kind.includes('unknown-profile')).length
  const unknownClaimReferences = failures.filter((failure) => failure.kind.includes('unknown-claim')).length
  const countMismatches = failures.filter((failure) => failure.kind.includes('mismatch')).length

  return {
    passed: failures.length === 0,
    failures,
    summary: {
      failures: failures.length,
      unknownProfileReferences,
      unknownClaimReferences,
      countMismatches,
    },
  }
}
