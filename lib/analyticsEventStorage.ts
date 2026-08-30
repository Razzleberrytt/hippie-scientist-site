import { canTrackAnalytics } from '@/lib/consent'

type AnalyticsEvent = Record<string, unknown>

const STORAGE_KEY = 'hs_analytics_events'
const ANALYTICS_LOCAL_STORAGE_KEYS = [STORAGE_KEY, 'ths_runtime_analytics'] as const
const ANALYTICS_SESSION_KEYS = [
  'hs_related_botanical_session',
  'hs_compare_hub_session',
  'hs_compare_hub_seen_categories',
  'hs_compare_seen_pages',
  'hs_compare_pending_entry',
  'botanical-atlas-engagement',
] as const
const MAX_EVENTS = 200

export function appendAnalyticsEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined' || !canTrackAnalytics()) return

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const existing = raw ? JSON.parse(raw) : []
    const events = Array.isArray(existing) ? existing : []
    const next = [
      ...events,
      {
        ...event,
        timestamp: new Date().toISOString(),
      },
    ].slice(-MAX_EVENTS)

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage failures to avoid disrupting the current interaction.
  }
}

export function clearAnalyticsEvents(): void {
  if (typeof window === 'undefined') return

  for (const key of ANALYTICS_LOCAL_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Continue clearing the remaining analytics-owned stores.
    }
  }

  for (const key of ANALYTICS_SESSION_KEYS) {
    try {
      window.sessionStorage.removeItem(key)
    } catch {
      // Continue clearing the remaining analytics-owned stores.
    }
  }
}
