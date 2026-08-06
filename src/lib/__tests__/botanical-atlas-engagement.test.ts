import { beforeEach, describe, expect, it, vi } from 'vitest'

const appendAnalyticsEvent = vi.fn()
vi.mock('@/utils/analytics/eventStorage', () => ({ appendAnalyticsEvent }))

import {
  getAtlasEngagementState,
  trackAtlasFilter,
  trackAtlasProfileClick,
} from '../botanicalAtlasTracking'

describe('botanical atlas engagement depth', () => {
  beforeEach(() => {
    appendAnalyticsEvent.mockClear()
    window.sessionStorage.clear()
  })

  it('records the first filter and counts distinct filter categories', () => {
    trackAtlasFilter({ filter: 'effect', value: 'Calming', resultCount: 12 })
    trackAtlasFilter({ filter: 'effect', value: 'Sedating / sleep', resultCount: 5 })
    trackAtlasFilter({ filter: 'evidence', value: 'Strong', resultCount: 2 })

    expect(getAtlasEngagementState()).toEqual({
      firstFilter: 'effect',
      distinctFilters: ['effect', 'evidence'],
      profileOpened: false,
    })
  })

  it('adds engagement depth to a profile-open event', () => {
    trackAtlasFilter({ filter: 'chemistry', value: 'Alkaloids', resultCount: 8 })
    trackAtlasFilter({ filter: 'safety', value: 'Serotonergic', resultCount: 3 })
    trackAtlasProfileClick({ slug: 'kanna', position: 1, activeFilterCount: 2 })

    const profileEvent = appendAnalyticsEvent.mock.calls.at(-1)?.[0]
    expect(profileEvent.context).toContain('first_filter:chemistry')
    expect(profileEvent.context).toContain('distinct_filters:2')
    expect(profileEvent.context).toContain('profile_opened:yes')
    expect(getAtlasEngagementState().profileOpened).toBe(true)
  })

  it('fails safely when stored session data is malformed', () => {
    window.sessionStorage.setItem('botanical-atlas-engagement', '{bad json')
    expect(getAtlasEngagementState()).toEqual({
      firstFilter: null,
      distinctFilters: [],
      profileOpened: false,
    })
  })
})
