import { afterEach, describe, expect, it, vi } from 'vitest'
import { getGuideTrackingContext, trackGuideView } from '../analytics'

afterEach(() => {
  delete (window as Window & { gtag?: unknown }).gtag
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
})
