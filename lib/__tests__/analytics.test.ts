import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getGuideTrackingContext,
  trackEmailSignup,
  trackGuideView,
  trackLeadMagnetClick,
} from '../analytics'

afterEach(() => {
  delete (window as Window & { gtag?: unknown }).gtag
  window.history.replaceState({}, '', '/')
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

  it('sends the canonical route context to gtag', () => {
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

  it('tracks a lead magnet with its source path', () => {
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

  it('attributes successful email signups to the actual source route', () => {
    const gtag = vi.fn()
    ;(window as Window & { gtag?: unknown }).gtag = gtag
    window.history.replaceState({}, '', '/guides/anxiety/ashwagandha-for-anxiety')

    trackEmailSignup({ source: 'article-adhd-checklist' })

    expect(gtag).toHaveBeenCalledWith('event', 'email_signup', {
      source: 'article-adhd-checklist',
      signup_source: 'article-adhd-checklist',
      page_path: '/guides/anxiety/ashwagandha-for-anxiety/',
      source_path: '/guides/anxiety/ashwagandha-for-anxiety/',
    })
  })
})
