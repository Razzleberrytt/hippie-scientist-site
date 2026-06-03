'use client'

import { useEffect } from 'react'

export default function ClickTracker() {
  useEffect(() => {
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
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', 'affiliate_click', {
            event_category: 'Affiliate',
            event_label: cta,
            destination: href,
            ingredient: ingredient || 'unknown',
            route: pathname
          })
        }

        // 2. Log to console in development
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Analytics] Affiliate Click tracked:', eventData)
        }

        // 3. Persist local log for debugging/instrumentation
        try {
          const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]')
          clicks.push(eventData)
          localStorage.setItem('affiliate_clicks', JSON.stringify(clicks.slice(-100))) // keep last 100
        } catch {
          // ignore localStorage issues
        }
      }
    }

    document.addEventListener('click', handleDocumentClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true })
    }
  }, [])

  return null
}
