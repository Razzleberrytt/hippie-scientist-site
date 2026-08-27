import { describe, expect, it } from 'vitest'

import { getEvidenceLabel, getEvidenceLetterGrade, getEvidenceTier } from '@/lib/evidence'
import { buildProfileSummary } from '@/lib/profile-summary'
import type { RuntimeRecord } from '@/src/types/content'

const unbackedGradeA = {
  slug: 'berberis',
  name: 'Berberis',
  evidence_grade: '',
  evidence_grade_source: 'A',
  evidence_tier: '',
  evidence_tier_source: 'Strong Evidence',
  evidence_grade_backed: false,
  evidence_grade_backing_gap: 'no-human-study-recorded',
  evidence_rationale: 'Strongest recorded design is a narrative review, drawn from 3 recorded studies, none of which measured an outcome in people.',
} as RuntimeRecord

describe('unbacked evidence presentation contract', () => {
  it('fails closed for shared UI/search/schema evidence helpers', () => {
    expect(getEvidenceTier(unbackedGradeA)).toBe('review')
    expect(getEvidenceLabel(unbackedGradeA)).toBe('Needs review')
    expect(getEvidenceLetterGrade(unbackedGradeA)).toBe('Unassigned')
  })

  it('does not reconstruct strong evidence from preserved authored provenance', () => {
    const legacyShape = {
      ...unbackedGradeA,
      evidence_grade: 'A',
      evidence_tier: 'Strong Evidence',
    }
    expect(getEvidenceTier(legacyShape)).toBe('review')
    expect(getEvidenceLabel(legacyShape)).not.toMatch(/strong evidence/i)
    expect(getEvidenceLetterGrade(legacyShape)).toBe('Unassigned')
  })

  it('composes a provenance-aware summary without presenting authored A as settled strength', () => {
    const summary = buildProfileSummary(unbackedGradeA as unknown as Record<string, unknown>)
    expect(summary).toContain('authored Grade A rating')
    expect(summary).toContain('recorded studies do not currently demonstrate that strength')
    expect(summary).not.toMatch(/Grade A rating\s*[—-]\s*strong evidence/i)
  })

  it.each([
    ['no-claims-recorded', 0],
    ['no-human-study-recorded', 0],
    ['single-human-study-for-grade-a', 1],
  ])('keeps incident class %s non-settled', (gap, humanStudyCount) => {
    const candidate = {
      ...unbackedGradeA,
      evidence_grade_backing_gap: gap,
      evidence_human_study_count: humanStudyCount,
    }
    expect(getEvidenceTier(candidate)).toBe('review')
    expect(getEvidenceLetterGrade(candidate)).toBe('Unassigned')
  })
})
