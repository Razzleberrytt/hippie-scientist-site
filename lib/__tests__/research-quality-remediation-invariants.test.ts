import { describe, expect, it } from 'vitest'

import type { ResearchQualityGate } from '../research-quality-gate'
import type { ResearchGapItem } from '../research-quality-policy'
import { EVIDENCE_GRADE_BLOCKER_REASON } from '../research-quality-remediation'
import { validateResearchRemediationInvariants } from '../research-quality-remediation-invariants'

function gate(urls: string[]): ResearchQualityGate {
  return {
    passed: urls.length === 0,
    structuralFailures: [],
    severeStudyClassConflicts: [],
    evidenceGradeContradictions: urls.map((url) => ({ url }) as never),
    summary: {
      structuralFailures: 0,
      unsupportedApprovedClaims: 0,
      danglingClaimSourceEdges: 0,
      severeStudyClassConflicts: 0,
      evidenceGradeContradictions: urls.length,
      blockingFailures: urls.length,
    },
  }
}

function queue(urls: string[]): ResearchGapItem[] {
  return urls.map((url) => ({
    url,
    score: 100,
    rawScore: 100,
    dimensionScores: { structural: 100 },
    dimensionRawScores: { structural: 100 },
    cappedDimensions: [],
    reasons: [{ kind: EVIDENCE_GRADE_BLOCKER_REASON, dimension: 'structural', weight: 100 }],
    reasonCounts: { [EVIDENCE_GRADE_BLOCKER_REASON]: 1 },
  }))
}

describe('research gate/remediation invariants', () => {
  it('accepts one remediation target for every grade blocker', () => {
    expect(validateResearchRemediationInvariants(gate(['/herbs/a/']), queue(['/herbs/a/'])).passed).toBe(true)
  })

  it('detects a grade blocker with no remediation target', () => {
    const report = validateResearchRemediationInvariants(gate(['/herbs/a/']), [])
    expect(report.passed).toBe(false)
    expect(report.failures).toContainEqual({ kind: 'missing-grade-blocker-remediation', url: '/herbs/a/' })
  })

  it('detects an orphan remediation blocker with no gate contradiction', () => {
    const report = validateResearchRemediationInvariants(gate([]), queue(['/herbs/a/']))
    expect(report.passed).toBe(false)
    expect(report.failures).toContainEqual({ kind: 'orphan-grade-blocker-remediation', url: '/herbs/a/' })
  })
})
