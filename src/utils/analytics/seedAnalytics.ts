import {
  getConversionRates,
  getEventCountsByType,
  getTopCollectionPages,
  getTopCombosRun,
  getTopItemsAddedToChecker,
  getTopItemsAddedToStack,
} from './aggregateEvents'
import {
  readAnalyticsEvents,
  writeAnalyticsEvents,
  type StoredAnalyticsEvent,
} from './eventStorage'

type WeightedOption<T> = {
  value: T
  weight: number
}

const COLLECTION_WEIGHTS: WeightedOption<string>[] = [
  { value: 'relaxation', weight: 56 },
  { value: 'sleep', weight: 30 },
  { value: 'focus', weight: 14 },
]

const ITEM_WEIGHTS: WeightedOption<string>[] = [
  { value: 'ashwagandha', weight: 32 },
  { value: 'l-theanine', weight: 30 },
  { value: 'magnesium', weight: 18 },
  { value: 'rhodiola', weight: 14 },
  { value: "lion's mane", weight: 6 },
]

const COMBO_WEIGHTS: WeightedOption<string>[] = [
  { value: 'calm-baseline', weight: 34 },
  { value: 'sleep-reset', weight: 26 },
  { value: 'focus-flow', weight: 18 },
  { value: 'stress-recovery', weight: 14 },
  { value: 'deep-work-light', weight: 8 },
]

function isBrowser() {
  return typeof window !== 'undefined'
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sampleWeighted<T>(options: WeightedOption<T>[]): T {
  const total = options.reduce((sum, option) => sum + option.weight, 0)
  let threshold = Math.random() * total

  for (const option of options) {
    threshold -= option.weight
    if (threshold <= 0) return option.value
  }

  return options[options.length - 1].value
}

function sampleFrom<T>(rows: T[], fallback: () => T): T {
  if (rows.length === 0) return fallback()
  return rows[randomInt(0, rows.length - 1)]
}

function timestampWithinLastDays(days: number) {
  const now = Date.now()
  const lookbackMs = days * 24 * 60 * 60 * 1000
  return now - Math.floor(Math.random() * lookbackMs)
}

function makeEvent(
  type: StoredAnalyticsEvent['type'],
  extra: Pick<StoredAnalyticsEvent, 'slug' | 'item' | 'comboId'>
): StoredAnalyticsEvent {
  return {
    type,
    ...extra,
    timestamp: timestampWithinLastDays(7),
  }
}

export type SeedAnalyticsSummary = {
  seededEvents: number
  totalEvents: number
  countsByType: Record<string, number>
  topCollections: ReturnType<typeof getTopCollectionPages>
  topCheckerItems: ReturnType<typeof getTopItemsAddedToChecker>
  topStackItems: ReturnType<typeof getTopItemsAddedToStack>
  topCombos: ReturnType<typeof getTopCombosRun>
  conversionRates: ReturnType<typeof getConversionRates>
}

export function seedAnalyticsData(): SeedAnalyticsSummary | null {
  if (!isBrowser()) return null

  const viewCount = randomInt(80, 115)
  const ctaCount = Math.max(30, Math.round(viewCount * (0.42 + Math.random() * 0.14)))
  const checkerCount = Math.max(16, Math.round(ctaCount * (0.52 + Math.random() * 0.15)))
  const stackCount = Math.max(10, Math.round(checkerCount * (0.48 + Math.random() * 0.18)))
  const comboCount = Math.max(6, Math.round(stackCount * (0.38 + Math.random() * 0.22)))

  const views = Array.from({ length: viewCount }, () =>
    makeEvent('collection_page_view', { slug: sampleWeighted(COLLECTION_WEIGHTS) })
  )

  const ctas = Array.from({ length: ctaCount }, () => {
    const sourceView = sampleFrom(views, () =>
      makeEvent('collection_page_view', { slug: sampleWeighted(COLLECTION_WEIGHTS) })
    )

    return makeEvent('collection_cta_click', { slug: sourceView.slug })
  })

  const checkerAdds = Array.from({ length: checkerCount }, () => {
    const sourceCTA = sampleFrom(ctas, () =>
      makeEvent('collection_cta_click', { slug: 'relaxation' })
    )
    return makeEvent('collection_item_add_to_checker', {
      slug: sourceCTA.slug,
      item: sampleWeighted(ITEM_WEIGHTS),
    })
  })

  const stackAdds = Array.from({ length: stackCount }, () => {
    const sourceChecker = sampleFrom(checkerAdds, () =>
      makeEvent('collection_item_add_to_checker', {
        slug: 'relaxation',
        item: sampleWeighted(ITEM_WEIGHTS),
      })
    )

    return makeEvent('collection_item_add_to_stack', {
      slug: sourceChecker.slug,
      item: sourceChecker.item,
    })
  })

  const comboRuns = Array.from({ length: comboCount }, () => {
    const sourceStack = sampleFrom(stackAdds, () =>
      makeEvent('collection_item_add_to_stack', {
        slug: 'relaxation',
        item: sampleWeighted(ITEM_WEIGHTS),
      })
    )

    return makeEvent('collection_combo_run', {
      slug: sourceStack.slug,
      comboId: sampleWeighted(COMBO_WEIGHTS),
    })
  })

  const seeded = [...views, ...ctas, ...checkerAdds, ...stackAdds, ...comboRuns].sort(
    (a, b) => b.timestamp - a.timestamp
  )

  const existing = readAnalyticsEvents()
  writeAnalyticsEvents([...seeded, ...existing])

  window.dispatchEvent(new CustomEvent('hs:analytics-events-updated'))

  return {
    seededEvents: seeded.length,
    totalEvents: readAnalyticsEvents().length,
    countsByType: getEventCountsByType(),
    topCollections: getTopCollectionPages(),
    topCheckerItems: getTopItemsAddedToChecker(),
    topStackItems: getTopItemsAddedToStack(),
    topCombos: getTopCombosRun(),
    conversionRates: getConversionRates(),
  }
}
