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
        sources: [{ id: 'source-1', pmid: '123' }],
      },
    }],
    profileAnalyses: [{ url: '/herbs/example' }],
    claimAnalyses: [{ url: '/herbs/example', claimId: 'claim-1' }],
    structuredClaimAnalyses: [],
  } as unknown as ResearchQualityAnalysis

  const topology = {
    semanticAlignment: {
      summary: { approvedClaims: 1 },
      findings: [],
      concentrationFindings: [],
    },
    claimBreadth: {
      summary: { approvedClaimsWithHumanEvidence: 0, overbroadClaims: 0 },
      claims: [],
      findings: [],
    },
    edgeCardinality: {
      summary: { claims: 0 },
      duplicateEdgeClaims: [],
    },
    evidenceIndependenceCoverage: {
      summary: { multiStudyApprovedClaims: 0 },
      claims: [],
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

  const queue: ResearchGapItem[] = []
  const sourceIntegrity = {
    summary: { citedStudies: 1, withdrawn: 0 },
    withdrawn: [],
    studies: [{ studyId: 'pmid:123', pmid: '123', doi: '', pageCount: 1, pages: ['/herbs/example'] }],
  } as unknown as ResearchSourceIntegrity
  const citationIntegrity = {
    sources: 1,
    blockingCount: 0,
    blocking: [],
    duplicateProfileSources: [],
    identifierPairConflicts: [],
    conflicts: [],
    passed: true,
  }

  return { analysis, topology, gate, queue, sourceIntegrity, citationIntegrity }
}

describe('research quality snapshot invariants', () => {
  it('accepts a self-consistent canonical snapshot', () => {
    const { analysis, topology, gate, queue, sourceIntegrity, citationIntegrity } = fixtures()
    const report = validateResearchQualitySnapshotInvariants(
      analysis,
      topology,
      gate,
      queue,
      sourceIntegrity,
      citationIntegrity,
    )
    expect(report.passed).toBe(true)
    expect(report.summary.failures).toBe(0)
  })

  it('accepts a legitimate Grade A gate blocker as normal gate state', () => {
    const { analysis, topology, gate, queue, sourceIntegrity, citationIntegrity } = fixtures()
    gate.passed = false
    gate.evidenceGradeContradictions = [{ url: '/herbs/example' }] as never
    gate.summary.evidenceGradeContradictions = 1
    gate.summary.blockingFailures = 1

    const report = validateResearchQualitySnapshotInvariants(
      analysis,
      topology,
      gate,
      queue,
      sourceIntegrity,
      citationIntegrity,
    )
    expect(report.passed).toBe(true)
    expect(report.failures).toEqual([])
  })

  it('accepts DOI-only and profile-local fallback source identities', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    analysis.profiles[0].record.sources = [
      { id: 'source-1', pmid: '123' },
      { id: 'doi-only', doi: '10.1000/example' },
      { id: 'fallback' },
    ]
    sourceIntegrity.studies = [
      sourceIntegrity.studies[0],
      { studyId: 'doi:10.1000/example', pmid: '', doi: '10.1000/example', pageCount: 1, pages: ['/herbs/example'] },
      { studyId: '/herbs/example::source-ref:fallback', pmid: '', doi: '', pageCount: 1, pages: ['/herbs/example'] },
    ] as typeof sourceIntegrity.studies
    sourceIntegrity.summary.citedStudies = 3

    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.passed).toBe(true)
    expect(report.summary.sourceIntegrityFailures).toBe(0)
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

  it('detects evidence-grade blocker count drift', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    gate.summary.evidenceGradeContradictions = 1
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.failures.map((failure) => failure.kind)).toContain('gate-evidence-grade-count-mismatch')
  })

  it('detects source-integrity count drift', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    sourceIntegrity.summary.citedStudies = 2
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.passed).toBe(false)
    expect(report.failures.map((failure) => failure.kind)).toContain('source-study-count-mismatch')
  })

  it('detects source rows that reference unknown profiles', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    sourceIntegrity.studies[0].pages = ['/herbs/missing']
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.passed).toBe(false)
    expect(report.failures.map((failure) => failure.kind)).toContain('source-unknown-profile')
  })

  it('detects duplicate canonical source identities and page-count drift', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    sourceIntegrity.studies.push({ ...sourceIntegrity.studies[0] })
    sourceIntegrity.summary.citedStudies = 2
    sourceIntegrity.studies[0].pageCount = 2
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    const kinds = report.failures.map((failure) => failure.kind)
    expect(kinds).toContain('source-duplicate-study-id')
    expect(kinds).toContain('source-page-count-mismatch')
  })

  it('detects duplicate and missing source row IDs in raw profiles', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    analysis.profiles[0].record.sources = [
      { id: 'source-1', pmid: '123' },
      { id: 'source-1', pmid: '123' },
      { id: '', pmid: '123' },
    ]
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    const kinds = report.failures.map((failure) => failure.kind)
    expect(kinds).toContain('duplicate-source-id')
    expect(kinds).toContain('missing-source-id')
  })

  it('detects source-integrity studies that do not exist in canonical profile sources', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    sourceIntegrity.studies[0].studyId = 'pmid:999'
    sourceIntegrity.studies[0].pmid = '999'
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    const kinds = report.failures.map((failure) => failure.kind)
    expect(kinds).toContain('source-unexpected-study-id')
    expect(kinds).toContain('source-missing-study-id')
  })

  it('detects source-integrity ownership drift across profiles', () => {
    const { analysis, topology, gate, queue, sourceIntegrity } = fixtures()
    analysis.profiles.push({
      url: '/herbs/second',
      record: { claimMap: [], sources: [{ id: 'source-2', pmid: '123' }] },
    } as typeof analysis.profiles[number])
    analysis.profileAnalyses.push({ url: '/herbs/second' } as typeof analysis.profileAnalyses[number])
    const report = validateResearchQualitySnapshotInvariants(analysis, topology, gate, queue, sourceIntegrity)
    expect(report.passed).toBe(false)
    expect(report.failures.map((failure) => failure.kind)).toContain('source-profile-ownership-mismatch')
  })

  it('detects citation source cardinality drift', () => {
    const { analysis, topology, gate, queue, sourceIntegrity, citationIntegrity } = fixtures()
    citationIntegrity.sources = 2
    const report = validateResearchQualitySnapshotInvariants(
      analysis,
      topology,
      gate,
      queue,
      sourceIntegrity,
      citationIntegrity,
    )
    expect(report.failures.map((failure) => failure.kind)).toContain('citation-source-count-mismatch')
    expect(report.summary.citationIntegrityFailures).toBe(1)
  })

  it('detects citation blocking-count drift', () => {
    const { analysis, topology, gate, queue, sourceIntegrity, citationIntegrity } = fixtures()
    citationIntegrity.blocking.push({ kind: 'invalid-pmid' } as never)
    const report = validateResearchQualitySnapshotInvariants(
      analysis,
      topology,
      gate,
      queue,
      sourceIntegrity,
      citationIntegrity,
    )
    expect(report.failures.map((failure) => failure.kind)).toContain('citation-blocking-count-mismatch')
  })

  it('detects citation pass-state drift', () => {
    const { analysis, topology, gate, queue, sourceIntegrity, citationIntegrity } = fixtures()
    citationIntegrity.blockingCount = 1
    citationIntegrity.blocking.push({ kind: 'invalid-pmid' } as never)
    citationIntegrity.passed = true
    const report = validateResearchQualitySnapshotInvariants(
      analysis,
      topology,
      gate,
      queue,
      sourceIntegrity,
      citationIntegrity,
    )
    expect(report.failures.map((failure) => failure.kind)).toContain('citation-pass-state-mismatch')
  })
})
