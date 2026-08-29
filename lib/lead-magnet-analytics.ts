'use client'

import { canTrackAnalytics } from '@/lib/consent'

export type LeadMagnetFunnelEvent = 'lead_magnet_impression' | 'lead_magnet_signup_attempt' | 'lead_magnet_signup_success'

export interface LeadMagnetAnalyticsInput {
  slug: string
  sourcePath: string
  placement: string
}

export function trackLeadMagnetFunnelEvent(eventName: LeadMagnetFunnelEvent, input: LeadMagnetAnalyticsInput) {
  if (typeof window === 'undefined' || !canTrackAnalytics()) return
  const payload = {
    lead_magnet_slug: input.slug,
    source_path: input.sourcePath,
    placement: input.placement,
  }
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...payload })
  window.gtag?.('event', eventName, payload)
}
