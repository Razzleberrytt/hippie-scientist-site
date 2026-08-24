import { fireEvent, render } from '@testing-library/react'
import Link from 'next/link'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ClickTracker from '../ClickTracker'

const mocks = vi.hoisted(() => ({
  getConsent: vi.fn(),
  trackLeadMagnetClick: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/guides/adhd/',
}))

vi.mock('@/lib/analytics', () => ({
  getGuideTrackingContext: () => null,
  trackAffiliateClick: vi.fn(),
  trackGuideView: vi.fn(),
  trackLeadMagnetClick: mocks.trackLeadMagnetClick,
}))

vi.mock('@/lib/consent', () => ({
  CONSENT_CHANGE_EVENT: 'consent-granted',
  getConsent: mocks.getConsent,
}))

vi.mock('@/src/lib/loadAnalytics', () => ({
  loadAnalytics: vi.fn(),
}))

afterEach(() => {
  mocks.getConsent.mockReset()
  mocks.trackLeadMagnetClick.mockReset()
  vi.unstubAllGlobals()
})

describe('ClickTracker', () => {
  it('tracks lead-magnet clicks after analytics consent', () => {
    mocks.getConsent.mockReturnValue('granted')
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
    fireEvent(window, new Event('consent-granted'))

    expect(observerConstructed).toHaveBeenCalledTimes(1)
  })
})
