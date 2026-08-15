'use client'

import { useEffect } from 'react'
import { canTrackAnalytics } from '@/lib/consent'

/**
 * Privacy-light navigation telemetry for backlog 854-856.
 * Records only the clicked navigation label, destination path, and nav surface.
 * It intentionally excludes search text, profile state, and health inputs.
 */
export default function NavigationClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest<HTMLAnchorElement>('nav[aria-label="Primary"] a[href], nav[aria-label="Mobile primary links"] a[href]')
      if (!anchor || !canTrackAnalytics()) return

      const href = anchor.getAttribute('href') || ''
      if (!href.startsWith('/')) return

      const nav = anchor.closest('nav')
      const surface = nav?.getAttribute('aria-label') === 'Mobile primary links' ? 'mobile' : 'desktop'
      const label = (anchor.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)

      try {
        const analyticsWindow = window as Window & {
          gtag?: (command: 'event', eventName: string, params: Record<string, string>) => void
          plausible?: (eventName: string, options?: { props?: Record<string, string> }) => void
        }
        const payload = {
          nav_label: label,
          nav_destination: href.split(/[?#]/, 1)[0],
          nav_surface: surface,
        }
        analyticsWindow.gtag?.('event', 'navigation_click', payload)
        analyticsWindow.plausible?.('navigation_click', { props: payload })
        window.dispatchEvent(new CustomEvent('hs:analytics', { detail: { name: 'navigation_click', payload } }))
      } catch {
        // Analytics must never interfere with navigation.
      }
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  return null
}
