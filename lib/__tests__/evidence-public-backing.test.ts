import { describe, expect, it } from 'vitest'

import { getEvidenceColor, getEvidenceLabel, getEvidenceLetterGrade, getEvidenceTier } from '@/lib/evidence'
import type { RuntimeRecord } from '@/src/types/content'

describe('public evidence backing semantics', () => {
  const unbacked = {
    slug: 'berberis',
    evidence_grade: 'A',
    evidence_tier: 'Strong Evidence',
    evidence_grade_backed: false,
  } as RuntimeRecord

  it('preserves the authored grade for provenance', () => {
    expect(getEvidenceLetterGrade(unbacked)).toBe('A')
  })

  it('does not publish an explicitly unbacked grade as settled strength', () => {
    expect(getEvidenceTier(unbacked)).toBe('review')
    expect(getEvidenceLabel(unbacked)).toBe('Editorial grade not demonstrated by recorded studies')
    expect(getEvidenceColor(unbacked)).toBe('slate')
  })

  it('leaves backed grades unchanged', () => {
    const backed = { ...unbacked, evidence_grade_backed: true } as RuntimeRecord
    expect(getEvidenceTier(backed)).toBe('strong')
    expect(getEvidenceLabel(backed)).toBe('Strong evidence')
    expect(getEvidenceLetterGrade(backed)).toBe('A')
  })
})
