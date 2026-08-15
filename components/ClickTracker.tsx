'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  getGuideTrackingContext,
  trackGuideView,
  trackLeadMagnetClick,
  trackNavigationClick,
} from '@/lib/analytics'
import { CONSENT_CHANGE_EVENT, getConsent } from '@/lib/consent'
import { loadAnalytics } from '../src/lib/loadAnalytics'
import { trackRevenueEvent } from '../src/lib/revenue-tracking'

function isAffiliateLink(link: HTMLAnchorElement) {
  const href = link.getAttribute('href') || ''
  return href.includes('amazon.com') || href.includes('amzn.to') || Boolean(link.getAttribute('rel')?.includes('sponsored'))
}

function affiliateMetadata(link: HTMLAnchorElement) {
  const href = link.getAttribute('href') || ''
  const currentPath = window.location.pathname
  const ingredient =
    link.dataset.ingredient ||
    link.dataset.slug ||
    link.dataset.item ||
    (currentPath.startsWith('/herbs/') || currentPath.startsWith('/compounds/') ? currentPath.split('/')[2] : '')
  return {
    href,
    ingredient,
    label: link.innerText.trim() || link.getAttribute('aria-label') || ingredient || 'Affiliate CTA',
    location: link.dataset.trackingLocation || 'document-capture',
    productSlot: link.dataset.productSlot || undefined,
    productAsin: link.dataset.productAsin || undefined,
    modulePosition: link.dataset.modulePosition || link.closest<HTMLElement>('[data-module-position]')?.dataset.modulePosition,
    ctaVariant: link.dataset.ctaVariant || undefined,
    experimentVariant: link.dataset.experimentVariant || undefined,
    retailer: link.dataset.retailer || undefined,
  }
}

export default function ClickTracker() {
  const pathname = usePathname() || '/'
  const lastTrackedGuidePath = useRef<string | null>(null)

  useEffect(() => {
    const guide = getGuideTrackingContext(pathname)
    if (!guide) return

    const trackCurrentGuide = () => {
      if (getConsent() !== 'granted' || lastTrackedGuidePath.current === guide.pagePath) return
      loadAnalytics()
      trackGuideView(guide)
      lastTrackedGuidePath.current = guide.pagePath
    }

    trackCurrentGuide()
    window.addEventListener(CONSENT_CHANGE_EVENT, trackCurrentGuide)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, trackCurrentGuide)
  }, [pathname])

  useEffect(() => {
    const seenImpressions = new WeakSet<HTMLAnchorElement>()
    const visibleAffiliateLinks = new Map<HTMLAnchorElement, boolean>()

    const trackGenericImpression = (link: HTMLAnchorElement) => {
      if (seenImpressions.has(link) || getConsent() !== 'granted') return
      if (link.closest('[data-revenue-impression-tracker="true"]')) return
      const meta = affiliateMetadata(link)
      seenImpressions.add(link)
      trackRevenueEvent({
        kind: 'recommendation_impression',
        location: meta.location,
        label: meta.label,
        target: meta.href,
        productSlug: meta.ingredient || undefined,
        productSlot: meta.productSlot,
        productAsin: meta.productAsin,
        modulePosition: meta.modulePosition,
        ctaVariant: meta.ctaVariant,
        experimentVariant: meta.experimentVariant,
        retailer: meta.retailer,
      })
    }

    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver((entries) => {
          for (const entry of entries) {
            const link = entry.target as HTMLAnchorElement
            const qualified = Boolean(entry.isIntersecting && entry.intersectionRatio >= 0.5)
            visibleAffiliateLinks.set(link, qualified)
            if (qualified) trackGenericImpression(link)
          }
        }, { threshold: [0, 0.5, 1] })

    const observeAffiliateLinks = (root: ParentNode = document) => {
      if (!observer) return
      root.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
        if (!isAffiliateLink(link) || link.dataset.affiliateObserverAttached === 'true') return
        link.dataset.affiliateObserverAttached = 'true'
        observer.observe(link)
      })
    }

    observeAffiliateLinks()
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement) observeAffiliateLinks(node)
        }
      }
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    const handleConsentChange = () => {
      if (getConsent() !== 'granted') return
      for (const [link, visible] of visibleAffiliateLinks.entries()) {
        if (visible) trackGenericImpression(link)
      }
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChange)

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest<HTMLAnchorElement>('a')
      if (!link) return

      const href = link.getAttribute('href') || ''
      const consentGranted = getConsent() === 'granted'
      const nav = link.closest('nav[aria-label="Primary"], nav[aria-label="Mobile primary links"]')

      if (nav && href.startsWith('/') && consentGranted) {
        trackNavigationClick({
          label: link.textContent?.trim().replace(/\s+/g, ' ') || 'Navigation link',
          destination: href,
          sourcePath: window.location.pathname,
          location: nav.getAttribute('aria-label') === 'Primary' ? 'desktop-primary' : 'mobile-primary',
        })
      }

      const leadMagnetMatch = href.match(/^\/lead-magnets\/([^/?#]+)/)
      if (leadMagnetMatch && consentGranted) {
        trackLeadMagnetClick({ slug: leadMagnetMatch[1], sourcePath: window.location.pathname })
      }

      if (!isAffiliateLink(link) || link.dataset.revenueTracked === 'true' || !consentGranted) return
      const meta = affiliateMetadata(link)
      trackRevenueEvent({
        kind: 'affiliate_click',
        location: meta.location,
        label: meta.label,
        target: meta.href,
        productSlug: meta.ingredient || undefined,
        productSlot: meta.productSlot,
        productAsin: meta.productAsin,
        modulePosition: meta.modulePosition,
        ctaVariant: meta.ctaVariant,
        experimentVariant: meta.experimentVariant,
        retailer: meta.retailer,
      })
    }

    document.addEventListener('click', handleDocumentClick, { capture: true })
    return () => {
      observer?.disconnect()
      mutationObserver.disconnect()
      visibleAffiliateLinks.clear()
      window.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChange)
      document.removeEventListener('click', handleDocumentClick, { capture: true })
    }
  }, [])

  return null
}
