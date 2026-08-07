export type ComparisonOutcomeAnalyticsEvent = {
  type?: string
  context?: string
  item?: string
  slug?: string
}

function parseContext(context = '') {
  const values = new Map<string, string>()
  context.split(';').forEach((segment) => {
    const separator = segment.indexOf(':')
    if (separator < 1) return
    values.set(segment.slice(0, separator), segment.slice(separator + 1))
  })
  return values
}

export function buildComparisonOutcomePerformance(events: ComparisonOutcomeAnalyticsEvent[]) {
  const views = new Set<string>()
  const outcomes = new Map<string, { session: string; pageSlug: string; outcome: string; href: string }>()
  let unattributedEvents = 0

  events.forEach((event) => {
    if (event.type !== 'comparison_page_viewed' && event.type !== 'comparison_outcome_click') return
    const values = parseContext(event.context)
    const session = values.get('session')
    if (!session) {
      unattributedEvents += 1
      return
    }

    const pageSlug = event.slug || 'unknown'
    if (event.type === 'comparison_page_viewed') {
      views.add(`${session}|${pageSlug}`)
      return
    }

    const outcome = values.get('outcome') || 'unknown'
    const href = event.item || 'unknown'
    const key = `${session}|${pageSlug}|${outcome}|${href}`
    if (!outcomes.has(key)) outcomes.set(key, { session, pageSlug, outcome, href })
  })

  const pageStats = new Map<string, { views: number; engagedSessions: Set<string>; outcomes: number }>()
  views.forEach((key) => {
    const separator = key.indexOf('|')
    const pageSlug = key.slice(separator + 1)
    const current = pageStats.get(pageSlug) ?? { views: 0, engagedSessions: new Set<string>(), outcomes: 0 }
    current.views += 1
    pageStats.set(pageSlug, current)
  })

  const outcomeCounts = new Map<string, number>()
  outcomes.forEach((outcome) => {
    const current = pageStats.get(outcome.pageSlug) ?? { views: 0, engagedSessions: new Set<string>(), outcomes: 0 }
    current.engagedSessions.add(outcome.session)
    current.outcomes += 1
    pageStats.set(outcome.pageSlug, current)
    outcomeCounts.set(outcome.outcome, (outcomeCounts.get(outcome.outcome) ?? 0) + 1)
  })

  const pageRows = Array.from(pageStats.entries()).map(([pageSlug, stats]) => ({
    pageSlug,
    views: stats.views,
    engagedSessions: stats.engagedSessions.size,
    continuationRate: stats.views ? stats.engagedSessions.size / stats.views : 0,
    outcomes: stats.outcomes,
  })).sort((a, b) => b.continuationRate - a.continuationRate
    || b.engagedSessions - a.engagedSessions
    || b.views - a.views
    || a.pageSlug.localeCompare(b.pageSlug))

  const outcomeRows = Array.from(outcomeCounts.entries())
    .map(([outcome, clicks]) => ({ outcome, clicks }))
    .sort((a, b) => b.clicks - a.clicks || a.outcome.localeCompare(b.outcome))

  return {
    pageRows,
    outcomeRows,
    attributedViews: views.size,
    attributedOutcomes: outcomes.size,
    unattributedEvents,
  }
}
