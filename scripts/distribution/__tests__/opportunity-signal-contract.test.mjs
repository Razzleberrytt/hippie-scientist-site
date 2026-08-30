import { describe, expect, it } from 'vitest'
import { validateOpportunitySignals } from '../opportunity-signal-contract.mjs'

const NOW = new Date('2026-08-29T12:00:00Z')

describe('opportunity signal provenance contract', () => {
  it('allows an empty signal set so fallback mode remains explicit', () => {
    expect(validateOpportunitySignals({}, { now: NOW })).toEqual({ valid: true, errors: [] })
  })

  it('rejects observed demand without provenance', () => {
    const result = validateOpportunitySignals({ herb: { searchOpportunity: 8 } }, { now: NOW })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('herb: observed demand signals require provenance')
  })

  it('requires exact denominator/date/method/field provenance', () => {
    const result = validateOpportunitySignals({ herb: {
      searchOpportunity: 8,
      aiCitationOpportunity: 6,
      provenance: { source: 'gsc', observedThrough: 'not-a-date', denominator: -1, method: '', fields: ['searchOpportunity'] },
    } }, { now: NOW })
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
    } }, { now: NOW })
    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([
      'herb: searchOpportunity must be between 0 and 10',
      'herb: aiCitationOpportunity must be between 0 and 10',
      'herb: provenance.observedThrough must be a real YYYY-MM-DD date',
      'herb: provenance.denominator must be a positive integer for observed demand',
    ]))
  })

  it('rejects coercible nonnumeric observed demand instead of treating it as ranking evidence', () => {
    const provenance = {
      source: 'google-search-console',
      observedThrough: '2026-08-29',
      denominator: 417,
      method: '28-day page impressions normalized to 0-10',
      fields: ['searchOpportunity', 'aiCitationOpportunity', 'socialSuitability'],
    }
    const result = validateOpportunitySignals({ herb: {
      searchOpportunity: true,
      aiCitationOpportunity: [],
      socialSuitability: '8',
      provenance,
    } }, { now: NOW })
    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([
      'herb: searchOpportunity must be a finite number between 0 and 10',
      'herb: aiCitationOpportunity must be a finite number between 0 and 10',
      'herb: socialSuitability must be a finite number between 0 and 10',
    ]))
  })

  it('rejects future-dated and stale observed demand', () => {
    const makeRecord = (observedThrough) => ({
      searchOpportunity: 8,
      provenance: {
        source: 'google-search-console',
        observedThrough,
        denominator: 417,
        method: '28-day page impressions normalized to 0-10',
        fields: ['searchOpportunity'],
      },
    })
    const future = validateOpportunitySignals({ herb: makeRecord('2026-08-30') }, { now: NOW })
    expect(future.valid).toBe(false)
    expect(future.errors).toContain('herb: provenance.observedThrough cannot be in the future')

    const stale = validateOpportunitySignals({ herb: makeRecord('2026-05-30') }, { now: NOW })
    expect(stale.valid).toBe(false)
    expect(stale.errors).toContain('herb: provenance.observedThrough is stale; observed demand must be verified within 90 days')
  })

  it('accepts current and 90-day-boundary observed demand with auditable provenance', () => {
    const makeRecord = (observedThrough) => ({
      searchOpportunity: 8,
      provenance: {
        source: 'google-search-console',
        observedThrough,
        denominator: 417,
        method: '28-day page impressions normalized to 0-10',
        fields: ['searchOpportunity'],
      },
    })
    expect(validateOpportunitySignals({ herb: makeRecord('2026-08-29') }, { now: NOW })).toEqual({ valid: true, errors: [] })
    expect(validateOpportunitySignals({ herb: makeRecord('2026-05-31') }, { now: NOW })).toEqual({ valid: true, errors: [] })
  })
})
