import { useEffect } from 'react'
import { canTrackAnalytics, CONSENT_CHANGE_EVENT } from '@/lib/consent'
import { useLocation } from './router-compat'
import { loadAnalytics } from './loadAnalytics'

export function useGA() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (!canTrackAnalytics()) return
    loadAnalytics()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onConsentChanged = () => {
      if (canTrackAnalytics()) {
        loadAnalytics()
      }
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChanged)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChanged)
  }, [])

  useEffect(() => {
    if (!canTrackAnalytics()) return
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: pathname + search,
      page_title: document.title,
    })
  }, [pathname, search])
}
