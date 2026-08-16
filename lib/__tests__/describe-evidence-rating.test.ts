import { describe, expect, it } from 'vitest'

import { STANDARD_EVIDENCE_LABELS, describeEvidenceRating } from '@/lib/decision-primitives'

/**
 * This phrase is rendered mid-sentence on every compound profile. The bug it
 * replaces shipped "has a moderate evidence evidence rating" to 532 published
 * pages, so the duplication check below is the point of the file.
 */

describe('describeEvidenceRating', () => {
  it('never repeats the word evidence', () => {
    for (const label of STANDARD_EVIDENCE_LABELS) {
      const sentence = `Compound has ${describeEvidenceRating(label)}.`
      expect(sentence, label).not.toMatch(/\bevidence\s+evidence\b/i)
    }
  })

  it('reads correctly for the graded labels', () => {
    expect(describeEvidenceRating('Moderate evidence')).toBe('a moderate evidence rating')
    expect(describeEvidenceRating('Strong evidence')).toBe('a strong evidence rating')
    expect(describeEvidenceRating('Limited evidence')).toBe('a limited evidence rating')
  })

  it('uses the right article', () => {
    // "a insufficient" would be wrong for one label in eight.
    expect(describeEvidenceRating('Insufficient evidence')).toBe('an insufficient evidence rating')
    expect(describeEvidenceRating('Moderate evidence').startsWith('a ')).toBe(true)
  })

  it('does not imply an evidence grade for labels that are not one', () => {
    // Traditional use is not a strength of evidence, and "needs review" means
    // nobody has judged it yet. Neither may read as a graded rating.
    expect(describeEvidenceRating('Traditional use')).toContain('rather than a graded evidence rating')
    expect(describeEvidenceRating('Needs review')).toContain('still under review')
  })

  it('composes a complete sentence with the profile template', () => {
    expect(`5-HTP has ${describeEvidenceRating('Moderate evidence')}.`).toBe(
      '5-HTP has a moderate evidence rating.',
    )
  })

  it('normalizes a raw workbook value before phrasing it', () => {
    // The template passes whatever the record holds; grade letters and tier
    // prose both have to resolve to one sane phrase.
    expect(describeEvidenceRating('B')).toBe('a moderate evidence rating')
    expect(describeEvidenceRating('Strong Human Evidence')).toBe('a strong evidence rating')
    expect(describeEvidenceRating(undefined)).toBe('a limited evidence rating')
  })
})
