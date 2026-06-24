export type RuntimeAnalyticsEvent = {
  type:
    | 'profile_view'
    | 'semantic_search'
    | 'compare_interaction'
    | 'rail_interaction'
    | 'pathway_traversal'
    | 'recommendation_interaction'
    | 'expand_section'
  entity?: string
  entityType?: 'herb' | 'compound' | 'pathway' | 'compare'
  metadata?: Record<string, unknown>
  timestamp?: number
}

const STORAGE_KEY = 'ths_runtime_analytics'
const MAX_EVENTS = 250

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

export function trackRuntimeEvent(event: RuntimeAnalyticsEvent) {
  if (!canUseStorage()) return

  try {
    const existing = getRuntimeAnalyticsEvents()

    const next = [
      {
        ...event,
        timestamp: Date.now(),
      },
      ...existing,
    ].slice(0, MAX_EVENTS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // silent fail for runtime safety
  }
}

export function getRuntimeAnalyticsEvents(): RuntimeAnalyticsEvent[] {
  if (!canUseStorage()) return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) return []

    const parsed = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getTopRuntimeSignals() {
  const events = getRuntimeAnalyticsEvents()

  const counts = new Map<string, number>()

  events.forEach((event) => {
    const key = `${event.type}:${event.entity || 'unknown'}`
    counts.set(key, (counts.get(key) || 0) + 1)
  })

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([key, count]) => ({ key, count }))
}

export function getRecentlyExploredEntities() {
  const events = getRuntimeAnalyticsEvents()

  const seen = new Set<string>()

  return events
    .filter((event) => event.entity)
    .filter((event) => {
      if (!event.entity || seen.has(event.entity)) return false
      seen.add(event.entity)
      return true
    })
    .slice(0, 12)
}
