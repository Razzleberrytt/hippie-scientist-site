import {
  canonicalStudyGroups,
  crossProfileStudyIdentity,
  crossProfileStudyIdentityMap,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { ResearchQualityGate } from './research-quality-gate'
import type { ResearchGapItem } from './research-quality-policy'
import type { ResearchQualityTopology } from './research-quality-topology'
import type { ResearchSourceIntegrity } from './research-source-integrity'

export type ResearchSnapshotInvariantFailure = {
  kind: string
  detail: string
}

type CitationIntegritySnapshotView = {
  sources: number
  blockingCount: number
  blocking: unknown[]
  duplicateProfileSources: unknown[]
  identifierPairConflicts: unknown[]
  conflicts: unknown[]
  passed: boolean
}

export type ResearchSnapshotInvariantReport = {
  passed: boolean
  failures: ResearchSnapshotInvariantFailure[]
  summary: {
    failures: number
    unknownProfileReferences: number
    unknownClaimReferences: number
    countMismatches: number
    duplicateClaimIds: number
    missingClaimIds: number
    duplicateSourceIds: number
    missingSourceIds: number
    duplicateClaimSourceEdges: number
    sourceIntegrityFailures: number
    citationIntegrityFailures: number
  }
}

function claimKey(url: string, claimId: string): string {
  return `${url}::${claimId}`
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function sameStrings(left: Set<string>, right: Set<string>): boolean {
  return left.size === right.size && [...left].every((value) => right.has(value))
}

/**
 * Cross-check the canonical research snapshot against itself. These are
 * implementation/data invariants, not scientific judgments: if they fail, two
 * derived products can disagree about the same underlying graph and the
 * snapshot must not be treated as authoritative.
 */
export function validateResearchQualitySnapshotInvariants(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology,
  gate: ResearchQualityGate,
  researchGapQueue: ResearchGapItem[],
  sourceIntegrity?: ResearchSourceIntegrity,
  citationIntegrity?: CitationIntegritySnapshotView,
): ResearchSnapshotInvariantReport {
  const failures: ResearchSnapshotInvariantFailure[] = []
  const profileUrls = new Set(analysis.profileAnalyses.map((profile) => profile.url))
  const approvedClaimKeys = new Set(analysis.claimAnalyses.map((claim) => claimKey(claim.url, claim.claimId)))
  const approvedMultiStudyClaimKeys = new Set(
    analysis.claimAnalyses
      .filter((claim) => claim.studyCount >= 2)
      .map((claim) => claimKey(claim.url, claim.claimId)),
  )
  const canonicalStudyPages = new Map<string, Set<string>>()
  const globalStudyIdentities = crossProfileStudyIdentityMap(analysis.profiles)
  let rawSourceCount = 0

  const add = (kind: string, detail: string) => failures.push({ kind, detail })
  const requireProfile = (kind: string, url: string, detail: string) => {
    if (!profileUrls.has(url)) add(kind, `${detail}: unknown profile ${url}`)
  }
  const requireApprovedClaim = (kind: string, url: string, claimId: string) => {
    if (!approvedClaimKeys.has(claimKey(url, claimId))) add(kind, `unknown approved claim ${url}::${claimId}`)
  }

  for (const profile of analysis.profiles) {
    const claims = Array.isArray(profile.record.claimMap) ? profile.record.claimMap : []
    const seenClaims = new Set<string>()
    for (let index = 0; index < claims.length; index += 1) {
      const id = text(claims[index]?.id)
      if (!id) {
        add('missing-claim-id', `${profile.url} · claimMap[${index}]`)
        continue
      }
      if (seenClaims.has(id)) add('duplicate-claim-id', `${profile.url}::${id}`)
      else seenClaims.add(id)
    }

    const sources = Array.isArray(profile.record.sources) ? profile.record.sources : []
    rawSourceCount += sources.length
    const seenSources = new Set<string>()
    for (let index = 0; index < sources.length; index += 1) {
      const id = text(sources[index]?.id)
      if (!id) {
        add('missing-source-id', `${profile.url} · sources[${index}]`)
      } else if (seenSources.has(id)) {
        add('duplicate-source-id', `${profile.url}::${id}`)
      } else {
        seenSources.add(id)
      }
    }

    for (const [localStudyId] of canonicalStudyGroups(profile.record)) {
      const studyId = crossProfileStudyIdentity(profile.url, localStudyId, globalStudyIdentities)
      const pages = canonicalStudyPages.get(studyId) ?? new Set<string>()
      pages.add(profile.url)
      canonicalStudyPages.set(studyId, pages)
    }
  }

  if (topology.semanticAlignment.summary.approvedClaims !== analysis.claimAnalyses.length) {
    add(
      'semantic-approved-claim-count-mismatch',
      `semantic=${topology.semanticAlignment.summary.approvedClaims}; analysis=${analysis.claimAnalyses.length}`,
    )
  }
  if (topology.claimBreadth.summary.approvedClaimsWithHumanEvidence !== topology.claimBreadth.claims.length) {
    add(
      'claim-breadth-analyzed-count-mismatch',
      `summary=${topology.claimBreadth.summary.approvedClaimsWithHumanEvidence}; rows=${topology.claimBreadth.claims.length}`,
    )
  }
  if (topology.claimBreadth.summary.overbroadClaims !== topology.claimBreadth.findings.length) {
    add(
      'claim-breadth-finding-count-mismatch',
      `summary=${topology.claimBreadth.summary.overbroadClaims}; rows=${topology.claimBreadth.findings.length}`,
    )
  }
  if (topology.effectCertainty.summary.findings !== topology.effectCertainty.findings.length) {
    add(
      'effect-certainty-finding-count-mismatch',
      `summary=${topology.effectCertainty.summary.findings}; rows=${topology.effectCertainty.findings.length}`,
    )
  }
  if (topology.effectCertainty.summary.highConfidenceFindings !== topology.effectCertainty.highConfidenceFindings.length) {
    add(
      'effect-certainty-high-confidence-count-mismatch',
      `summary=${topology.effectCertainty.summary.highConfidenceFindings}; rows=${topology.effectCertainty.highConfidenceFindings.length}`,
    )
  }
  if (topology.edgeCardinality.summary.claims !== analysis.structuredClaimAnalyses.length) {
    add(
      'edge-cardinality-claim-count-mismatch',
      `edgeCardinality=${topology.edgeCardinality.summary.claims}; analysis=${analysis.structuredClaimAnalyses.length}`,
    )
  }
  if (topology.evidenceIndependenceCoverage.summary.multiStudyApprovedClaims !== approvedMultiStudyClaimKeys.size) {
    add(
      'independence-coverage-claim-count-mismatch',
      `coverage=${topology.evidenceIndependenceCoverage.summary.multiStudyApprovedClaims}; analysis=${approvedMultiStudyClaimKeys.size}`,
    )
  }
  for (const claim of topology.edgeCardinality.duplicateEdgeClaims) {
    add(
      'duplicate-claim-source-edge',
      `${claim.url}::${claim.claimId} · duplicateRefs=${claim.duplicateSourceRefs.join(',')} · duplicateEdges=${claim.duplicateSourceRefCount}`,
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
  for (const claim of topology.claimBreadth.claims) {
    requireProfile('claim-breadth-unknown-profile', claim.url, claim.claimId)
    requireApprovedClaim('claim-breadth-unknown-claim', claim.url, claim.claimId)
  }
  for (const claim of topology.effectCertainty.claims) {
    requireProfile('effect-certainty-unknown-profile', claim.url, claim.claimId)
    requireApprovedClaim('effect-certainty-unknown-claim', claim.url, claim.claimId)
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
  for (const claim of topology.evidenceIndependenceCoverage.claims) {
    const key = claimKey(claim.url, claim.claimId)
    requireApprovedClaim('independence-coverage-unknown-claim', claim.url, claim.claimId)
    if (!approvedMultiStudyClaimKeys.has(key)) {
      add('independence-coverage-non-multistudy-claim', `${claim.url}::${claim.claimId}`)
    }
  }
  for (const gap of researchGapQueue) {
    requireProfile('gap-queue-unknown-profile', gap.url, 'research gap queue')
  }

  if (sourceIntegrity) {
    if (sourceIntegrity.summary.citedStudies !== sourceIntegrity.studies.length) {
      add('source-study-count-mismatch', `summary=${sourceIntegrity.summary.citedStudies}; rows=${sourceIntegrity.studies.length}`)
    }
    if (sourceIntegrity.summary.withdrawn !== sourceIntegrity.withdrawn.length) {
      add('source-withdrawn-count-mismatch', `summary=${sourceIntegrity.summary.withdrawn}; rows=${sourceIntegrity.withdrawn.length}`)
    }

    const seenStudyIds = new Set<string>()
    for (const study of sourceIntegrity.studies) {
      if (seenStudyIds.has(study.studyId)) add('source-duplicate-study-id', study.studyId)
      else seenStudyIds.add(study.studyId)

      const uniquePages = new Set(study.pages)
      if (study.pageCount !== uniquePages.size) {
        add('source-page-count-mismatch', `${study.studyId}: pageCount=${study.pageCount}; pages=${uniquePages.size}`)
      }
      for (const url of uniquePages) requireProfile('source-unknown-profile', url, study.studyId)

      const expectedPages = canonicalStudyPages.get(study.studyId)
      if (!expectedPages) {
        add('source-unexpected-study-id', `${study.studyId} does not exist in canonical profile sources`)
      } else if (!sameStrings(uniquePages, expectedPages)) {
        add(
          'source-profile-ownership-mismatch',
          `${study.studyId}: sourceIntegrity=${[...uniquePages].sort().join(',')}; analysis=${[...expectedPages].sort().join(',')}`,
        )
      }
    }

    for (const studyId of canonicalStudyPages.keys()) {
      if (!seenStudyIds.has(studyId)) add('source-missing-study-id', `${studyId} missing from source integrity`)
    }
  }

  if (citationIntegrity) {
    if (citationIntegrity.sources !== rawSourceCount) {
      add('citation-source-count-mismatch', `citation=${citationIntegrity.sources}; analysis=${rawSourceCount}`)
    }
    const computedBlockingCount = citationIntegrity.blocking.length
      + citationIntegrity.duplicateProfileSources.length
      + citationIntegrity.identifierPairConflicts.length
      + citationIntegrity.conflicts.length
    if (citationIntegrity.blockingCount !== computedBlockingCount) {
      add(
        'citation-blocking-count-mismatch',
        `summary=${citationIntegrity.blockingCount}; computed=${computedBlockingCount}`,
      )
    }
    if (citationIntegrity.passed !== (citationIntegrity.blockingCount === 0)) {
      add('citation-pass-state-mismatch', `passed=${citationIntegrity.passed}; blocking=${citationIntegrity.blockingCount}`)
    }
  }

  const unknownProfileReferences = failures.filter((failure) => failure.kind.includes('unknown-profile')).length
  const unknownClaimReferences = failures.filter((failure) => failure.kind.includes('unknown-claim')).length
  const countMismatches = failures.filter((failure) => failure.kind.includes('mismatch')).length
  const duplicateClaimIds = failures.filter((failure) => failure.kind === 'duplicate-claim-id').length
  const missingClaimIds = failures.filter((failure) => failure.kind === 'missing-claim-id').length
  const duplicateSourceIds = failures.filter((failure) => failure.kind === 'duplicate-source-id').length
  const missingSourceIds = failures.filter((failure) => failure.kind === 'missing-source-id').length
  const duplicateClaimSourceEdges = failures.filter((failure) => failure.kind === 'duplicate-claim-source-edge').length
  const sourceIntegrityFailures = failures.filter((failure) => failure.kind.startsWith('source-')).length
  const citationIntegrityFailures = failures.filter((failure) => failure.kind.startsWith('citation-')).length

  return {
    passed: failures.length === 0,
    failures,
    summary: {
      failures: failures.length,
      unknownProfileReferences,
      unknownClaimReferences,
      countMismatches,
      duplicateClaimIds,
      missingClaimIds,
      duplicateSourceIds,
      missingSourceIds,
      duplicateClaimSourceEdges,
      sourceIntegrityFailures,
      citationIntegrityFailures,
    },
  }
}
