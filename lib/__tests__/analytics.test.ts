import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/src/lib/consent', () => ({
  getConsent: vi.fn(() => 'granted'),
  getSystemNoTracking: vi.fn(() => false),
}))

import { getConsent, getSystemNoTracking } from '@/src/lib/consent'
import {
  getGuideTrackingContext,
  trackEmailSignup,
  trackGuideView,
  trackLeadMagnetClick,
} from '../analytics'

beforeEach(() => {
  vi.mocked(getConsent).mockReturnValue('granted')
  vi.mocked(getSystemNoTracking).mockReturnValue(false)
})

afterEach(() => {
  delete (window as Window & { gtag?: unknown }).gtag
  vi.clearAllMocks()
})

describe('guide analytics', () => {
  it('extracts cluster and slug from current nested guide routes', () => {
    expect(getGuideTrackingContext('/guides/sleep/melatonin-vs-magnesium/')).toEqual({
      slug: 'melatonin-vs-magnesium',
      cluster: 'sleep',
      pagePath: '/guides/sleep/melatonin-vs-magnesium/',
    })
  })

  it('tracks a guide hub without inventing a cluster', () => {
    expect(getGuideTrackingContext('/guides/focus/')).toEqual({
      slug: 'focus',
      cluster: undefined,
      pagePath: '/guides/focus/',
    })
  })

  it('ignores non-guide routes', () => {
    expect(getGuideTrackingContext('/compounds/magnesium/')).toBeNull()
    expect(getGuideTrackingContext('/guides/')).toBeNull()
  })

  it('sends the canonical route context to gtag when analytics consent is granted', () => {
    const gtag = vi.fn()
    ;(window as Window & { gtag?: unknown }).gtag = gtag

    trackGuideView({
      slug: 'magnesium-for-sleep',
      cluster: 'sleep',
      pagePath: '/guides/sleep/magnesium-for-sleep/',
    })

    expect(gtag).toHaveBeenCalledWith('event', 'guide_view', {
      guide_slug: 'magnesium-for-sleep',
      guide_cluster: 'sleep',
      page_path: '/guides/sleep/magnesium-for-sleep/',
    })
  })

  it('tracks a lead magnet with its source path when analytics consent is granted', () => {
    const gtag = vi.fn()
    ;(window as Window & { gtag?: unknown }).gtag = gtag

    trackLeadMagnetClick({
      slug: 'adhd-supplement-starter-checklist',
      sourcePath: '/guides/adhd/',
    })

    expect(gtag).toHaveBeenCalledWith('event', 'lead_magnet_click', {
      lead_magnet_slug: 'adhd-supplement-starter-checklist',
      source_path: '/guides/adhd/',
    })
  })

  it('attributes successful email signups to the supplied source route when analytics consent is granted', () => {
    const gtag = vi.fn()
    ;(window as Window & { gtag?: unknown }).gtag = gtag

    trackEmailSignup({
      source: 'article-adhd-checklist',
      pagePath: '/guides/anxiety/ashwagandha-for-anxiety',
    })

    expect(gtag).toHaveBeenCalledWith('event', 'email_signup', {
      source: 'article-adhd-checklist',
      signup_source: 'article-adhd-checklist',
      page_path: '/guides/anxiety/ashwagandha-for-anxiety/',
      source_path: '/guides/anxiety/ashwagandha-for-anxiety/',
    })
  })

  it('does not emit analytics when consent is denied', () => {
    const gtag = vi.fn()
    ;(window as Window & { gtag?: unknown }).gtag = gtag
    vi.mocked(getConsent).mockReturnValue('denied')

    trackGuideView({
      slug: 'magnesium-for-sleep',
      cluster: 'sleep',
      pagePath: '/guides/sleep/magnesium-for-sleep/',
    })

    expect(gtag).not.toHaveBeenCalled()
  })

  it('does not emit analytics when DNT or GPC is active', () => {
    const gtag = vi.fn()
    ;(window as Window & { gtag?: unknown }).gtag = gtag
    vi.mocked(getSystemNoTracking).mockReturnValue(true)

    trackEmailSignup({
      source: 'article-adhd-checklist',
      pagePath: '/guides/anxiety/ashwagandha-for-anxiety',
    })

    expect(gtag).not.toHaveBeenCalled()
  })
})
