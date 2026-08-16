import { describe, expect, it } from 'vitest'

import {
  type AiCitationReadinessReport,
  validateAiCitationReadinessReport,
} from '../ai-citation-readiness'

function report(): AiCitationReadinessReport {
  return {
    summary: {
      generatedAt: '2026-08-16T00:00:00.000Z',
      researchQualitySource: 'lib/research-quality-analysis.ts',
      profiles: 2,
      matchedResearchProfiles: 1,
      averageScore: 60,
      below50: 1,
      below70: 1,
      contradictions: 1,
      overDependentOnSingleStudy: 1,
      narrativeDominated: 0,
    },
    profiles: [
      {
        slug: 'alpha',
        kind: 'herb',
        score: 40,
        researchUrl: '/herbs/alpha/',
        approvedClaims: 2,
        canonicalStudies: 2,
        citationCompleteness: 0.5,
        primaryHuman: 1,
        systematicReviews: 0,
        narrativeReviews: 0,
        dominantStudySupportedClaimShare: 0.8,
        effectiveStudyCount: 1.2,
        contradiction: true,
        gaps: ['canonical research graph is over-dependent on one study'],
      },
      {
        slug: 'beta',
        kind: 'compound',
        score: 80,
        researchUrl: null,
        approvedClaims: 0,
        canonicalStudies: 0,
        citationCompleteness: 0,
        primaryHuman: 0,
        systematicReviews: 0,
        narrativeReviews: 0,
        dominantStudySupportedClaimShare: 0,
        effectiveStudyCount: 0,
        contradiction: false,
        gaps: ['no canonical research-quality profile match'],
      },
    ],
  }
}

describe('AI citation readiness invariants', () => {
  it('accepts a self-consistent report', () => {
    expect(validateAiCitationReadinessReport(report())).toEqual({ passed: true, failures: [] })
  })

  it('detects summary drift', () => {
    const value = report()
    value.summary.below70 = 2
    const result = validateAiCitationReadinessReport(value)
    expect(result.passed).toBe(false)
    expect(result.failures).toContain('below70: summary=2; rows=1')
  })

  it('detects invalid row ranges', () => {
    const value = report()
    value.profiles[0].score = 101
    value.profiles[1].citationCompleteness = -0.1
    const result = validateAiCitationReadinessReport(value)
    expect(result.passed).toBe(false)
    expect(result.failures.some((failure) => failure.includes('score=101 outside 0..100'))).toBe(true)
    expect(result.failures.some((failure) => failure.includes('citationCompleteness=-0.1 outside 0..1'))).toBe(true)
  })
})
