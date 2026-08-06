import { appendAnalyticsEvent } from '@/utils/analytics/eventStorage'

type AtlasFilterName = 'search' | 'effect' | 'chemistry' | 'evidence' | 'noticeability' | 'safety'
const ENGAGEMENT_KEY = 'botanical-atlas-engagement'

export type AtlasLandingSource =
  | 'anxiety_hub'
  | 'sleep_hub'
  | 'focus_hub'
  | 'evidence_library'
  | 'herb_profile'
  | 'compound_profile'
  | 'editorial'
  | 'direct_or_external'

export type AtlasEngagementState = {
  firstFilter: AtlasFilterName | null
  distinctFilters: AtlasFilterName[]
  profileOpened: boolean
}

const EMPTY_ENGAGEMENT: AtlasEngagementState = {
  firstFilter: null,
  distinctFilters: [],
  profileOpened: false,
}

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

export function getAtlasEngagementState(): AtlasEngagementState {
  if (typeof window === 'undefined') return EMPTY_ENGAGEMENT
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(ENGAGEMENT_KEY) || 'null')
    if (!parsed || !Array.isArray(parsed.distinctFilters)) return EMPTY_ENGAGEMENT
    return {
      firstFilter: parsed.firstFilter ?? null,
      distinctFilters: parsed.distinctFilters,
      profileOpened: Boolean(parsed.profileOpened),
    }
  } catch {
    return EMPTY_ENGAGEMENT
  }
}

function saveAtlasEngagementState(state: AtlasEngagementState) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(state))
  } catch {
    // Analytics must never block the atlas experience.
  }
}

function recordFilterDepth(filter: AtlasFilterName) {
  const current = getAtlasEngagementState()
  const distinctFilters = current.distinctFilters.includes(filter)
    ? current.distinctFilters
    : [...current.distinctFilters, filter]
  const next = {
    ...current,
    firstFilter: current.firstFilter ?? filter,
    distinctFilters,
  }
  saveAtlasEngagementState(next)
  return next
}

function withLandingSource(context: string) {
  return `${context};source:${getAtlasLandingSource()}`
}

function withEngagementDepth(context: string, state = getAtlasEngagementState()) {
  return `${context};first_filter:${state.firstFilter ?? 'none'};distinct_filters:${state.distinctFilters.length};profile_opened:${state.profileOpened ? 'yes' : 'no'}`
}

export function trackAtlasFilter(params: {
  filter: AtlasFilterName
  value: string
  resultCount: number
}) {
  if (typeof window === 'undefined') return
  const engagement = recordFilterDepth(params.filter)

  appendAnalyticsEvent({
    type: 'botanical_atlas_filter',
    slug: 'botanical-activity-atlas',
    item: params.value || 'cleared',
    context: withLandingSource(withEngagementDepth(`${params.filter}:${params.resultCount}`, engagement)),
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
    context: withLandingSource(withEngagementDepth('reset-filters')),
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
  const engagement = { ...getAtlasEngagementState(), profileOpened: true }
  saveAtlasEngagementState(engagement)

  appendAnalyticsEvent({
    type: 'botanical_atlas_profile_click',
    slug: 'botanical-activity-atlas',
    item: params.slug,
    context: withLandingSource(withEngagementDepth(`position:${params.position};filters:${params.activeFilterCount}`, engagement)),
    sourceType: 'collection',
    targetType: 'herb',
  })
}
