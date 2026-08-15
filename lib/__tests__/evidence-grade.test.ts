import { describe, expect, it } from 'vitest'

import {
  bandFromEvidenceTier,
  gradeTierDistance,
  normalizeEvidenceGrade,
} from '@/lib/evidence-grade'

/**
 * Every value below appears verbatim in the current `evidence_grade` export.
 * The normalizer decides what letter a reader sees in the evidence badge, so a
 * regression here changes the stated strength of evidence on live pages.
 */

describe('normalizeEvidenceGrade', () => {
  it('upper-cases bare letter grades, which is the most common real value', () => {
    // 218 herb records carry a lowercase "c"; before normalization these fell
    // through the styling map and rendered as a generic "Grade c".
    expect(normalizeEvidenceGrade('c')).toMatchObject({ letter: 'C', band: 'limited', canonical: true })
    expect(normalizeEvidenceGrade('a')).toMatchObject({ letter: 'A', band: 'strong' })
    expect(normalizeEvidenceGrade('B')).toMatchObject({ letter: 'B', band: 'moderate' })
    expect(normalizeEvidenceGrade('D')).toMatchObject({ letter: 'D', band: 'preliminary' })
  })

  it('accepts +/- modifiers without losing the base letter', () => {
    expect(normalizeEvidenceGrade('C+').letter).toBe('C')
    expect(normalizeEvidenceGrade('b+').letter).toBe('B')
    expect(normalizeEvidenceGrade('B-').letter).toBe('B')
    expect(normalizeEvidenceGrade('D+').letter).toBe('D')
  })

  it('maps descriptive phrases onto a band and keeps the original wording', () => {
    const strong = normalizeEvidenceGrade('Strong drug evidence')
    expect(strong.band).toBe('strong')
    expect(strong.letter).toBe('A')
    expect(strong.canonical).toBe(false)
    expect(strong.label).toContain('Strong drug evidence')

    // Hedged compounds round down, never up — overstating evidence strength is
    // the costlier error, so "moderate-high" resolves to moderate.
    expect(normalizeEvidenceGrade('moderate-high').band).toBe('moderate')
    expect(normalizeEvidenceGrade('moderate').band).toBe('moderate')
    expect(normalizeEvidenceGrade('limited').band).toBe('limited')
    expect(normalizeEvidenceGrade('insufficient').band).toBe('insufficient')
    expect(normalizeEvidenceGrade('preliminary').band).toBe('preliminary')
  })

  it('refuses to pick one letter for outcome-dependent grades', () => {
    // A single badge cannot honestly represent two different verdicts.
    const result = normalizeEvidenceGrade('B for PCOS; D for core goals')
    expect(result.outcomeDependent).toBe(true)
    expect(result.letter).toBeNull()
    expect(result.label).toBe('B for PCOS; D for core goals')
  })

  it('never invents a grade for empty or unrecognized input', () => {
    for (const value of ['', '   ', null, undefined]) {
      const result = normalizeEvidenceGrade(value)
      expect(result.letter).toBeNull()
      expect(result.band).toBeNull()
    }
    // "Not applicable" is not the same claim as "insufficient evidence", so it
    // must not be rendered as Grade F.
    const notApplicable = normalizeEvidenceGrade('not_applicable_stack')
    expect(notApplicable.letter).toBeNull()
    expect(notApplicable.band).toBeNull()
    expect(notApplicable.raw).toBe('not_applicable_stack')
  })
})

describe('bandFromEvidenceTier', () => {
  it('maps the clean tier taxonomy onto the same scale', () => {
    expect(bandFromEvidenceTier('Strong Human Evidence')).toBe('strong')
    expect(bandFromEvidenceTier('Moderate Human Evidence')).toBe('moderate')
    expect(bandFromEvidenceTier('Limited Human Evidence')).toBe('limited')
    expect(bandFromEvidenceTier('Mechanistic Evidence')).toBe('preliminary')
    expect(bandFromEvidenceTier('Early Human Evidence')).toBe('limited')
    expect(bandFromEvidenceTier('')).toBeNull()
  })
})

describe('gradeTierDistance', () => {
  it('scores how far the two evidence signals disagree', () => {
    expect(gradeTierDistance('limited', 'limited')).toBe(0)
    expect(gradeTierDistance('limited', 'moderate')).toBe(1)
    // The real contradiction pattern: grade "c" against "Strong Human Evidence".
    expect(gradeTierDistance('limited', 'strong')).toBe(2)
    expect(gradeTierDistance('strong', 'preliminary')).toBe(3)
  })

  it('returns null when either side is unknown', () => {
    expect(gradeTierDistance(null, 'strong')).toBeNull()
    expect(gradeTierDistance('strong', null)).toBeNull()
  })
})
