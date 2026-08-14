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
})
