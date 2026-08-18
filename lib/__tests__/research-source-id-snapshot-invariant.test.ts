import { describe, expect, it, vi } from 'vitest'

vi.mock('../research-effect-certainty-snapshot-invariants', () => ({
  validateEffectCertaintySnapshotInvariants: () => [],
}))
vi.mock('../research-directional-consistency-snapshot-invariants', () => ({
  validateDirectionalConsistencySnapshotInvariants: () => [],
}))
vi.mock('../research-underlying-study-snapshot-invariants', () => ({
  validateUnderlyingStudySnapshotInvariants: () => [],
}))

import type { ResearchQualityAnalysis } from '../research-quality-analysis'
import type { ResearchQualityGate } from '../research-quality-gate'
import { validateResearchQualitySnapshotInvariants } from '../research-quality-snapshot-invariants'
import type { ResearchQualityTopology } from '../research-quality-topology'

function fixture(source: Record<string, unknown>) {
  const analysis = {
    profiles: [{
      kind: 'herbs',
      url: '/herbs/example/',
      file: 'example.json',
      record: { slug: 'example', sources: [source], claimMap: [] },
    }],
    profileAnalyses: [{ url: '/herbs/example/' }],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
  } as unknown as ResearchQualityAnalysis

  const topology = {
    semanticAlignment: { summary: { approvedClaims: 0 }, findings: [], concentrationFindings: [] },
    claimBreadth: { summary: { approvedClaimsWithHumanEvidence: 0, overbroadClaims: 0 }, claims: [], findings: [] },
    edgeCardinality: { summary: { claims: 0 }, duplicateEdgeClaims: [] },
    evidenceIndependenceCoverage: { summary: { multiStudyApprovedClaims: 0 }, claims: [] },
    claimLanguageCalibration: { directEvidenceFindings: [] },
    claimCitationMetadata: { claims: [] },
    claimEvidenceDiversity: [],
    claimProvenanceIndependence: [],
    claimEvidenceAge: [],
    // Required on a real topology (research-quality-topology builds it for every
    // run) and dereferenced unguarded by the snapshot validator. The `as unknown`
    // cast below hides that from the compiler, so omitting it turned these cases
    // into a TypeError instead of the assertion they are written to make.
    selectiveOutcomeReporting: {
      summary: {
        approvedOutcomeClaims: 0,
        assessableClaims: 0,
        findings: 0,
        highConfidenceFindings: 0,
        selectiveOutcomeRisks: 0,
        explicitOutcomeSwitchRisks: 0,
      },
      claims: [],
      findings: [],
      highConfidenceFindings: [],
    },
  } as unknown as ResearchQualityTopology

  const gate = {
    passed: true,
    structuralFailures: [],
    severeStudyClassConflicts: [],
    evidenceGradeContradictions: [],
    summary: {
      structuralFailures: 0,
      unsupportedApprovedClaims: 0,
      danglingClaimSourceEdges: 0,
      severeStudyClassConflicts: 0,
      evidenceGradeContradictions: 0,
      blockingFailures: 0,
    },
  } as ResearchQualityGate

  return { analysis, topology, gate }
}

describe('research snapshot source ID invariants', () => {
  it('allows an identifier-less legacy inventory source that cannot participate in claim edges', () => {
    const { analysis, topology, gate } = fixture({ title: 'Legacy bibliography row', url: 'https://example.com/reference' })
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, [])

    expect(report.passed).toBe(true)
    expect(report.summary.missingSourceIds).toBe(0)
  })

  it('still detects normalization drift when a stable PMID exists without a source ID', () => {
    const { analysis, topology, gate } = fixture({ title: 'Identified study', pmid: '123' })
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, [])

    expect(report.passed).toBe(false)
    expect(report.failures.map((failure) => failure.kind)).toContain('missing-source-id')
  })
})
