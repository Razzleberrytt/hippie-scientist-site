import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { ResearchQualityGate } from './research-quality-gate'
import type { ResearchGapItem } from './research-quality-policy'
import type { ResearchQualityTopology } from './research-quality-topology'
import type { ResearchSourceIntegrity } from './research-source-integrity'

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
    duplicateClaimIds: number
    missingClaimIds: number
    duplicateSourceIds: number
    missingSourceIds: number
    sourceIntegrityFailures: number
  }
}

function claimKey(url: string, claimId: string): string {
  return `${url}::${claimId}`
}

function text(value: unknown): string {
  return String(value ?? '').trim()
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

  // Claim/source row IDs are graph identities. Missing or duplicate IDs make
  // downstream maps lossy even when the raw arrays still contain every row.
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
    const seenSources = new Set<string>()
    for (let index = 0; index < sources.length; index += 1) {
      const id = text(sources[index]?.id)
      if (!id) {
        add('missing-source-id', `${profile.url} · sources[${index}]`)
        continue
      }
      if (seenSources.has(id)) add('duplicate-source-id', `${profile.url}::${id}`)
      else seenSources.add(id)
    }
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

  if (sourceIntegrity) {
    if (sourceIntegrity.summary.citedStudies !== sourceIntegrity.studies.length) {
      add('source-study-count-mismatch', `summary=${sourceIntegrity.summary.citedStudies}; rows=${sourceIntegrity.studies.length}`)
    }
    if (sourceIntegrity.summary.withdrawn !== sourceIntegrity.withdrawn.length) {
      add('source-withdrawn-count-mismatch', `summary=${sourceIntegrity.summary.withdrawn}; rows=${sourceIntegrity.withdrawn.length}`)
    }

    const seenPmids = new Set<string>()
    for (const study of sourceIntegrity.studies) {
      if (seenPmids.has(study.pmid)) add('source-duplicate-pmid', study.pmid)
      else seenPmids.add(study.pmid)

      const uniquePages = new Set(study.pages)
      if (study.pageCount !== uniquePages.size) {
        add('source-page-count-mismatch', `${study.pmid}: pageCount=${study.pageCount}; pages=${uniquePages.size}`)
      }
      for (const url of uniquePages) requireProfile('source-unknown-profile', url, `PMID ${study.pmid}`)
    }
  }

  const unknownProfileReferences = failures.filter((failure) => failure.kind.includes('unknown-profile')).length
  const unknownClaimReferences = failures.filter((failure) => failure.kind.includes('unknown-claim')).length
  const countMismatches = failures.filter((failure) => failure.kind.includes('mismatch')).length
  const duplicateClaimIds = failures.filter((failure) => failure.kind === 'duplicate-claim-id').length
  const missingClaimIds = failures.filter((failure) => failure.kind === 'missing-claim-id').length
  const duplicateSourceIds = failures.filter((failure) => failure.kind === 'duplicate-source-id').length
  const missingSourceIds = failures.filter((failure) => failure.kind === 'missing-source-id').length
  const sourceIntegrityFailures = failures.filter((failure) => failure.kind.startsWith('source-')).length

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
      sourceIntegrityFailures,
    },
  }
}
