'use client'

import { canTrackAnalytics } from '@/lib/consent'

export type SleepNextAction = 'research-hub' | 'newsletter-interest'

export function trackSleepNextActionClick(params: {
  action: SleepNextAction
  destination: string
  sourcePath: string
}): void {
  try {
    if (!canTrackAnalytics()) return
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
    if (typeof gtag !== 'function') return
    gtag('event', 'sleep_next_action_click', {
      action: params.action,
      destination: params.destination,
      source_path: params.sourcePath,
    })
  } catch {
    // Measurement must never block navigation.
  }
}
