'use client'

import { useEffect } from 'react'
import { trackAffiliateClick, trackGuideView } from '@/lib/analytics'

export default function ClickTracker() {
  useEffect(() => {
    const guideMatch = window.location.pathname.match(/^\/guides\/([^/]+)\/?$/)
    if (guideMatch?.[1]) {
      trackGuideView({ slug: guideMatch[1] })
    }

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (!link) return

      const href = link.getAttribute('href') || ''
      
      // Determine if it's an outbound / affiliate link
      const isAffiliate = 
        href.includes('amazon.com') || 
        href.includes('amzn.to') || 
        link.getAttribute('rel')?.includes('sponsored') ||
        link.getAttribute('rel')?.includes('nofollow')

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

        const eventData = {
          event: 'affiliate_click',
          route: pathname,
          href: href,
          cta: cta,
          ingredient: ingredient || 'unknown',
          timestamp: new Date().toISOString()
        }

        // 1. Send to GA4 if active
        trackAffiliateClick({ itemName: ingredient || cta || 'unknown', program: href.includes('amazon') || href.includes('amzn.to') ? 'Amazon' : 'Affiliate' })

        // 2. Log to console in development
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Analytics] Affiliate Click tracked:', eventData)
        }

        // 3. No localStorage click log (privacy: affiliate clicks are only sent to consented analytics if gtag present).
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
