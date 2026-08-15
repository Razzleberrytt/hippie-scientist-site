import { describe, expect, it } from 'vitest'
import { getProfilePresentationPolicy, getProfileResearchMaturity } from '@/lib/profile-presentation-policy'

describe('profile presentation policy', () => {
  it('uses richer presentation only for mature evidence', () => {
    expect(getProfileResearchMaturity({ evidence_grade: 'A', human_study_count: 4 })).toBe('established')
    expect(getProfilePresentationPolicy({ evidence_grade: 'A', human_study_count: 4 }).templateDepth).toBe('rich')
  })

  it('keeps low-evidence profiles short', () => {
    const policy = getProfilePresentationPolicy({ evidence_grade: 'D', human_study_count: 0 })
    expect(policy.templateDepth).toBe('short')
    expect(policy.maxRelatedLinks).toBe(4)
  })

  it('keeps decision-useful sections above mechanism detail for every maturity tier', () => {
    for (const record of [
      { evidence_grade: 'A', human_study_count: 5 },
      { evidence_grade: 'B', human_study_count: 2 },
      { evidence_grade: 'C', human_study_count: 1 },
      { evidence_grade: 'D', human_study_count: 0 },
    ]) {
      const policy = getProfilePresentationPolicy(record)
      expect(policy.keepNearTop).toEqual(['conclusion', 'safety', 'evidence', 'dose'])
      expect(policy.collapseMechanisms).toBe(true)
    }
  })
})
