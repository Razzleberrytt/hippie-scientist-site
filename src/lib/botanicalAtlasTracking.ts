import { appendAnalyticsEvent } from '@/utils/analytics/eventStorage'

type AtlasFilterName = 'search' | 'effect' | 'chemistry' | 'evidence' | 'noticeability' | 'safety'

export function trackAtlasFilter(params: {
  filter: AtlasFilterName
  value: string
  resultCount: number
}) {
  if (typeof window === 'undefined') return

  appendAnalyticsEvent({
    type: 'botanical_atlas_filter',
    slug: 'botanical-activity-atlas',
    item: params.value || 'cleared',
    context: `${params.filter}:${params.resultCount}`,
    sourceType: 'collection',
    targetType: 'collection',
  })
}

export function trackAtlasReset(activeFilterCount: number) {
  if (typeof window === 'undefined') return

  appendAnalyticsEvent({
    type: 'botanical_atlas_reset',
    slug: 'botanical-activity-atlas',
    item: String(activeFilterCount),
    context: 'reset-filters',
    sourceType: 'collection',
    targetType: 'collection',
  })
}

export function trackAtlasProfileClick(params: {
  slug: string
  position: number
  activeFilterCount: number
}) {
  if (typeof window === 'undefined') return

  appendAnalyticsEvent({
    type: 'botanical_atlas_profile_click',
    slug: 'botanical-activity-atlas',
    item: params.slug,
    context: `position:${params.position};filters:${params.activeFilterCount}`,
    sourceType: 'collection',
    targetType: 'herb',
  })
}
