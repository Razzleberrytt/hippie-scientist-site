import { beforeEach, describe, expect, it, vi } from 'vitest'

const { canTrackAnalytics } = vi.hoisted(() => ({
  canTrackAnalytics: vi.fn(() => true),
}))

vi.mock('@/lib/consent', () => ({ canTrackAnalytics }))

import { clearAnalyticsEvents } from '../analyticsEventStorage'
import {
  SOCIAL_ATTRIBUTION_SESSION_KEY,
  getSocialAttribution,
  getSocialAttributionEventParams,
  parseSocialAttribution,
} from '../social-attribution'

describe('social attribution', () => {
  beforeEach(() => {
    canTrackAnalytics.mockReset()
    canTrackAnalytics.mockReturnValue(true)
    window.sessionStorage.clear()
    window.localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('accepts only bounded THS social experiment tags and stores no raw query', () => {
    const captured = parseSocialAttribution(
      '?utm_source=Facebook&utm_medium=social&utm_campaign=ths_social_2026q4&utm_content=EXP002_ashwagandha_safety&private_term=do-not-store',
      '/guides/anxiety/best-adaptogens-for-stress',
      '2026-10-01T17:00:00.000Z',
    )

    expect(captured).toEqual({
      source: 'facebook',
      medium: 'social',
      campaign: 'ths_social_2026q4',
      experimentId: 'exp002_ashwagandha_safety',
      landingPath: '/guides/anxiety/best-adaptogens-for-stress/',
      capturedAt: '2026-10-01T17:00:00.000Z',
    })
    expect(JSON.stringify(captured)).not.toContain('private_term')
    expect(JSON.stringify(captured)).not.toContain('do-not-store')
  })

  it('fails closed for non-social, malformed, or ungoverned tags', () => {
    expect(parseSocialAttribution('?utm_source=facebook&utm_medium=email&utm_campaign=ths_social_2026q4&utm_content=exp002_test', '/')).toBeNull()
    expect(parseSocialAttribution('?utm_source=unknown&utm_medium=social&utm_campaign=ths_social_2026q4&utm_content=exp002_test', '/')).toBeNull()
    expect(parseSocialAttribution('?utm_source=facebook&utm_medium=social&utm_campaign=spring_sale&utm_content=exp002_test', '/')).toBeNull()
    expect(parseSocialAttribution('?utm_source=facebook&utm_medium=social&utm_campaign=ths_social_2026q4&utm_content=freeform-user-data', '/')).toBeNull()
  })

  it('does not create attribution state before analytics consent', () => {
    canTrackAnalytics.mockReturnValue(false)
    window.history.replaceState({}, '', '/guides/sleep/glycine-for-sleep/?utm_source=facebook&utm_medium=social&utm_campaign=ths_social_2026q4&utm_content=exp003_glycine_studied_dose')

    expect(getSocialAttribution()).toBeNull()
    expect(window.sessionStorage.getItem(SOCIAL_ATTRIBUTION_SESSION_KEY)).toBeNull()
  })

  it('keeps the first valid social experiment identity across internal navigation', () => {
    window.history.replaceState({}, '', '/guides/sleep/glycine-for-sleep/?utm_source=facebook&utm_medium=social&utm_campaign=ths_social_2026q4&utm_content=exp003_glycine_studied_dose')
    const landing = getSocialAttribution()

    window.history.replaceState({}, '', '/compounds/glycine/')
    const continued = getSocialAttribution()

    expect(continued).toEqual(landing)
    expect(continued?.landingPath).toBe('/guides/sleep/glycine-for-sleep/')
    expect(getSocialAttributionEventParams(continued)).toEqual({
      social_source: 'facebook',
      social_medium: 'social',
      social_campaign: 'ths_social_2026q4',
      social_experiment_id: 'exp003_glycine_studied_dose',
      social_landing_path: '/guides/sleep/glycine-for-sleep/',
    })
  })

  it('removes social attribution with the existing analytics-owned cleanup', () => {
    window.sessionStorage.setItem(SOCIAL_ATTRIBUTION_SESSION_KEY, JSON.stringify({
      source: 'facebook',
      medium: 'social',
      campaign: 'ths_social_2026q4',
      experimentId: 'exp002_ashwagandha_safety',
      landingPath: '/guides/anxiety/best-adaptogens-for-stress/',
      capturedAt: '2026-10-01T17:00:00.000Z',
    }))

    clearAnalyticsEvents()
    expect(window.sessionStorage.getItem(SOCIAL_ATTRIBUTION_SESSION_KEY)).toBeNull()
  })
})
