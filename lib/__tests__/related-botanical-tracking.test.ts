import { beforeEach, describe, expect, it, vi } from 'vitest'

const { appendAnalyticsEvent, canTrackAnalytics } = vi.hoisted(() => ({
  appendAnalyticsEvent: vi.fn(),
  canTrackAnalytics: vi.fn(() => true),
}))
vi.mock('@/lib/analyticsEventStorage', () => ({ appendAnalyticsEvent }))
vi.mock('@/lib/consent', () => ({ canTrackAnalytics }))

import {
  trackRelatedBotanicalClick,
  trackRelatedBotanicalCompare,
  trackRelatedBotanicalsShown,
} from '@/lib/relatedBotanicalTracking'

describe('related botanical tracking', () => {
  beforeEach(() => {
    appendAnalyticsEvent.mockClear()
    canTrackAnalytics.mockReset()
    canTrackAnalytics.mockReturnValue(true)
    sessionStorage.clear()
  })

  it('records impressions with reason types and first-profile depth', () => {
    trackRelatedBotanicalsShown('ashwagandha', [
      { slug: 'rhodiola', position: 1, score: 10.5, reasonTypes: ['explicit-effect', 'compound-class'] },
    ])
    expect(appendAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'related_botanicals_shown', slug: 'ashwagandha', item: 'rhodiola~1~10.5~explicit-effect|compound-class', context: expect.stringContaining('depth:1'),
    }))
  })

  it('increments profile depth when a related botanical is opened', () => {
    trackRelatedBotanicalsShown('ashwagandha', [
      { slug: 'rhodiola', position: 1, score: 10.5, reasonTypes: ['explicit-effect'] },
    ])
    trackRelatedBotanicalClick('ashwagandha', { slug: 'rhodiola', position: 1, score: 10.5, reasonTypes: ['explicit-effect'] })
    expect(appendAnalyticsEvent).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'related_botanical_click', context: expect.stringContaining('profile_depth:2') }))
  })

  it('does not inflate depth when revisiting the same profile', () => {
    const item = { slug: 'rhodiola', position: 1, score: 10.5, reasonTypes: ['explicit-effect'] }
    trackRelatedBotanicalClick('ashwagandha', item)
    trackRelatedBotanicalClick('ashwagandha', item)
    expect(appendAnalyticsEvent).toHaveBeenLastCalledWith(expect.objectContaining({ context: expect.stringContaining('profile_depth:2') }))
  })

  it('tracks comparison clicks without inflating profile exploration depth', () => {
    const item = { slug: 'rhodiola', position: 1, score: 10.5, reasonTypes: ['explicit-effect'] }
    trackRelatedBotanicalsShown('ashwagandha', [item])
    trackRelatedBotanicalCompare('ashwagandha', item, '/guides/compare/rhodiola-vs-ashwagandha/')
    expect(appendAnalyticsEvent).toHaveBeenLastCalledWith(expect.objectContaining({
      type: 'related_botanical_compare_click', targetType: 'comparison', context: expect.stringContaining('profile_depth:1'),
    }))
  })

  it('does not persist exploration sessions without consent', () => {
    canTrackAnalytics.mockReturnValue(false)
    const item = { slug: 'rhodiola', position: 1, score: 10.5, reasonTypes: ['explicit-effect'] }
    trackRelatedBotanicalsShown('ashwagandha', [item])
    trackRelatedBotanicalClick('ashwagandha', item)

    expect(appendAnalyticsEvent).not.toHaveBeenCalled()
    expect(sessionStorage.length).toBe(0)
  })
})
