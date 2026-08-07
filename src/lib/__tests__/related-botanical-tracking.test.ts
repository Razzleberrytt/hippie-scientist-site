import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackRelatedBotanicalClick, trackRelatedBotanicalsShown } from '@/lib/relatedBotanicalTracking'

const appendAnalyticsEvent = vi.fn()

vi.mock('@/lib/analyticsEventStorage', () => ({ appendAnalyticsEvent }))

describe('related botanical tracking', () => {
  beforeEach(() => {
    appendAnalyticsEvent.mockClear()
    sessionStorage.clear()
  })

  it('records impressions with reason types and first-profile depth', () => {
    trackRelatedBotanicalsShown('ashwagandha', [
      { slug: 'rhodiola', position: 1, score: 10.5, reasonTypes: ['explicit-effect', 'compound-class'] },
    ])

    expect(appendAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'related_botanicals_shown',
      slug: 'ashwagandha',
      item: 'rhodiola:1:10.5',
      context: expect.stringContaining('depth:1'),
    }))
  })

  it('increments profile depth when a related botanical is opened', () => {
    trackRelatedBotanicalsShown('ashwagandha', [
      { slug: 'rhodiola', position: 1, score: 10.5, reasonTypes: ['explicit-effect'] },
    ])
    trackRelatedBotanicalClick('ashwagandha', {
      slug: 'rhodiola', position: 1, score: 10.5, reasonTypes: ['explicit-effect'],
    })

    expect(appendAnalyticsEvent).toHaveBeenLastCalledWith(expect.objectContaining({
      type: 'related_botanical_click',
      slug: 'ashwagandha',
      item: 'rhodiola',
      context: expect.stringContaining('profile_depth:2'),
    }))
  })

  it('does not inflate depth when revisiting the same profile', () => {
    const item = { slug: 'rhodiola', position: 1, score: 10.5, reasonTypes: ['explicit-effect'] }
    trackRelatedBotanicalClick('ashwagandha', item)
    trackRelatedBotanicalClick('ashwagandha', item)

    expect(appendAnalyticsEvent).toHaveBeenLastCalledWith(expect.objectContaining({
      context: expect.stringContaining('profile_depth:2'),
    }))
  })
})
