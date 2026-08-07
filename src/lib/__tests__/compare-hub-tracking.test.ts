import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackCompareHubCategoryShown, trackCompareHubClick } from '@/lib/compareHubTracking'

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
})
