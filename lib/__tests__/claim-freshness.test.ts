import { describe, expect, it } from 'vitest'

import {
  buildAnnualEvidenceHistory,
  createEvidenceVersionSnapshot,
  distributionEligibility,
  evidenceChangedBadge,
  findSupersedingReviews,
  routeExternalUpdate,
  scoreClaimFreshness,
  surfaceUpdatedReviews,
  validateGradeChange,
} from '@/lib/evidence/claim-freshness'

describe('claim freshness', () => {
  it('prioritizes stale evidence more aggressively in fast-moving fields', () => {
    const evidence = [
      { id: 'trial-1', publishedAt: '2017-01-01', sourceType: 'randomized-trial' as const },
      { id: 'review-1', publishedAt: '2018-01-01', sourceType: 'systematic-review' as const },
    ]

    const slow = scoreClaimFreshness({ claimId: 'claim-1', evaluatedAt: '2026-01-01', researchVelocity: 'slow', evidence })
    const fast = scoreClaimFreshness({ claimId: 'claim-1', evaluatedAt: '2026-01-01', researchVelocity: 'fast', evidence })

    expect(fast.score).toBeLessThan(slow.score)
    expect(fast.staleEvidenceCount).toBeGreaterThan(slow.staleEvidenceCount)
  })

  it('does not automatically invalidate clinically relevant older evidence', () => {
    const result = scoreClaimFreshness({
      claimId: 'claim-2',
      evaluatedAt: '2026-01-01',
      researchVelocity: 'fast',
      evidence: [
        {
          id: 'classic-trial',
          publishedAt: '2010-01-01',
          sourceType: 'randomized-trial',
          clinicallyRelevant: true,
        },
      ],
    })

    expect(result.score).toBeGreaterThan(0)
    expect(result.reasons.join(' ')).toContain('clinically relevant')
  })

  it('surfaces newer systematic reviews beside older evidence', () => {
    const evidence = [
      {
        id: 'trial-old',
        publishedAt: '2018-01-01',
        sourceType: 'randomized-trial' as const,
        ingredientIds: ['ashwagandha'],
        outcomeIds: ['stress'],
      },
      {
        id: 'review-new',
        publishedAt: '2025-01-01',
        sourceType: 'systematic-review' as const,
        ingredientIds: ['ashwagandha'],
        outcomeIds: ['stress'],
      },
      {
        id: 'review-old',
        publishedAt: '2020-01-01',
        sourceType: 'systematic-review' as const,
        ingredientIds: ['ashwagandha'],
        outcomeIds: ['stress'],
      },
    ]

    expect(findSupersedingReviews(evidence)).toContainEqual({ evidenceId: 'trial-old', supersedingReviewId: 'review-new' })
    expect(surfaceUpdatedReviews(evidence).map((item) => item.id)).toEqual(['review-new', 'review-old'])
  })
})

describe('external evidence change governance', () => {
  it('routes FDA safety updates to urgent human review without automatic rewriting', () => {
    const item = routeExternalUpdate({
      id: 'fda-1',
      authority: 'FDA',
      ingredientIds: ['ingredient-1'],
      kind: 'safety',
      publishedAt: '2026-01-01',
      title: 'Safety communication',
      safetyRelevant: true,
    })

    expect(item).toMatchObject({
      priority: 'urgent',
      requiresHumanReview: true,
      allowAutomaticConclusionRewrite: false,
    })
  })

  it('routes contradictory systematic reviews to urgent review', () => {
    expect(routeExternalUpdate({
      id: 'review-contradiction',
      ingredientIds: ['ingredient-1'],
      kind: 'systematic-review',
      publishedAt: '2026-01-01',
      title: 'Updated review',
      contradictsCurrentConclusion: true,
    })?.priority).toBe('urgent')
  })
})

describe('evidence version history', () => {
  const previous = createEvidenceVersionSnapshot({
    claimId: 'claim-history',
    ingredientId: 'ingredient-1',
    grade: 'B',
    createdAt: '2025-01-01T00:00:00Z',
    gradingVersion: 'v1',
    studyIds: ['s1'],
    triggeredByStudyIds: [],
  })

  const next = createEvidenceVersionSnapshot({
    claimId: 'claim-history',
    ingredientId: 'ingredient-1',
    grade: 'D',
    createdAt: '2026-01-01T00:00:00Z',
    gradingVersion: 'v1',
    studyIds: ['s1', 's2'],
    triggeredByStudyIds: ['s2'],
    previousVersionId: previous.versionId,
    changeReason: 'A newer review materially changed confidence.',
  })

  it('requires traceable triggers for grade changes', () => {
    expect(validateGradeChange(previous, next)).toEqual({ valid: true, errors: [] })
  })

  it('exposes change badges and distribution eligibility for major changes', () => {
    expect(evidenceChangedBadge(previous, next)).toMatchObject({ label: 'Evidence changed', previousGrade: 'B', currentGrade: 'D', major: true })
    expect(distributionEligibility(previous, next)).toEqual({ newsletter: true, pressOutreach: true, socialDistribution: true })
  })

  it('builds annual evidence histories without deleting old scores', () => {
    const history = buildAnnualEvidenceHistory([next, previous])
    expect(history.map((item) => item.year)).toEqual([2025, 2026])
    expect(history.flatMap((item) => item.snapshots).map((item) => item.grade)).toEqual(['B', 'D'])
  })
})
