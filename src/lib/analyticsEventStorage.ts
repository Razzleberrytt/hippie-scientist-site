import { canTrackAnalytics } from '@/lib/consent'

type AnalyticsEvent = Record<string, unknown>

const STORAGE_KEY = 'hs_analytics_events'
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
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures to avoid disrupting privacy controls.
  }
}
