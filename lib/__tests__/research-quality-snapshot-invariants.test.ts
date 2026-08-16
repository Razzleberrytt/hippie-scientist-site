import { describe, expect, it } from 'vitest'

import type { ResearchQualityAnalysis } from '../research-quality-analysis'
import type { ResearchQualityGate } from '../research-quality-gate'
import type { ResearchGapItem } from '../research-quality-policy'
import { validateResearchQualitySnapshotInvariants } from '../research-quality-snapshot-invariants'
import type { ResearchQualityTopology } from '../research-quality-topology'
import type { ResearchSourceIntegrity } from '../research-source-integrity'

function fixtures() {
  const analysis = {
    profiles: [{
      url: '/herbs/example',
      record: {
        claimMap: [{ id: 'claim-1' }],
        sources: [{ id: 'source-1' }],
      },
    }],
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
  const sourceIntegrity = {
    summary: { citedStudies: 1, withdrawn: 0 },
    withdrawn: [],
    studies: [{ pmid: '123', pageCount: 1, pages: ['/herbs/example'] }],
  } as unknown as ResearchSourceIntegrity

  return { analysis, topology, gate, queue, sourceIntegrity }
}

describe('research quality snapshot invariants', () => {
  it('accepts a self-consistent canonical snapshot', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.passed).toBe(true)
    expect(report.summary.failures).toBe(0)
  })

  it('detects semantic approved-claim count drift', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    topology.semanticAlignment.summary.approvedClaims = 2
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.passed).toBe(false)
    expect(report.failures.map((failure) => failure.kind)).toContain('semantic-approved-claim-count-mismatch')
  })

  it('detects derived findings that reference an unknown approved claim', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    topology.claimCitationMetadata.claims = [
      { url: '/herbs/example', claimId: 'missing-claim' },
    ] as typeof topology.claimCitationMetadata.claims
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.passed).toBe(false)
    expect(report.summary.unknownClaimReferences).toBe(1)
  })

  it('detects remediation rows that reference an unknown profile', () => {
    const { analysis, topology, gate, sourceIntegrity } = fixtures()
    const queue = [{ url: '/herbs/missing' }] as ResearchGapItem[]
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.passed).toBe(false)
    expect(report.summary.unknownProfileReferences).toBe(1)
  })

  it('detects gate summary and pass-state drift', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    gate.summary.blockingFailures = 1
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    const kinds = report.failures.map((failure) => failure.kind)
    expect(kinds).toContain('gate-blocking-count-mismatch')
    expect(kinds).toContain('gate-pass-state-mismatch')
  })

  it('detects source-integrity count drift', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    sourceIntegrity.summary.citedStudies = 2
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.passed).toBe(false)
    expect(report.failures.map((failure) => failure.kind)).toContain('source-study-count-mismatch')
    expect(report.summary.sourceIntegrityFailures).toBe(1)
  })

  it('detects source rows that reference unknown profiles', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    sourceIntegrity.studies[0].pages = ['/herbs/missing']
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.passed).toBe(false)
    expect(report.failures.map((failure) => failure.kind)).toContain('source-unknown-profile')
  })

  it('detects duplicate source identities and page-count drift', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    sourceIntegrity.studies.push({ ...sourceIntegrity.studies[0] })
    sourceIntegrity.summary.citedStudies = 2
    sourceIntegrity.studies[0].pageCount = 2
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    const kinds = report.failures.map((failure) => failure.kind)
    expect(kinds).toContain('source-duplicate-pmid')
    expect(kinds).toContain('source-page-count-mismatch')
  })

  it('detects duplicate and missing source row IDs in raw profiles', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    analysis.profiles[0].record.sources = [{ id: 'source-1' }, { id: 'source-1' }, { id: '' }]
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    const kinds = report.failures.map((failure) => failure.kind)
    expect(kinds).toContain('duplicate-source-id')
    expect(kinds).toContain('missing-source-id')
  })
})
