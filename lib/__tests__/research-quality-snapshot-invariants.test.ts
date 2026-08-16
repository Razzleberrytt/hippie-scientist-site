import { describe, expect, it } from 'vitest'

import type { ResearchQualityAnalysis } from '../research-quality-analysis'
import type { ResearchQualityGate } from '../research-quality-gate'
import type { ResearchGapItem } from '../research-quality-policy'
import { validateResearchQualitySnapshotInvariants } from '../research-quality-snapshot-invariants'
import type { ResearchQualityTopology } from '../research-quality-topology'

function fixtures() {
  const analysis = {
    profileAnalyses: [{ url: '/herbs/example' }],
    claimAnalyses: [{ url: '/herbs/example', claimId: 'claim-1' }],
  } as unknown as ResearchQualityAnalysis

  const topology = {
    semanticAlignment: {
      summary: { approvedClaims: 1 },
      findings: [],
      concentrationFindings: [],
    },
    claimLanguageCalibration: { directEvidenceFindings: [] },
    claimCitationMetadata: { claims: [] },
    claimEvidenceDiversity: [],
    claimProvenanceIndependence: [],
    claimEvidenceAge: [],
  } as unknown as ResearchQualityTopology

  const gate = {
    passed: true,
    structuralFailures: [],
    severeStudyClassConflicts: [],
    summary: {
      structuralFailures: 0,
      unsupportedApprovedClaims: 0,
      danglingClaimSourceEdges: 0,
      severeStudyClassConflicts: 0,
      blockingFailures: 0,
    },
  } as ResearchQualityGate

  const queue: ResearchGapItem[] = []
  return { analysis, topology, gate, queue }
}

describe('research quality snapshot invariants', () => {
  it('accepts a self-consistent canonical snapshot', () => {
    const { analysis, topology, gate, queue } = fixtures()
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue)
    expect(report.passed).toBe(true)
    expect(report.summary.failures).toBe(0)
  })

  it('detects semantic approved-claim count drift', () => {
    const { analysis, topology, gate, queue } = fixtures()
    topology.semanticAlignment.summary.approvedClaims = 2
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue)
    expect(report.passed).toBe(false)
    expect(report.failures.map((failure) => failure.kind)).toContain('semantic-approved-claim-count-mismatch')
  })

  it('detects derived findings that reference an unknown approved claim', () => {
    const { analysis, topology, gate, queue } = fixtures()
    topology.claimCitationMetadata.claims = [
      { url: '/herbs/example', claimId: 'missing-claim' },
    ] as typeof topology.claimCitationMetadata.claims
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue)
    expect(report.passed).toBe(false)
    expect(report.summary.unknownClaimReferences).toBe(1)
  })

  it('detects remediation rows that reference an unknown profile', () => {
    const { analysis, topology, gate } = fixtures()
    const queue = [{ url: '/herbs/missing' }] as ResearchGapItem[]
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue)
    expect(report.passed).toBe(false)
    expect(report.summary.unknownProfileReferences).toBe(1)
  })

  it('detects gate summary and pass-state drift', () => {
    const { analysis, topology, gate, queue } = fixtures()
    gate.summary.blockingFailures = 1
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue)
    const kinds = report.failures.map((failure) => failure.kind)
    expect(kinds).toContain('gate-blocking-count-mismatch')
    expect(kinds).toContain('gate-pass-state-mismatch')
  })
})
