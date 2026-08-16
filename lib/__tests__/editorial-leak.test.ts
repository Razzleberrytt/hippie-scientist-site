import { describe, expect, it } from 'vitest'

// Shared with the workbook parser and the CI validator; typed via JSDoc.
import { findEditorialLeaks, hasEditorialLeak, stripEditorialLeak } from '@/lib/editorial-leak.mjs'

/**
 * These patterns delete published prose, so both directions matter: a miss
 * leaves a writer instruction on a live page, and a false positive silently
 * removes real content from one.
 *
 * Every "leaked" string below is the verbatim, entire `summary` of a profile
 * that is currently live with `index,follow`.
 */

describe('findEditorialLeaks', () => {
  it('catches the framing instruction that reached 31 indexed pages', () => {
    // The previous pattern required a preposition after "framed", so every one
    // of these slipped through into production.
    expect(hasEditorialLeak('It should be framed modestly because traditional use is much stronger than modern evidence.')).toBe(true)
    expect(hasEditorialLeak('It is best framed conservatively because evidence is mixed and product positioning often outruns the data.')).toBe(true)
    expect(hasEditorialLeak('It should be framed carefully because furanocoumarin context matters for some use cases.')).toBe(true)
  })

  it('catches instruction voice that does not use the word "framed"', () => {
    expect(hasEditorialLeak('Taurine blend entries should be treated as formulation/context rows, not separate proof beyond taurine evidence.')).toBe(true)
    expect(hasEditorialLeak('cognition should be described as mostly preclinical/hypothesis-level.')).toBe(true)
    expect(hasEditorialLeak('It should be framed consistently with gymnema while preserving alternate-name discoverability.')).toBe(true)
  })

  it('catches imperative instructions that have no subject at all', () => {
    // Verbatim summaries of 77 profiles, 44 of them indexable. The two below
    // are shared by 35 and 34 records respectively.
    expect(hasEditorialLeak('Keep claims tied to source-backed preparation and safety context.')).toBe(true)
    expect(hasEditorialLeak('Treat dosing and outcomes as review-gated unless pmid-backed human evidence is present.')).toBe(true)
  })

  it('treats internal governance jargon as pipeline copy wherever it appears', () => {
    // Neither term means anything to a reader.
    expect(hasEditorialLeak('Dosing is review-gated for this record.')).toBe(true)
    expect(hasEditorialLeak('Outcomes require pmid-backed evidence.')).toBe(true)
  })

  it('does not treat ordinary sentences starting with Keep or Treat as instructions', () => {
    // The imperative patterns are anchored on editorial nouns, so advice to a
    // reader survives.
    expect(hasEditorialLeak('Keep the bottle away from direct sunlight.')).toBe(false)
    expect(hasEditorialLeak('Treat any new symptom as a reason to stop and ask a clinician.')).toBe(false)
  })

  it('names the pattern that matched, for the audit trail', () => {
    expect(findEditorialLeaks('It should be framed modestly.')[0]?.name).toBe('framing-instruction')
  })

  it('leaves ordinary profile prose alone', () => {
    // These are real summaries from the same dataset. Matching any of them
    // would delete genuine content from a published page.
    const real = [
      'Ashwagandha is an adaptogenic herb studied for stress and sleep outcomes.',
      'Lithium orotate provides lithium ions, but robust human evidence for this salt form is lacking.',
      'Pantethine is a coenzyme A precursor studied for modest lipid improvements.',
      'Magnesium glycinate is a chelated form often chosen for its tolerability.',
      'The picture frame of evidence here is incomplete.',
      '',
    ]
    for (const text of real) {
      expect(hasEditorialLeak(text)).toBe(false)
    }
  })
})

describe('stripEditorialLeak', () => {
  it('removes the whole field when the instruction is the whole field', () => {
    expect(stripEditorialLeak('It should be framed modestly because traditional use is much stronger than modern evidence.')).toBe('')
  })

  it('keeps genuine prose that sits beside an instruction', () => {
    // Replacing this field wholesale would have discarded a real opening line
    // in favour of generic boilerplate.
    expect(
      stripEditorialLeak(
        'Pantethine is a coenzyme A precursor studied for modest lipid improvements. Evidence is limited to small human trials and should be framed conservatively.',
      ),
    ).toBe('Pantethine is a coenzyme A precursor studied for modest lipid improvements.')

    expect(
      stripEditorialLeak(
        "Lithium orotate provides lithium ions, but robust human evidence for this salt form is lacking. Safety concerns should be framed from lithium's narrow therapeutic window and kidney/thyroid risk.",
      ),
    ).toBe('Lithium orotate provides lithium ions, but robust human evidence for this salt form is lacking.')
  })

  it('never invents replacement text', () => {
    expect(stripEditorialLeak('')).toBe('')
    expect(stripEditorialLeak(null)).toBe('')
    expect(stripEditorialLeak(undefined)).toBe('')
  })
})
