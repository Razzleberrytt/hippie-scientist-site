'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { CONSENT_CHANGE_EVENT, getConsent } from '../src/lib/consent'
import { trackRevenueEvent } from '../src/lib/revenue-tracking'

export const RECOMMENDATION_IMPRESSION_THRESHOLD = 0.5
export const RECOMMENDATION_IMPRESSION_DELAY_MS = 1000

type RevenueImpressionTrackerProps = {
  children: ReactNode
  location: string
  label: string
  productSlug?: string
  productSlot?: string
  productAsin?: string
  className?: string
}

export default function RevenueImpressionTracker({
  children,
  location,
  label,
  productSlug,
  productSlot,
  productAsin,
  className,
}: RevenueImpressionTrackerProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const visibleRef = useRef(false)
  const trackedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element || typeof IntersectionObserver === 'undefined') return

    const clearPending = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const scheduleQualifiedImpression = () => {
      clearPending()
      if (trackedRef.current || !visibleRef.current || getConsent() !== 'granted') return

      timerRef.current = setTimeout(() => {
        timerRef.current = null
        if (trackedRef.current || !visibleRef.current || getConsent() !== 'granted') return

        trackedRef.current = true
        trackRevenueEvent({
          kind: 'recommendation_impression',
          location,
          label,
          productSlug,
          productSlot,
          productAsin,
        })
      }, RECOMMENDATION_IMPRESSION_DELAY_MS)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = Boolean(
          entry?.isIntersecting && entry.intersectionRatio >= RECOMMENDATION_IMPRESSION_THRESHOLD,
        )

        if (visibleRef.current) {
          scheduleQualifiedImpression()
        } else {
          clearPending()
        }
      },
      { threshold: [0, RECOMMENDATION_IMPRESSION_THRESHOLD, 1] },
    )

    const handleConsentChange = () => {
      if (visibleRef.current) scheduleQualifiedImpression()
    }

    observer.observe(element)
    window.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChange)

    return () => {
      clearPending()
      observer.disconnect()
      window.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChange)
    }
  }, [label, location, productAsin, productSlot, productSlug])

  return (
    <div
      ref={elementRef}
      className={className}
      data-revenue-impression-tracker="true"
      data-ingredient={productSlug || undefined}
      data-product-slot={productSlot || undefined}
      data-product-asin={productAsin || undefined}
      data-tracking-location={location}
    >
      {children}
    </div>
  )
}
