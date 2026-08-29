import { describe, expect, it } from 'vitest'
import { validateOpportunitySignals } from '../opportunity-signal-contract.mjs'

describe('opportunity signal provenance contract', () => {
  it('allows an empty signal set so fallback mode remains explicit', () => {
    expect(validateOpportunitySignals({})).toEqual({ valid: true, errors: [] })
  })

  it('rejects observed demand without provenance', () => {
    const result = validateOpportunitySignals({ herb: { searchOpportunity: 8 } })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('herb: observed demand signals require provenance')
  })

  it('requires exact denominator/date/method/field provenance', () => {
    const result = validateOpportunitySignals({ herb: {
      searchOpportunity: 8,
      aiCitationOpportunity: 6,
      provenance: { source: 'gsc', observedThrough: 'not-a-date', denominator: -1, method: '', fields: ['searchOpportunity'] },
    } })
    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([
      'herb: provenance.observedThrough must be a real YYYY-MM-DD date',
      'herb: provenance.denominator must be a positive integer for observed demand',
      'herb: provenance.method is required',
      'herb: provenance.fields must enumerate every observed demand signal',
    ]))
  })

  it('rejects impossible calendar dates, zero denominators, and out-of-range normalized demand', () => {
    const result = validateOpportunitySignals({ herb: {
      searchOpportunity: 11,
      aiCitationOpportunity: -1,
      provenance: {
        source: 'google-search-console',
        observedThrough: '2026-02-31',
        denominator: 0,
        method: '28-day page impressions normalized to 0-10',
        fields: ['searchOpportunity', 'aiCitationOpportunity'],
      },
    } })
    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([
      'herb: searchOpportunity must be between 0 and 10',
      'herb: aiCitationOpportunity must be between 0 and 10',
      'herb: provenance.observedThrough must be a real YYYY-MM-DD date',
      'herb: provenance.denominator must be a positive integer for observed demand',
    ]))
  })

  it('accepts observed demand only with auditable provenance', () => {
    expect(validateOpportunitySignals({ herb: {
      searchOpportunity: 8,
      provenance: {
        source: 'google-search-console',
        observedThrough: '2026-08-29',
        denominator: 417,
        method: '28-day page impressions normalized to 0-10',
        fields: ['searchOpportunity'],
      },
    } })).toEqual({ valid: true, errors: [] })
  })
})
