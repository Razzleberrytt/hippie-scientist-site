import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  appendAnalyticsEvent,
  trackContentJourneyAnalytics,
  getSocialAttributionLocalFields,
} = vi.hoisted(() => ({
  appendAnalyticsEvent: vi.fn(),
  trackContentJourneyAnalytics: vi.fn(),
  getSocialAttributionLocalFields: vi.fn(() => ({
    socialSource: 'facebook',
    socialMedium: 'social',
    socialCampaign: 'ths_social_2026q4',
    socialExperimentId: 'exp003_glycine_studied_dose',
    socialLandingPath: '/guides/sleep/glycine-for-sleep/',
  })),
}))

vi.mock('@/utils/analytics/eventStorage', () => ({ appendAnalyticsEvent }))
vi.mock('../analytics', () => ({ trackContentJourneyAnalytics }))
vi.mock('../social-attribution', () => ({ getSocialAttributionLocalFields }))
vi.mock('../governedAnalytics', () => ({ trackGovernedEvent: vi.fn() }))

import { trackCollectionDetailClick } from '../contentJourneyTracking'

describe('content journey social attribution bridge', () => {
  beforeEach(() => {
    appendAnalyticsEvent.mockClear()
    trackContentJourneyAnalytics.mockClear()
    getSocialAttributionLocalFields.mockClear()
  })

  it('writes the same journey to local and remote analytics with experiment identity', () => {
    trackCollectionDetailClick({
      collectionSlug: 'sleep',
      targetType: 'compound',
      targetSlug: 'glycine',
      placement: 'related-evidence',
    })

    expect(appendAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'collection_detail_click',
      slug: 'sleep',
      item: 'compound:glycine',
      socialSource: 'facebook',
      socialCampaign: 'ths_social_2026q4',
      socialExperimentId: 'exp003_glycine_studied_dose',
      socialLandingPath: '/guides/sleep/glycine-for-sleep/',
    }))
    expect(trackContentJourneyAnalytics).toHaveBeenCalledWith({
      type: 'collection_detail_click',
      source: 'sleep',
      sourceType: 'collection',
      targetType: 'compound',
      target: 'compound:glycine',
      placement: 'related-evidence',
    })
  })
})
