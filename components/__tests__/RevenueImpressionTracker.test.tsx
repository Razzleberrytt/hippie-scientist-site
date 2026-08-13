import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import RevenueImpressionTracker, {
  RECOMMENDATION_IMPRESSION_DELAY_MS,
  RECOMMENDATION_IMPRESSION_THRESHOLD,
} from '../RevenueImpressionTracker'

const mocks = vi.hoisted(() => ({
  getConsent: vi.fn(),
  trackRevenueEvent: vi.fn(),
}))

vi.mock('../../src/lib/consent', () => ({
  CONSENT_CHANGE_EVENT: 'hs:consent-changed',
  getConsent: mocks.getConsent,
}))

vi.mock('../../src/lib/revenue-tracking', () => ({
  trackRevenueEvent: mocks.trackRevenueEvent,
}))

let observerCallback: IntersectionObserverCallback

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds = [0, RECOMMENDATION_IMPRESSION_THRESHOLD, 1]

  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}

function setVisibility(isIntersecting: boolean, intersectionRatio: number) {
  const target = document.querySelector('[data-revenue-impression-tracker="true"]') as Element

  act(() => {
    observerCallback(
      [
        {
          isIntersecting,
          intersectionRatio,
          target,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    )
  })
}

function renderTracker() {
  return render(
    <RevenueImpressionTracker
      location="recommendation-section"
      label="Magnesium glycinate"
      productSlug="magnesium"
      productSlot="overall"
      productAsin="B000000000"
    >
      <p>Product card</p>
    </RevenueImpressionTracker>,
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  mocks.getConsent.mockReturnValue('granted')
  mocks.trackRevenueEvent.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  mocks.getConsent.mockReset()
})

describe('RevenueImpressionTracker', () => {
  it('tracks after at least half the product is visible for one second', () => {
    renderTracker()
    setVisibility(true, RECOMMENDATION_IMPRESSION_THRESHOLD)

    act(() => vi.advanceTimersByTime(RECOMMENDATION_IMPRESSION_DELAY_MS - 1))
    expect(mocks.trackRevenueEvent).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(mocks.trackRevenueEvent).toHaveBeenCalledWith({
      kind: 'recommendation_impression',
      location: 'recommendation-section',
      label: 'Magnesium glycinate',
      productSlug: 'magnesium',
      productSlot: 'overall',
      productAsin: 'B000000000',
    })
  })

  it('does not count products that remain below the visibility threshold', () => {
    renderTracker()
    setVisibility(true, RECOMMENDATION_IMPRESSION_THRESHOLD - 0.01)

    act(() => vi.advanceTimersByTime(RECOMMENDATION_IMPRESSION_DELAY_MS * 2))
    expect(mocks.trackRevenueEvent).not.toHaveBeenCalled()
  })

  it('waits for consent when a product is already visible', () => {
    mocks.getConsent.mockReturnValue(null)
    renderTracker()
    setVisibility(true, 1)

    act(() => vi.advanceTimersByTime(RECOMMENDATION_IMPRESSION_DELAY_MS * 2))
    expect(mocks.trackRevenueEvent).not.toHaveBeenCalled()

    mocks.getConsent.mockReturnValue('granted')
    act(() => {
      window.dispatchEvent(new CustomEvent('hs:consent-changed'))
      vi.advanceTimersByTime(RECOMMENDATION_IMPRESSION_DELAY_MS)
    })

    expect(mocks.trackRevenueEvent).toHaveBeenCalledTimes(1)
  })

  it('counts a product only once per mounted recommendation', () => {
    renderTracker()
    setVisibility(true, 1)
    act(() => vi.advanceTimersByTime(RECOMMENDATION_IMPRESSION_DELAY_MS))

    setVisibility(false, 0)
    setVisibility(true, 1)
    act(() => vi.advanceTimersByTime(RECOMMENDATION_IMPRESSION_DELAY_MS * 2))

    expect(mocks.trackRevenueEvent).toHaveBeenCalledTimes(1)
  })
})
