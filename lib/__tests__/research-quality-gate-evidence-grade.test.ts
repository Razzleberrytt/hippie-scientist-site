import { describe, expect, it } from 'vitest'

import type { EvidenceGradeConsistencyReport, EvidenceGradeFinding } from '@/lib/evidence-grade-consistency'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'
import { buildResearchQualityGate } from '@/lib/research-quality-gate'
import type { ResearchQualityTopology } from '@/lib/research-quality-topology'

const analysis = {
  claimAnalyses: [],
} as unknown as ResearchQualityAnalysis

const topology = {
  studyClassConflicts: { severeConflicts: [] },
} as unknown as ResearchQualityTopology

function finding(grade: 'A' | 'B', issue: string): EvidenceGradeFinding {
  return {
    kind: 'herb',
    slug: grade === 'A' ? 'strong' : 'moderate',
    url: grade === 'A' ? '/herbs/strong/' : '/herbs/moderate/',
    indexable: true,
    rawGrade: grade,
    rawTier: grade === 'A' ? 'Strong Evidence' : 'Moderate Evidence',
    canonicalGrade: grade,
    gradeLetter: grade,
    gradeBand: grade === 'A' ? 'strong' : 'moderate',
    tierBand: grade === 'A' ? 'strong' : 'moderate',
    distance: 0,
    pseudoMultiStudyClaimCount: 1,
    highConfidencePseudoMultiStudyClaimCount: grade === 'A' ? 1 : 0,
    collapsedPublicationCount: 1,
    overDependentOnSingleUnderlyingStudy: true,
    newlyOverDependentAfterIndependenceAdjustment: true,
    dominantUnderlyingStudySupportedClaimShare: 0.75,
    effectiveUnderlyingStudyCount: 1.6,
    issues: [issue],
  }
}

function gradeReport(options: {
  contradictions?: EvidenceGradeFinding[]
  warnings?: EvidenceGradeFinding[]
} = {}): EvidenceGradeConsistencyReport {
  const topologyContradictions = options.contradictions ?? []
  const topologyWarnings = options.warnings ?? []
  const findings = [...topologyContradictions, ...topologyWarnings]
  return {
    generatedAt: new Date(0).toISOString(),
    canonicalEnum: ['A', 'B', 'C', 'D', 'Avoid/Insufficient'],
    totals: {
      profiles: findings.length,
      indexable: findings.length,
      flagged: findings.length,
      flaggedIndexable: findings.length,
      contradictionsIndexable: topologyContradictions.length,
      topologyContradictionsIndexable: topologyContradictions.length,
      topologyWarningsIndexable: topologyWarnings.length,
      gradeCardRenderable: 0,
      invalidPublishedGrades: 0,
    },
    issueCounts: {},
    contradictions: topologyContradictions,
    topologyContradictions,
    topologyWarnings,
    invalid: [],
    findings,
  }
}

describe('research quality gate evidence-grade enforcement', () => {
  it('blocks a topology-backed Grade A contradiction', () => {
    const contradiction = finding('A', 'strong-grade-with-underlying-study-concentration')
    const gate = buildResearchQualityGate(
      analysis,
      topology,
      gradeReport({ contradictions: [contradiction] }),
    )

    expect(gate.passed).toBe(false)
    expect(gate.evidenceGradeContradictions).toEqual([contradiction])
    expect(gate.summary).toMatchObject({
      structuralFailures: 0,
      severeStudyClassConflicts: 0,
      evidenceGradeContradictions: 1,
      blockingFailures: 1,
    })
  })

  it('keeps Grade B topology warnings advisory', () => {
    const warning = finding('B', 'moderate-grade-with-underlying-study-concentration')
    const gate = buildResearchQualityGate(
      analysis,
      topology,
      gradeReport({ warnings: [warning] }),
    )

    expect(gate.passed).toBe(true)
    expect(gate.evidenceGradeContradictions).toEqual([])
    expect(gate.summary.evidenceGradeContradictions).toBe(0)
    expect(gate.summary.blockingFailures).toBe(0)
  })

  it('preserves the low-level gate behavior when grade consistency is omitted', () => {
    const gate = buildResearchQualityGate(analysis, topology)
    expect(gate.passed).toBe(true)
    expect(gate.evidenceGradeContradictions).toEqual([])
  })
})
