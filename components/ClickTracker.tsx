'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  getGuideTrackingContext,
  trackGuideView,
  trackLeadMagnetClick,
  trackNavigationClick,
  type NavigationClickParams,
} from '@/lib/analytics'
import { CONSENT_CHANGE_EVENT, getConsent } from '@/lib/consent'
import { loadAnalytics } from '../src/lib/loadAnalytics'
import { trackRevenueEvent } from '../src/lib/revenue-tracking'

function navigationIntentForHref(href: string): NavigationClickParams['intent'] {
  const path = href.split(/[?#]/, 1)[0]
  if (/^\/(start|guides\/(sleep|stress|anxiety|focus|mental-health|adhd))(\/|$)/.test(path) || path === '/guides' || path === '/guides/') return 'Goals'
  if (/^\/(herbs|compounds|evidence|articles|learn|tools\/botanical-activity-atlas|info\/methodology)(\/|$)/.test(path)) return 'Ingredients'
  if (/^\/(guides\/compare|compare)(\/|$)/.test(path)) return 'Compare'
  if (/^\/(safety-checker|info\/supplement-safety-checklist|info\/dosing)(\/|$)/.test(path)) return 'Safety'
  return 'Unknown'
}

export default function ClickTracker() {
  const pathname = usePathname() || '/'
  const lastTrackedGuidePath = useRef<string | null>(null)

  useEffect(() => {
    const guide = getGuideTrackingContext(pathname)
    if (!guide) return

    const trackCurrentGuide = () => {
      if (getConsent() !== 'granted' || lastTrackedGuidePath.current === guide.pagePath) return

      // loadAnalytics creates the gtag queue synchronously before its network script
      // arrives, so the first consented view is not lost.
      loadAnalytics()
      trackGuideView(guide)
      lastTrackedGuidePath.current = guide.pagePath
    }

    trackCurrentGuide()
    window.addEventListener(CONSENT_CHANGE_EVENT, trackCurrentGuide)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, trackCurrentGuide)
  }, [pathname])

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (!link) return

      const href = link.getAttribute('href') || ''
      const leadMagnetMatch = href.match(/^\/lead-magnets\/([^/?#]+)/)

      if (getConsent() === 'granted') {
        const primaryNav = link.closest('nav[aria-label="Primary"]')
        const mobileNav = link.closest('nav[aria-label="Mobile primary links"]')
        if ((primaryNav || mobileNav) && href.startsWith('/')) {
          trackNavigationClick({
            label: link.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120) || 'Navigation link',
            destination: href,
            intent: navigationIntentForHref(href),
            surface: mobileNav ? 'mobile' : 'desktop',
            pagePath: window.location.pathname,
          })
        }
      }

      if (leadMagnetMatch && getConsent() === 'granted') {
        trackLeadMagnetClick({
          slug: leadMagnetMatch[1],
          sourcePath: window.location.pathname,
        })
      }

      const isAffiliate =
        href.includes('amazon.com') ||
        href.includes('amzn.to') ||
        link.getAttribute('rel')?.includes('sponsored')

      // Recommendation components emit their own richer event after this capture phase.
      // Skip them here so a single click never becomes two analytics conversions.
      if (!isAffiliate || link.dataset.revenueTracked === 'true' || getConsent() !== 'granted') return

      const cta = link.innerText.trim() || 'CTA'
      const currentPath = window.location.pathname
      const ingredient =
        link.dataset.ingredient ||
        link.dataset.slug ||
        link.dataset.item ||
        (currentPath.startsWith('/herbs/') || currentPath.startsWith('/compounds/')
          ? currentPath.split('/')[2]
          : '')

      trackRevenueEvent({
        kind: 'affiliate_click',
        location: link.dataset.trackingLocation || 'document-capture',
        label: cta || ingredient || 'unknown',
        target: href,
        productSlug: ingredient || undefined,
        productSlot: link.dataset.productSlot || undefined,
        productAsin: link.dataset.productAsin || undefined,
      })
    }

    document.addEventListener('click', handleDocumentClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true })
    }
  }, [])

  return null
}
