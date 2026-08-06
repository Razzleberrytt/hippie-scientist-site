import { appendAnalyticsEvent } from '@/utils/analytics/eventStorage'

type AtlasFilterName = 'search' | 'effect' | 'chemistry' | 'evidence' | 'noticeability' | 'safety'

export type AtlasLandingSource =
  | 'anxiety_hub'
  | 'sleep_hub'
  | 'focus_hub'
  | 'evidence_library'
  | 'herb_profile'
  | 'compound_profile'
  | 'editorial'
  | 'direct_or_external'

export function getAtlasLandingSource(referrer = typeof document !== 'undefined' ? document.referrer : ''): AtlasLandingSource {
  if (!referrer) return 'direct_or_external'

  try {
    const pathname = new URL(referrer, 'https://thehippiescientist.net').pathname
    if (pathname === '/guides/anxiety/' || pathname.startsWith('/guides/anxiety/')) return 'anxiety_hub'
    if (pathname === '/guides/sleep/' || pathname.startsWith('/guides/sleep/')) return 'sleep_hub'
    if (pathname === '/guides/focus/' || pathname.startsWith('/guides/focus/')) return 'focus_hub'
    if (pathname === '/guides/' || pathname.startsWith('/guides')) return 'evidence_library'
    if (pathname.startsWith('/herbs/')) return 'herb_profile'
    if (pathname.startsWith('/compounds/')) return 'compound_profile'
    if (pathname.startsWith('/articles/') || pathname.startsWith('/learn/')) return 'editorial'
  } catch {
    return 'direct_or_external'
  }

  return 'direct_or_external'
}

function withLandingSource(context: string) {
  return `${context};source:${getAtlasLandingSource()}`
}

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
    context: withLandingSource(`${params.filter}:${params.resultCount}`),
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
    context: withLandingSource('reset-filters'),
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
    context: withLandingSource(`position:${params.position};filters:${params.activeFilterCount}`),
    sourceType: 'collection',
    targetType: 'herb',
  })
}
