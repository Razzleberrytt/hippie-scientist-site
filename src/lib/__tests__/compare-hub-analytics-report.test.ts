import { describe, expect, it } from 'vitest'
import { buildCompareHubPerformance } from '@/lib/compareHubAnalyticsReport'

describe('comparison hub analytics report', () => {
  it('deduplicates category impressions and computes category CTR', () => {
    const report = buildCompareHubPerformance([
      { type: 'compare_hub_category_shown', slug: 'Energy & focus', context: 'session:s1;surface:featured_category' },
      { type: 'compare_hub_category_shown', slug: 'Energy & focus', context: 'session:s1;surface:featured_category' },
      { type: 'compare_hub_category_shown', slug: 'Energy & focus', context: 'session:s2;surface:featured_category' },
      { type: 'compare_hub_click', slug: '/guides/compare/coffee-vs-green-tea/', item: 'Coffee vs Green Tea', context: 'session:s1;source:featured_category;category:Energy & focus' },
    ])

    expect(report.categoryRows[0]).toMatchObject({ category: 'Energy & focus', impressions: 2, clicks: 1, ctr: 0.5 })
    expect(report.attributedCategoryImpressions).toBe(2)
  })

  it('ranks goal starters and routes and counts dynamic usage', () => {
    const report = buildCompareHubPerformance([
      { type: 'compare_hub_click', slug: '/guides/compare/coffee-vs-green-tea/', item: 'Compare Coffee & Green Tea →', context: 'session:s1;source:goal_starter;category:none' },
      { type: 'compare_hub_click', slug: '/guides/compare/coffee-vs-green-tea/', item: 'Compare Coffee & Green Tea →', context: 'session:s2;source:goal_starter;category:none' },
      { type: 'compare_hub_click', slug: '/guides/compare/dynamic/', item: 'Open comparison matrix →', context: 'session:s2;source:goal_starter;category:none' },
    ])

    expect(report.goalRows[0]).toMatchObject({ label: 'Compare Coffee & Green Tea →', clicks: 2 })
    expect(report.routeRows[0]).toMatchObject({ href: '/guides/compare/coffee-vs-green-tea/', clicks: 2 })
    expect(report.dynamicMatrixClicks).toBe(1)
  })

  it('excludes events without a session id', () => {
    const report = buildCompareHubPerformance([
      { type: 'compare_hub_category_shown', slug: 'Sleep', context: 'surface:featured_category' },
      { type: 'compare_hub_click', slug: '/guides/compare/melatonin-vs-magnesium/', context: 'source:featured_category;category:Sleep' },
    ])

    expect(report.attributedClicks).toBe(0)
    expect(report.attributedCategoryImpressions).toBe(0)
    expect(report.unattributedEvents).toBe(2)
  })
})
