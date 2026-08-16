import { describe, expect, it } from 'vitest'

import { buildProfileSummary, isPlaceholderSummary } from '@/lib/profile-summary'

/**
 * This text becomes the summary on live pages and the basis of meta
 * descriptions, so the standard is that every clause traces to a field on the
 * record. Inventing a benefit here would be a health claim the evidence does
 * not support.
 */

const acerola = {
  name: 'Acerola',
  scientific_name: 'Malpighia emarginata',
  evidence_grade: 'C',
  evidence_rationale: 'Strongest recorded design is a randomized controlled trial, drawn from 3 recorded studies, 1 in people.',
  mechanisms: ['Inflammatory Signaling Modulation', 'Oxidative Stress Modulation'],
  contraindications: ['Kidney stone risk', 'iron overload conditions'],
}

describe('buildProfileSummary', () => {
  it('composes identity, evidence, mechanism and safety from the record', () => {
    const summary = buildProfileSummary(acerola)
    expect(summary).toContain('Acerola (Malpighia emarginata)')
    expect(summary).toContain('Grade C rating — limited evidence')
    expect(summary).toContain('randomized controlled trial')
    expect(summary).toContain('kidney stone risk')
  })

  it('labels mechanism as mechanism, never as benefit', () => {
    // A pathway listed without this qualifier is how a target gets read as a
    // health outcome.
    expect(buildProfileSummary(acerola)).toContain('describes mechanism rather than demonstrated benefit')
  })

  it('lower-cases Title Case phrases without destroying acronyms', () => {
    const summary = buildProfileSummary({
      ...acerola,
      mechanisms: ['AMPK Signaling', 'Inflammatory Signaling Modulation', 'NF-κB Modulation'],
    })
    expect(summary).toContain('AMPK signaling')
    expect(summary).toContain('inflammatory signaling modulation')
    expect(summary).toContain('NF-κB modulation')
    expect(summary).not.toContain('aMPK')
  })

  it('keeps proper nouns in safety cautions intact', () => {
    // "Apiaceae" is a botanical family, not a Title Case word to normalise.
    const summary = buildProfileSummary({
      ...acerola,
      contraindications: ['Known allergy to Apiaceae family plants'],
    })
    expect(summary).toContain('Apiaceae')
  })

  it('trims a caution that carries its whole rationale', () => {
    const summary = buildProfileSummary({
      ...acerola,
      contraindications: ['Pregnancy because concentrated oil or high-dose extracts may stimulate uterine contractions'],
    })
    expect(summary).toContain('Noted cautions include pregnancy.')
    expect(summary).not.toContain('uterine')
  })

  it('omits a clause rather than inventing one when the field is absent', () => {
    const summary = buildProfileSummary({ name: 'Testherb', evidence_grade: 'D' })
    expect(summary).toBe('Testherb carries a Grade D rating — preliminary / theoretical evidence.')
  })

  it('says so plainly when no grade is assigned', () => {
    expect(buildProfileSummary({ name: 'Testherb' })).toContain('no evidence grade assigned')
  })

  it('is deterministic', () => {
    expect(buildProfileSummary(acerola)).toBe(buildProfileSummary(acerola))
  })

  it('returns empty for an unusable record rather than a stub', () => {
    expect(buildProfileSummary(null)).toBe('')
    expect(buildProfileSummary({})).toBe('')
  })
})

describe('isPlaceholderSummary', () => {
  it('recognises the generated filler', () => {
    expect(isPlaceholderSummary('Acerola botanical profile with evidence, safety, and practical fit.')).toBe(true)
    expect(isPlaceholderSummary('Taurine Blend compound profile with evidence, safety, and practical fit.')).toBe(true)
    expect(isPlaceholderSummary('No summary available yet.')).toBe(true)
    expect(isPlaceholderSummary('')).toBe(true)
  })

  it('leaves authored prose alone', () => {
    expect(
      isPlaceholderSummary('Holy basil is a traditional botanical most often used for stress adaptation over time.'),
    ).toBe(false)
  })
})
