import { beforeEach, describe, expect, it, vi } from 'vitest'

const appendAnalyticsEvent = vi.fn()
vi.mock('@/utils/analytics/eventStorage', () => ({ appendAnalyticsEvent }))

import {
  getAtlasEngagementState,
  trackAtlasFilter,
  trackAtlasProfileClick,
  trackAtlasRecoveryAccepted,
  trackAtlasRecoveryShown,
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

    expect(getAtlasEngagementState()).toMatchObject({
      firstFilter: 'effect',
      distinctFilters: ['effect', 'evidence'],
      profileOpened: false,
      recoveryAccepted: null,
    })
  })

  it('tracks shown and accepted recovery suggestions in the same session', () => {
    const suggestions = [
      { action: 'clear-evidence' as const, label: 'Show all evidence levels', recoveredCount: 18 },
      { action: 'clear-safety' as const, label: 'Show all safety signals', recoveredCount: 9 },
    ]

    trackAtlasRecoveryShown(suggestions)
    trackAtlasRecoveryAccepted(suggestions[0])

    const shown = appendAnalyticsEvent.mock.calls[0][0]
    const accepted = appendAnalyticsEvent.mock.calls[1][0]
    expect(shown.type).toBe('botanical_atlas_recovery_shown')
    expect(shown.item).toContain('clear-evidence:18')
    expect(accepted.type).toBe('botanical_atlas_recovery_accepted')
    expect(accepted.context).toContain('restored:18')
    expect(getAtlasEngagementState().recoveryAccepted).toBe('clear-evidence')
  })

  it('carries accepted recovery into a later profile-open event', () => {
    trackAtlasRecoveryAccepted({ action: 'include-pathways', label: 'Include pathway-derived effects', recoveredCount: 7 })
    trackAtlasProfileClick({ slug: 'kanna', position: 1, activeFilterCount: 1 })

    const profileEvent = appendAnalyticsEvent.mock.calls.at(-1)?.[0]
    expect(profileEvent.context).toContain('profile_opened:yes')
    expect(profileEvent.context).toContain('recovery:include-pathways')
    expect(getAtlasEngagementState().profileOpened).toBe(true)
  })

  it('fails safely when stored session data is malformed', () => {
    window.sessionStorage.setItem('botanical-atlas-engagement', '{bad json')
    expect(getAtlasEngagementState()).toMatchObject({
      firstFilter: null,
      distinctFilters: [],
      profileOpened: false,
      recoveryAccepted: null,
    })
  })
})
