import { fireEvent, render } from '@testing-library/react'
import Link from 'next/link'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ClickTracker from '../ClickTracker'

const mocks = vi.hoisted(() => ({
  getConsent: vi.fn(),
  trackLeadMagnetClick: vi.fn(),
  trackPageView: vi.fn(),
  trackHomepageEntityClick: vi.fn(),
  trackCollectionDetailClick: vi.fn(),
  trackDetailCheckerClick: vi.fn(),
  trackDetailBuilderClick: vi.fn(),
  trackDetailRelatedEntityClick: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/guides/adhd/',
}))

vi.mock('@/lib/analytics', () => ({
  getGuideTrackingContext: () => null,
  trackAffiliateClick: vi.fn(),
  trackGuideView: vi.fn(),
  trackLeadMagnetClick: mocks.trackLeadMagnetClick,
  trackNavigationClick: vi.fn(),
  trackPageView: mocks.trackPageView,
}))

vi.mock('@/lib/contentJourneyTracking', () => ({
  trackHomepageEntityClick: mocks.trackHomepageEntityClick,
  trackCollectionDetailClick: mocks.trackCollectionDetailClick,
  trackDetailCheckerClick: mocks.trackDetailCheckerClick,
  trackDetailBuilderClick: mocks.trackDetailBuilderClick,
  trackDetailRelatedEntityClick: mocks.trackDetailRelatedEntityClick,
}))

vi.mock('@/lib/consent', () => ({
  CONSENT_CHANGE_EVENT: 'consent-granted',
  getConsent: mocks.getConsent,
}))

vi.mock('@/lib/loadAnalytics', () => ({
  loadAnalytics: vi.fn(),
}))

afterEach(() => {
  mocks.getConsent.mockReset()
  mocks.trackLeadMagnetClick.mockReset()
  mocks.trackPageView.mockReset()
  mocks.trackHomepageEntityClick.mockReset()
  mocks.trackCollectionDetailClick.mockReset()
  mocks.trackDetailCheckerClick.mockReset()
  mocks.trackDetailBuilderClick.mockReset()
  mocks.trackDetailRelatedEntityClick.mockReset()
  window.history.replaceState({}, '', '/')
  vi.unstubAllGlobals()
})

describe('ClickTracker', () => {
  it('tracks the current page once after analytics consent', () => {
    mocks.getConsent.mockReturnValue('granted')
    mocks.trackPageView.mockReturnValue(true)

    render(<ClickTracker />)

    expect(mocks.trackPageView).toHaveBeenCalledTimes(1)
    expect(mocks.trackPageView).toHaveBeenCalledWith({ pagePath: '/guides/adhd/' })

    fireEvent(window, new Event('consent-granted'))
    expect(mocks.trackPageView).toHaveBeenCalledTimes(1)
  })

  it('tracks lead-magnet clicks after analytics consent', () => {
    mocks.getConsent.mockReturnValue('granted')
    mocks.trackPageView.mockReturnValue(true)
    render(
      <>
        <ClickTracker />
        <Link href="/lead-magnets/adhd-supplement-starter-checklist/" onClick={(event) => event.preventDefault()}>
          Open checklist
        </Link>
      </>,
    )

    fireEvent.click(document.querySelector('a')!)

    expect(mocks.trackLeadMagnetClick).toHaveBeenCalledWith({
      slug: 'adhd-supplement-starter-checklist',
      sourcePath: '/',
    })
  })

  it('tracks homepage entity journeys once through document click capture after consent', () => {
    mocks.getConsent.mockReturnValue('granted')
    mocks.trackPageView.mockReturnValue(true)
    window.history.replaceState({}, '', '/')

    render(
      <>
        <ClickTracker />
        <Link href="/herbs/ashwagandha/" data-tracking-location="home-featured" onClick={(event) => event.preventDefault()}>
          Ashwagandha
        </Link>
      </>,
    )

    fireEvent.click(document.querySelector('a')!)

    expect(mocks.trackHomepageEntityClick).toHaveBeenCalledTimes(1)
    expect(mocks.trackHomepageEntityClick).toHaveBeenCalledWith({
      targetType: 'herb',
      targetSlug: 'ashwagandha',
      placement: 'home-featured',
    })
  })

  it('does not emit content journeys before analytics consent', () => {
    mocks.getConsent.mockReturnValue('unknown')
    window.history.replaceState({}, '', '/')

    render(
      <>
        <ClickTracker />
        <Link href="/compounds/glycine/" onClick={(event) => event.preventDefault()}>
          Glycine
        </Link>
      </>,
    )

    fireEvent.click(document.querySelector('a')!)

    expect(mocks.trackHomepageEntityClick).not.toHaveBeenCalled()
    expect(mocks.trackCollectionDetailClick).not.toHaveBeenCalled()
    expect(mocks.trackDetailCheckerClick).not.toHaveBeenCalled()
    expect(mocks.trackDetailBuilderClick).not.toHaveBeenCalled()
    expect(mocks.trackDetailRelatedEntityClick).not.toHaveBeenCalled()
  })

  it('does not track before analytics consent', () => {
    mocks.getConsent.mockReturnValue('unknown')
    render(
      <>
        <ClickTracker />
        <Link href="/lead-magnets/adhd-supplement-starter-checklist/" onClick={(event) => event.preventDefault()}>
          Open checklist
        </Link>
      </>,
    )

    fireEvent.click(document.querySelector('a')!)

    expect(mocks.trackPageView).not.toHaveBeenCalled()
    expect(mocks.trackLeadMagnetClick).not.toHaveBeenCalled()
  })

  it('does not install affiliate impression observers before analytics consent', () => {
    let consent = 'unknown'
    mocks.getConsent.mockImplementation(() => consent)

    const observe = vi.fn()
    const disconnect = vi.fn()
    const observerConstructed = vi.fn()

    class IntersectionObserverMock {
      readonly root: Element | Document | null = null
      readonly rootMargin = ''
      readonly thresholds = [0, 0.5, 1]

      constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
        observerConstructed()
      }

      observe = observe
      unobserve = vi.fn()
      disconnect = disconnect
      takeRecords = vi.fn(() => [])
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

    render(<ClickTracker />)
    expect(observerConstructed).not.toHaveBeenCalled()

    consent = 'granted'
    mocks.trackPageView.mockReturnValue(true)
    fireEvent(window, new Event('consent-granted'))

    expect(observerConstructed).toHaveBeenCalledTimes(1)
    expect(mocks.trackPageView).toHaveBeenCalledWith({ pagePath: '/guides/adhd/' })
  })
})
