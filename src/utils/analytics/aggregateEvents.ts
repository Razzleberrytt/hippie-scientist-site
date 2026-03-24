import { readAnalyticsEvents, type StoredAnalyticsEvent } from './eventStorage'

type RankedItem = {
  name: string
  count: number
}

type RankedCollection = {
  slug: string
  views: number
  ctaClicks: number
  conversionRate: number
}

type RankedCombo = {
  comboId: string
  count: number
}

type ConversionRates = {
  viewToCTA: number
  CTAtoChecker: number
  checkerToStack: number
}

function roundRate(value: number) {
  return Number(value.toFixed(2))
}

function countBy<T>(
  rows: StoredAnalyticsEvent[],
  selector: (event: StoredAnalyticsEvent) => T | null
) {
  const map = new Map<T, number>()

  rows.forEach(event => {
    const key = selector(event)
    if (key === null) return
    map.set(key, (map.get(key) || 0) + 1)
  })

  return map
}

function toSortedRows<T>(map: Map<T, number>) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
}

export function getEventCountsByType() {
  const events = readAnalyticsEvents()
  const counts = countBy(events, event => event.type)

  return Object.fromEntries(toSortedRows(counts)) as Record<string, number>
}

export function getTopCollectionPages(limit = 10): RankedCollection[] {
  const events = readAnalyticsEvents()
  const views = countBy(events, event =>
    event.type === 'collection_page_view' && event.slug ? event.slug : null
  )
  const clicks = countBy(events, event =>
    event.type === 'collection_cta_click' && event.slug ? event.slug : null
  )

  const allSlugs = new Set<string>([...views.keys(), ...clicks.keys()])

  return Array.from(allSlugs)
    .map(slug => {
      const viewCount = views.get(slug) || 0
      const clickCount = clicks.get(slug) || 0
      return {
        slug,
        views: viewCount,
        ctaClicks: clickCount,
        conversionRate: viewCount ? roundRate(clickCount / viewCount) : 0,
      }
    })
    .sort((a, b) => b.views - a.views || b.ctaClicks - a.ctaClicks)
    .slice(0, limit)
}

function getTopItemsByType(
  type: 'collection_item_add_to_checker' | 'collection_item_add_to_stack',
  limit = 10
) {
  const events = readAnalyticsEvents()
  const rows = countBy(events, event => (event.type === type && event.item ? event.item : null))
  return toSortedRows(rows)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count })) as RankedItem[]
}

export function getTopItemsAddedToChecker(limit = 10): RankedItem[] {
  return getTopItemsByType('collection_item_add_to_checker', limit)
}

export function getTopItemsAddedToStack(limit = 10): RankedItem[] {
  return getTopItemsByType('collection_item_add_to_stack', limit)
}

export function getTopCombosRun(limit = 10): RankedCombo[] {
  const events = readAnalyticsEvents()
  const rows = countBy(events, event =>
    event.type === 'collection_combo_run' && event.comboId ? event.comboId : null
  )

  return toSortedRows(rows)
    .slice(0, limit)
    .map(([comboId, count]) => ({ comboId, count })) as RankedCombo[]
}

export function getConversionRates(): ConversionRates {
  const counts = getEventCountsByType()
  const pageViews = counts.collection_page_view || 0
  const ctaClicks = counts.collection_cta_click || 0
  const checkerAdds = counts.collection_item_add_to_checker || 0
  const stackAdds = counts.collection_item_add_to_stack || 0

  return {
    viewToCTA: pageViews ? roundRate(ctaClicks / pageViews) : 0,
    CTAtoChecker: ctaClicks ? roundRate(checkerAdds / ctaClicks) : 0,
    checkerToStack: checkerAdds ? roundRate(stackAdds / checkerAdds) : 0,
  }
}
