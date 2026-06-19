import type { RuntimeAnalyticsEvent } from './runtime-analytics'

export type AnalyticsInsight = {
  label: string
  value: number
  type: 'search' | 'profile' | 'compare' | 'recommendation' | 'rail' | 'expansion'
}

function eventKey(event: RuntimeAnalyticsEvent) {
  return event.entity || event.type
}

function insightType(event: RuntimeAnalyticsEvent): AnalyticsInsight['type'] {
  switch (event.type) {
    case 'semantic_search':
      return 'search'
    case 'profile_view':
      return 'profile'
    case 'compare_interaction':
      return 'compare'
    case 'recommendation_interaction':
      return 'recommendation'
    case 'rail_interaction':
      return 'rail'
    default:
      return 'expansion'
  }
}

export function getAnalyticsInsights(events: RuntimeAnalyticsEvent[], limit = 20): AnalyticsInsight[] {
  const grouped = new Map<string, AnalyticsInsight>()

  events.forEach((event) => {
    const key = `${event.type}:${eventKey(event)}`
    const existing = grouped.get(key)

    if (existing) {
      existing.value += 1
      return
    }

    grouped.set(key, {
      label: eventKey(event),
      value: 1,
      type: insightType(event),
    })
  })

  return [...grouped.values()]
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit)
}

export function getFailedSearchCandidates(events: RuntimeAnalyticsEvent[]) {
  return events
    .filter((event) => event.type === 'semantic_search')
    .filter((event) => event.metadata?.results === 0)
    .map((event) => String(event.entity || ''))
    .filter(Boolean)
}

export function getTraversalDepth(events: RuntimeAnalyticsEvent[]) {
  const traversalEvents = events.filter((event) =>
    ['profile_view', 'rail_interaction', 'compare_interaction', 'recommendation_interaction'].includes(event.type),
  )

  return traversalEvents.length
}

export function getAuthorityClusterSignals(events: RuntimeAnalyticsEvent[]) {
  return events
    .filter((event) => event.entityType === 'pathway' || event.type === 'semantic_search')
    .map((event) => String(event.entity || ''))
    .filter(Boolean)
}
