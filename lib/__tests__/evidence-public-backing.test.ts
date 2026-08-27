import { describe, expect, it } from 'vitest'

import { getEvidenceColor, getEvidenceLabel, getEvidenceLetterGrade, getEvidenceTier } from '@/lib/evidence'
import type { RuntimeRecord } from '@/src/types/content'

const incidentClasses = [
  ['no-claims-recorded', 0],
  ['no-human-study-recorded', 0],
  ['single-human-study-for-grade-a', 1],
] as const

describe('public evidence backing semantics', () => {
  const unbacked = {
    slug: 'berberis',
    evidence_grade: null,
    evidence_grade_source: 'A',
    evidence_tier: 'Editorial grade not demonstrated by recorded studies',
    evidence_tier_source: 'Strong Evidence',
    evidence_grade_band: null,
    evidence_grade_backed: false,
    evidence_grade_backing_gap: 'no-human-study-recorded',
  } as RuntimeRecord

  it('fails the public letter badge closed while preserving authored provenance separately', () => {
    expect(getEvidenceLetterGrade(unbacked)).toBe('Unassigned')
    expect(unbacked.evidence_grade).toBeNull()
    expect(unbacked.evidence_grade_source).toBe('A')
    expect(unbacked.evidence_grade_band).toBeNull()
  })

  it('does not publish an explicitly unbacked grade as settled strength', () => {
    expect(getEvidenceTier(unbacked)).toBe('review')
    expect(getEvidenceLabel(unbacked)).toBe('Editorial grade not demonstrated by recorded studies')
    expect(getEvidenceColor(unbacked)).toBe('slate')
  })

  it.each(incidentClasses)('keeps %s fail-closed', (gap, humanStudyCount) => {
    const candidate = {
      ...unbacked,
      evidence_grade_backing_gap: gap,
      evidence_human_study_count: humanStudyCount,
    } as RuntimeRecord
    expect(getEvidenceTier(candidate)).toBe('review')
    expect(getEvidenceLetterGrade(candidate)).toBe('Unassigned')
    expect(getEvidenceLabel(candidate)).not.toMatch(/^(?:strong|moderate) evidence$/i)
  })

  it('also fails closed if legacy public A/Strong fields survive but backing is explicitly false', () => {
    const legacyLeak = {
      ...unbacked,
      evidence_grade: 'A',
      evidence_tier: 'Strong Evidence',
      evidence_grade_band: 'strong',
    } as RuntimeRecord
    expect(getEvidenceTier(legacyLeak)).toBe('review')
    expect(getEvidenceLetterGrade(legacyLeak)).toBe('Unassigned')
    expect(getEvidenceLabel(legacyLeak)).toBe('Editorial grade not demonstrated by recorded studies')
  })

  it('leaves backed grades unchanged', () => {
    const backed = {
      ...unbacked,
      evidence_grade: 'A',
      evidence_tier: 'Strong Evidence',
      evidence_grade_band: 'strong',
      evidence_grade_backed: true,
    } as RuntimeRecord
    expect(getEvidenceTier(backed)).toBe('strong')
    expect(getEvidenceLabel(backed)).toBe('Strong evidence')
    expect(getEvidenceLetterGrade(backed)).toBe('A')
  })
})
