export type ComparisonOutcomeAnalyticsEvent = {
  type?: string
  context?: string
  item?: string
  slug?: string
}

type ViewAttribution = {
  session: string
  pageSlug: string
  entrySource: string
  entryCategory: string
  entryLabel: string
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
  const views = new Map<string, ViewAttribution>()
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
      const key = `${session}|${pageSlug}`
      if (!views.has(key)) {
        views.set(key, {
          session,
          pageSlug,
          entrySource: values.get('entry_source') || 'direct_or_external',
          entryCategory: values.get('entry_category') || 'none',
          entryLabel: values.get('entry_label') || pageSlug,
        })
      }
      return
    }

    const outcome = values.get('outcome') || 'unknown'
    const href = event.item || 'unknown'
    const key = `${session}|${pageSlug}|${outcome}|${href}`
    if (!outcomes.has(key)) outcomes.set(key, { session, pageSlug, outcome, href })
  })

  const pageStats = new Map<string, { views: number; engagedSessions: Set<string>; outcomes: number }>()
  views.forEach((view) => {
    const current = pageStats.get(view.pageSlug) ?? { views: 0, engagedSessions: new Set<string>(), outcomes: 0 }
    current.views += 1
    pageStats.set(view.pageSlug, current)
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

  const journeyStats = new Map<string, {
    pageSlug: string
    entrySource: string
    entryCategory: string
    views: number
    engagedSessions: Set<string>
    outcomeCounts: Map<string, number>
  }>()

  views.forEach((view) => {
    const key = `${view.pageSlug}|${view.entrySource}|${view.entryCategory}`
    const current = journeyStats.get(key) ?? {
      pageSlug: view.pageSlug,
      entrySource: view.entrySource,
      entryCategory: view.entryCategory,
      views: 0,
      engagedSessions: new Set<string>(),
      outcomeCounts: new Map<string, number>(),
    }
    current.views += 1
    journeyStats.set(key, current)
  })

  outcomes.forEach((outcome) => {
    const view = views.get(`${outcome.session}|${outcome.pageSlug}`)
    if (!view) return
    const key = `${view.pageSlug}|${view.entrySource}|${view.entryCategory}`
    const current = journeyStats.get(key)
    if (!current) return
    current.engagedSessions.add(outcome.session)
    current.outcomeCounts.set(outcome.outcome, (current.outcomeCounts.get(outcome.outcome) ?? 0) + 1)
  })

  const journeyRows = Array.from(journeyStats.values()).map((stats) => {
    const topOutcome = Array.from(stats.outcomeCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? 'none'
    return {
      pageSlug: stats.pageSlug,
      entrySource: stats.entrySource,
      entryCategory: stats.entryCategory,
      views: stats.views,
      engagedSessions: stats.engagedSessions.size,
      continuationRate: stats.views ? stats.engagedSessions.size / stats.views : 0,
      topOutcome,
    }
  }).sort((a, b) => b.continuationRate - a.continuationRate
    || b.engagedSessions - a.engagedSessions
    || b.views - a.views
    || a.pageSlug.localeCompare(b.pageSlug)
    || a.entrySource.localeCompare(b.entrySource))

  return {
    pageRows,
    outcomeRows,
    journeyRows,
    attributedViews: views.size,
    attributedOutcomes: outcomes.size,
    unattributedEvents,
  }
}
