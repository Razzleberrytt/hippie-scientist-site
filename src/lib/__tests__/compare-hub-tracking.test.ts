import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  trackCompareHubCategoryShown,
  trackCompareHubClick,
  trackComparisonOutcome,
  trackComparisonPageViewed,
} from '@/lib/compareHubTracking'

const appendAnalyticsEvent = vi.fn()
vi.mock('@/lib/analyticsEventStorage', () => ({ appendAnalyticsEvent }))

describe('comparison hub tracking', () => {
  beforeEach(() => {
    appendAnalyticsEvent.mockClear()
    sessionStorage.clear()
  })

  it('records a category impression once per session', () => {
    trackCompareHubCategoryShown('Energy & focus')
    trackCompareHubCategoryShown('Energy & focus')

    expect(appendAnalyticsEvent).toHaveBeenCalledTimes(1)
    expect(appendAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'compare_hub_category_shown',
      slug: 'Energy & focus',
      context: expect.stringContaining('session:'),
    }))
  })

  it('records click source, category, and destination', () => {
    trackCompareHubClick({
      source: 'featured_category',
      href: '/guides/compare/coffee-vs-green-tea/',
      label: 'Coffee vs Green Tea',
      category: 'Energy & focus',
    })

    expect(appendAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'compare_hub_click',
      slug: '/guides/compare/coffee-vs-green-tea/',
      item: 'Coffee vs Green Tea',
      context: expect.stringContaining('source:featured_category;category:Energy & focus'),
    }))
  })

  it('hands hub source attribution to the destination comparison view', () => {
    trackCompareHubClick({
      source: 'featured_category',
      href: '/guides/compare/coffee-vs-green-tea/',
      label: 'Coffee vs Green Tea',
      category: 'Energy & focus',
    })
    appendAnalyticsEvent.mockClear()

    trackComparisonPageViewed('coffee-vs-green-tea')

    expect(appendAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'comparison_page_viewed',
      slug: 'coffee-vs-green-tea',
      context: expect.stringContaining('entry_source:featured_category;entry_category:Energy & focus;entry_label:Coffee vs Green Tea'),
    }))
  })

  it('does not attach a pending hub entry to a different comparison page', () => {
    trackCompareHubClick({
      source: 'goal_starter',
      href: '/guides/compare/coffee-vs-green-tea/',
      label: 'Compare Coffee & Green Tea',
    })
    appendAnalyticsEvent.mockClear()

    trackComparisonPageViewed('st-johns-wort-vs-saffron')

    expect(appendAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'comparison_page_viewed',
      context: expect.stringContaining('entry_source:direct_or_external;entry_category:none'),
    }))
  })

  it('records one comparison view per page per session', () => {
    trackComparisonPageViewed('coffee-vs-green-tea')
    trackComparisonPageViewed('coffee-vs-green-tea')
    trackComparisonPageViewed('st-johns-wort-vs-saffron')

    expect(appendAnalyticsEvent).toHaveBeenCalledTimes(2)
    expect(appendAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'comparison_page_viewed',
      slug: 'coffee-vs-green-tea',
    }))
  })

  it('records research continuation type and destination', () => {
    trackComparisonOutcome({
      pageSlug: 'coffee-vs-green-tea',
      outcome: 'herb_profile',
      href: '/herbs/coffea-arabica/',
      label: 'Coffee',
    })

    expect(appendAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'comparison_outcome_click',
      slug: 'coffee-vs-green-tea',
      item: '/herbs/coffea-arabica/',
      context: expect.stringContaining('outcome:herb_profile'),
    }))
  })
})
