import { describe, expect, it } from 'vitest'
import { buildSearchOpportunitySignals, scoreSearchOpportunity } from '../build-search-opportunity-signals.mjs'
import { validateOpportunitySignals } from '../opportunity-signal-contract.mjs'

const NOW = new Date('2026-09-02T12:00:00Z')

describe('GSC distribution opportunity signal bridge', () => {
  it('maps finalized page demand to the governed destination with auditable provenance', () => {
    const signals = buildSearchOpportunitySignals({
      objects: [{ id: 'ashwagandha-stress-evidence', sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/' }],
      report: { pages: [{ url: '/herbs/ashwagandha', impressions: 1000, totalUpsideClicks: 25 }] },
      metadata: { endDate: '2026-08-30' },
    })
    expect(signals['ashwagandha-stress-evidence'].searchOpportunity).toBeGreaterThan(0)
    expect(signals['ashwagandha-stress-evidence'].provenance).toMatchObject({
      source: 'google-search-console',
      observedThrough: '2026-08-30',
      denominator: 1000,
      fields: ['searchOpportunity'],
    })
    expect(validateOpportunitySignals(signals, { now: NOW })).toEqual({ valid: true, errors: [] })
  })

  it('does not fabricate zero demand for a governed page absent from observed GSC rows', () => {
    const signals = buildSearchOpportunitySignals({
      objects: [{ id: 'missing', sourceUrl: 'https://thehippiescientist.net/herbs/missing/' }],
      report: { pages: [{ url: '/herbs/ashwagandha/', impressions: 100, totalUpsideClicks: 5 }] },
      metadata: { endDate: '2026-08-30' },
    })
    expect(signals).toEqual({})
  })

  it('uses fixed caps so a candidate cannot become a perfect score merely by being the only candidate', () => {
    expect(scoreSearchOpportunity({ impressions: 10, totalUpsideClicks: 1 })).toBeLessThan(10)
    expect(scoreSearchOpportunity({ impressions: 10_000, totalUpsideClicks: 100 })).toBe(10)
  })

  it('fails closed when finalized Search Console observation date is missing', () => {
    expect(() => buildSearchOpportunitySignals({ objects: [], report: { pages: [] }, metadata: {} }))
      .toThrow('Search Console metadata must provide the finalized endDate')
  })
})
