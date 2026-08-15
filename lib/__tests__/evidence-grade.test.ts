import { describe, expect, it } from 'vitest'

import {
  bandFromEvidenceTier,
  gradeTierDistance,
  normalizeEvidenceGrade,
  reconcileEvidenceGrade,
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
    expect(notApplicable.notApplicable).toBe(true)
  })

  it('maps bare strength words used as whole grade values', () => {
    // 25 records grade evidence as "high"; before this they were unmappable and
    // rendered with no badge at all.
    expect(normalizeEvidenceGrade('high')).toMatchObject({ letter: 'A', band: 'strong' })
    expect(normalizeEvidenceGrade('low')).toMatchObject({ letter: 'D', band: 'preliminary' })
  })

  it('does not read a risk word as an evidence-strength word', () => {
    // "high" here describes safety caution, not evidence strength; the record's
    // efficacy claim is moderate.
    expect(normalizeEvidenceGrade('Moderate efficacy / high safety caution').band).toBe('moderate')
  })
})

describe('reconcileEvidenceGrade', () => {
  it('publishes the agreed grade when both signals match', () => {
    const result = reconcileEvidenceGrade('B', 'Moderate Human Evidence')
    expect(result.grade).toBe('B')
    expect(result.reason).toBe('agree')
    expect(result.adjusted).toBe(false)
  })

  it('resolves a two-band contradiction downward', () => {
    // The real `calcium` record: graded "strong" against a mechanistic tier.
    const result = reconcileEvidenceGrade('strong', 'Mechanistic Evidence')
    expect(result.grade).toBe('D')
    expect(result.reason).toBe('contradiction-resolved-conservatively')
    expect(result.adjusted).toBe(true)
    expect(result.explanation).toContain('conflict')
  })

  it('never publishes Grade A unless the evidence tier also says strong', () => {
    // One band apart, so the generic rule would let A stand. Grade A is the
    // strongest public claim on the site and needs both signals.
    const result = reconcileEvidenceGrade('a', 'Moderate Human Evidence')
    expect(result.grade).toBe('B')
    expect(result.reason).toBe('capped-by-weaker-tier')
    expect(reconcileEvidenceGrade('a', 'Strong Human Evidence').grade).toBe('A')
  })

  it('tolerates a one-band disagreement below Grade A', () => {
    const result = reconcileEvidenceGrade('c', 'Moderate Human Evidence')
    expect(result.grade).toBe('C')
    expect(result.reason).toBe('minor-disagreement')
    expect(result.adjusted).toBe(false)
  })

  it('falls back to whichever signal exists', () => {
    expect(reconcileEvidenceGrade('', 'Strong Human Evidence')).toMatchObject({ grade: 'A', reason: 'tier-only' })
    expect(reconcileEvidenceGrade('c', '')).toMatchObject({ grade: 'C', reason: 'grade-only' })
  })

  it('withholds a grade where one cannot honestly be published', () => {
    expect(reconcileEvidenceGrade('not_applicable_stack', 'Mechanistic Evidence')).toMatchObject({
      grade: null,
      reason: 'not-applicable',
    })
    expect(reconcileEvidenceGrade('B for PCOS; D for core goals', 'Limited Human Evidence')).toMatchObject({
      grade: null,
      reason: 'unresolved',
    })
    expect(reconcileEvidenceGrade('', '')).toMatchObject({ grade: null, reason: 'unresolved' })
  })

  it('explains every published grade', () => {
    for (const [grade, tier] of [['a', 'Strong Human Evidence'], ['strong', 'Mechanistic Evidence'], ['c', '']]) {
      expect(reconcileEvidenceGrade(grade, tier).explanation.length).toBeGreaterThan(0)
    }
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
