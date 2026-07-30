'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  getGuideTrackingContext,
  trackAffiliateClick,
  trackGuideView,
  trackLeadMagnetClick,
} from '@/lib/analytics'
import { CONSENT_GRANTED_EVENT, getConsent } from '../src/lib/consent'
import { loadAnalytics } from '../src/lib/loadAnalytics'

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
    window.addEventListener(CONSENT_GRANTED_EVENT, trackCurrentGuide)
    return () => window.removeEventListener(CONSENT_GRANTED_EVENT, trackCurrentGuide)
  }, [pathname])

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (!link) return

      const href = link.getAttribute('href') || ''
      const leadMagnetMatch = href.match(/^\/lead-magnets\/([^/?#]+)/)

      if (leadMagnetMatch && getConsent() === 'granted') {
        trackLeadMagnetClick({
          slug: leadMagnetMatch[1],
          sourcePath: window.location.pathname,
        })
      }
      
      // Determine if it's an outbound / affiliate link
      const isAffiliate = 
        href.includes('amazon.com') || 
        href.includes('amzn.to') || 
        link.getAttribute('rel')?.includes('sponsored')

      if (isAffiliate) {
        const cta = link.innerText.trim() || 'CTA'
        const pathname = window.location.pathname

        // Attempt to extract ingredient/compound/herb from context
        const ingredient = link.getAttribute('data-ingredient') || 
                           link.getAttribute('data-slug') || 
                           link.getAttribute('data-item') || 
                           (pathname.startsWith('/herbs/') || pathname.startsWith('/compounds/')
                             ? pathname.split('/')[2]
                             : '')

        // 1. Send to GA4 if active
        trackAffiliateClick({ itemName: ingredient || cta || 'unknown', program: href.includes('amazon') || href.includes('amzn.to') ? 'Amazon' : 'Affiliate' })

        // 2. No localStorage click log (privacy: affiliate clicks are only sent to consented analytics if gtag present).
        //    Previously stored full eventData (href, route, CTA, ingredient, ts) in localStorage under 'affiliate_clicks'.
        //    Removed to reduce stored data; rely on GA4 (gated by consent) + dev console only.
      }
    }

    document.addEventListener('click', handleDocumentClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true })
    }
  }, [])

  return null
}
