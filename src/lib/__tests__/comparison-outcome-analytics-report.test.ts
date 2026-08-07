import { describe, expect, it } from 'vitest'
import { buildComparisonOutcomePerformance } from '@/lib/comparisonOutcomeAnalyticsReport'

describe('comparison outcome analytics report', () => {
  it('computes continuation rate from unique page views and engaged sessions', () => {
    const report = buildComparisonOutcomePerformance([
      { type: 'comparison_page_viewed', slug: 'coffee-vs-green-tea', context: 'session:s1' },
      { type: 'comparison_page_viewed', slug: 'coffee-vs-green-tea', context: 'session:s2' },
      { type: 'comparison_outcome_click', slug: 'coffee-vs-green-tea', item: '/herbs/coffea-arabica/', context: 'session:s1;outcome:herb_profile' },
      { type: 'comparison_outcome_click', slug: 'coffee-vs-green-tea', item: '/herbs/camellia-sinensis/', context: 'session:s1;outcome:herb_profile' },
    ])

    expect(report.pageRows[0]).toMatchObject({
      pageSlug: 'coffee-vs-green-tea',
      views: 2,
      engagedSessions: 1,
      continuationRate: 0.5,
      outcomes: 2,
    })
    expect(report.outcomeRows[0]).toEqual({ outcome: 'herb_profile', clicks: 2 })
  })

  it('deduplicates repeated destination clicks in the same session', () => {
    const events = [
      { type: 'comparison_page_viewed', slug: 'a-vs-b', context: 'session:s1' },
      { type: 'comparison_outcome_click', slug: 'a-vs-b', item: '/safety-checker/', context: 'session:s1;outcome:safety_checker' },
      { type: 'comparison_outcome_click', slug: 'a-vs-b', item: '/safety-checker/', context: 'session:s1;outcome:safety_checker' },
    ]
    const report = buildComparisonOutcomePerformance(events)
    expect(report.attributedOutcomes).toBe(1)
    expect(report.pageRows[0]?.outcomes).toBe(1)
  })

  it('reports different research continuation types independently', () => {
    const report = buildComparisonOutcomePerformance([
      { type: 'comparison_page_viewed', slug: 'a-vs-b', context: 'session:s1' },
      { type: 'comparison_outcome_click', slug: 'a-vs-b', item: '#references', context: 'session:s1;outcome:reference' },
      { type: 'comparison_outcome_click', slug: 'a-vs-b', item: '/guides/compare/c-vs-d/', context: 'session:s1;outcome:another_comparison' },
    ])
    expect(report.outcomeRows).toEqual(expect.arrayContaining([
      { outcome: 'reference', clicks: 1 },
      { outcome: 'another_comparison', clicks: 1 },
    ]))
  })

  it('excludes events without a session id', () => {
    const report = buildComparisonOutcomePerformance([
      { type: 'comparison_page_viewed', slug: 'a-vs-b', context: '' },
      { type: 'comparison_outcome_click', slug: 'a-vs-b', item: '/herbs/a/', context: 'outcome:herb_profile' },
    ])
    expect(report.attributedViews).toBe(0)
    expect(report.attributedOutcomes).toBe(0)
    expect(report.unattributedEvents).toBe(2)
  })
})
