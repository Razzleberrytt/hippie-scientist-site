import { appendAnalyticsEvent } from '@/utils/analytics/eventStorage'

export type GovernedPageType =
  | 'herb_detail'
  | 'compound_detail'
  | 'herbs_index'
  | 'compounds_index'
  | 'collection_page'
  | 'compare_page'

export type GovernedEventType =
  | 'governed_intro_visible'
  | 'governed_intro_step_click'
  | 'governed_faq_visible'
  | 'governed_related_question_click'
  | 'governed_quick_compare_visible'
  | 'governed_quick_compare_click'
  | 'governed_review_freshness_visible'
  | 'governed_review_freshness_toggle'
  | 'governed_card_summary_visible'
  | 'governed_browse_filter_change'
  | 'governed_collection_filter_change'
  | 'governed_cta_click'

export type GovernedEventAction = 'visible' | 'click' | 'change' | 'toggle'

type Params = {
  type: GovernedEventType
  eventAction: GovernedEventAction
  pageType: GovernedPageType
  entityType: 'herb' | 'compound' | 'collection' | 'compare' | 'mixed'
  entitySlug?: string
  surfaceId: string
  componentType: string
  item?: string
  variantId?: string
  profile?: string
  evidenceLabel?: string
  safetySignalPresent?: boolean
  reviewedStatus?: 'reviewed' | 'unreviewed' | 'not_applicable'
  freshnessState?: 'fresh' | 'stale' | 'aging' | 'not_applicable'
}

function asContext(params: Params) {
  const dimensions = [
    `surface:${params.surfaceId}`,
    `component:${params.componentType}`,
    `action:${params.eventAction}`,
    `entityType:${params.entityType}`,
    params.profile ? `profile:${params.profile}` : null,
    params.evidenceLabel ? `evidence:${params.evidenceLabel}` : null,
    typeof params.safetySignalPresent === 'boolean'
      ? `safetySignalPresent:${params.safetySignalPresent ? 'yes' : 'no'}`
      : null,
    params.reviewedStatus ? `reviewedStatus:${params.reviewedStatus}` : null,
    params.freshnessState ? `freshnessState:${params.freshnessState}` : null,
  ].filter(Boolean)

  return dimensions.join('|')
}

export function trackGovernedEvent(params: Params) {
  if (typeof window === 'undefined') return

  appendAnalyticsEvent({
    type: params.type,
    slug: `${params.entityType}:${params.entitySlug || params.surfaceId}`,
    item: params.item,
    context: asContext(params),
    sourceType: 'governed_surface',
    targetType: params.componentType,
    pageType: params.pageType,
    entityType: params.entityType,
    entitySlug: params.entitySlug,
    surfaceId: params.surfaceId,
    componentType: params.componentType,
    eventAction: params.eventAction,
    variantId: params.variantId,
    profile: params.profile,
    evidenceLabel: params.evidenceLabel,
    safetySignalPresent: params.safetySignalPresent,
    reviewedStatus: params.reviewedStatus,
    freshnessState: params.freshnessState,
  })
}
