export type CompareHubAnalyticsEvent = {
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

export function buildCompareHubPerformance(events: CompareHubAnalyticsEvent[]) {
  const categoryImpressions = new Set<string>()
  const clicks = new Map<string, { session: string; href: string; label: string; source: string; category: string }>()
  let unattributedEvents = 0

  events.forEach((event) => {
    if (event.type !== 'compare_hub_category_shown' && event.type !== 'compare_hub_click') return
    const values = parseContext(event.context)
    const session = values.get('session')
    if (!session) {
      unattributedEvents += 1
      return
    }

    if (event.type === 'compare_hub_category_shown') {
      const category = event.slug || 'unknown'
      categoryImpressions.add(`${session}|${category}`)
      return
    }

    const href = event.slug || 'unknown'
    const label = event.item || href
    const source = values.get('source') || 'unknown'
    const category = values.get('category') || 'none'
    const key = `${session}|${source}|${category}|${href}`
    if (!clicks.has(key)) clicks.set(key, { session, href, label, source, category })
  })

  const categoryStats = new Map<string, { impressions: number; clicks: number }>()
  categoryImpressions.forEach((key) => {
    const category = key.split('|').slice(1).join('|')
    const current = categoryStats.get(category) ?? { impressions: 0, clicks: 0 }
    current.impressions += 1
    categoryStats.set(category, current)
  })
  clicks.forEach((click) => {
    if (click.source !== 'featured_category' || click.category === 'none') return
    const current = categoryStats.get(click.category) ?? { impressions: 0, clicks: 0 }
    current.clicks += 1
    categoryStats.set(click.category, current)
  })

  const categoryRows = Array.from(categoryStats.entries()).map(([category, stats]) => ({
    category,
    impressions: stats.impressions,
    clicks: stats.clicks,
    ctr: stats.impressions ? stats.clicks / stats.impressions : 0,
  })).sort((a, b) => b.ctr - a.ctr || b.impressions - a.impressions || a.category.localeCompare(b.category))

  const goalCounts = new Map<string, number>()
  const routeCounts = new Map<string, { label: string; clicks: number }>()
  let dynamicMatrixClicks = 0
  clicks.forEach((click) => {
    if (click.source === 'goal_starter') goalCounts.set(click.label, (goalCounts.get(click.label) ?? 0) + 1)
    const route = routeCounts.get(click.href) ?? { label: click.label, clicks: 0 }
    route.clicks += 1
    routeCounts.set(click.href, route)
    if (click.href.includes('/guides/compare/dynamic/')) dynamicMatrixClicks += 1
  })

  const goalRows = Array.from(goalCounts.entries())
    .map(([label, clickCount]) => ({ label, clicks: clickCount }))
    .sort((a, b) => b.clicks - a.clicks || a.label.localeCompare(b.label))
  const routeRows = Array.from(routeCounts.entries())
    .map(([href, value]) => ({ href, label: value.label, clicks: value.clicks }))
    .sort((a, b) => b.clicks - a.clicks || a.href.localeCompare(b.href))

  return {
    categoryRows,
    goalRows,
    routeRows,
    dynamicMatrixClicks,
    attributedClicks: clicks.size,
    attributedCategoryImpressions: categoryImpressions.size,
    unattributedEvents,
  }
}
