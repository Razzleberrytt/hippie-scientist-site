'use client'

import { canTrackAnalytics } from '@/lib/consent'
import { safeFailedSearchAnalyticsTerm } from '@/lib/search/search-experience'

export function trackFailedSiteSearch(query: string): void {
  if (typeof window === 'undefined' || !canTrackAnalytics()) return

  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag !== 'function') return

  const safeTerm = safeFailedSearchAnalyticsTerm(query)
  gtag('event', 'site_search_failed', {
    search_term: safeTerm || undefined,
    query_class: safeTerm ? 'content-safe' : 'private-or-complex',
    query_length: query.trim().length,
    query_tokens: query.trim().split(/\s+/).filter(Boolean).length,
    page_path: '/search/',
  })
}
