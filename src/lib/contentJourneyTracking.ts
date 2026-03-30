import { appendAnalyticsEvent } from '@/utils/analytics/eventStorage'

type EntityType = 'herb' | 'compound' | 'collection'
type DetailType = 'herb' | 'compound'
type CtaMetadata = {
  pageType: 'herb_detail' | 'compound_detail' | 'collection_page'
  entitySlug: string
  ctaType: 'tool' | 'builder' | 'affiliate'
  ctaPosition: string
  variantId: string
}

function trackJourneyEvent(params: {
  type:
    | 'homepage_entity_click'
    | 'collection_detail_click'
    | 'detail_interaction_checker_click'
    | 'detail_builder_click'
    | 'detail_related_entity_click'
  source: string
  sourceType: 'homepage' | 'collection' | 'detail'
  targetType: EntityType | 'interaction_checker' | 'builder'
  target: string
  placement: string
  ctaMetadata?: CtaMetadata
}) {
  if (typeof window === 'undefined') return

  appendAnalyticsEvent({
    type: params.type,
    slug: params.source,
    item: params.target,
    context: params.placement,
    sourceType: params.sourceType,
    targetType: params.targetType,
    pageType: params.ctaMetadata?.pageType,
    entitySlug: params.ctaMetadata?.entitySlug,
    ctaType: params.ctaMetadata?.ctaType,
    ctaPosition: params.ctaMetadata?.ctaPosition,
    variantId: params.ctaMetadata?.variantId,
  })
}

export function trackHomepageEntityClick(params: {
  targetType: EntityType
  targetSlug: string
  placement: string
}) {
  trackJourneyEvent({
    type: 'homepage_entity_click',
    source: 'home',
    sourceType: 'homepage',
    targetType: params.targetType,
    target: `${params.targetType}:${params.targetSlug}`,
    placement: params.placement,
  })
}

export function trackCollectionDetailClick(params: {
  collectionSlug: string
  targetType: Extract<EntityType, 'herb' | 'compound'>
  targetSlug: string
  placement: string
}) {
  trackJourneyEvent({
    type: 'collection_detail_click',
    source: params.collectionSlug,
    sourceType: 'collection',
    targetType: params.targetType,
    target: `${params.targetType}:${params.targetSlug}`,
    placement: params.placement,
  })
}

export function trackDetailCheckerClick(params: {
  detailType: DetailType
  detailSlug: string
  placement: string
  ctaMetadata?: CtaMetadata
}) {
  trackJourneyEvent({
    type: 'detail_interaction_checker_click',
    source: `${params.detailType}:${params.detailSlug}`,
    sourceType: 'detail',
    targetType: 'interaction_checker',
    target: 'interaction-checker',
    placement: params.placement,
    ctaMetadata: params.ctaMetadata,
  })
}

export function trackDetailBuilderClick(params: {
  detailType: DetailType
  detailSlug: string
  placement: string
  ctaMetadata?: CtaMetadata
}) {
  trackJourneyEvent({
    type: 'detail_builder_click',
    source: `${params.detailType}:${params.detailSlug}`,
    sourceType: 'detail',
    targetType: 'builder',
    target: 'build',
    placement: params.placement,
    ctaMetadata: params.ctaMetadata,
  })
}

export function trackCtaSlotImpression(params: {
  sourceType: 'collection' | 'detail'
  source: string
  placement: string
  ctaMetadata: CtaMetadata
}) {
  if (typeof window === 'undefined') return

  appendAnalyticsEvent({
    type: 'cta_slot_impression',
    slug: params.source,
    item: params.ctaMetadata.ctaType,
    context: params.placement,
    sourceType: params.sourceType,
    targetType: 'cta_slot',
    pageType: params.ctaMetadata.pageType,
    entitySlug: params.ctaMetadata.entitySlug,
    ctaType: params.ctaMetadata.ctaType,
    ctaPosition: params.ctaMetadata.ctaPosition,
    variantId: params.ctaMetadata.variantId,
  })
}

export function trackDetailRelatedEntityClick(params: {
  detailType: DetailType
  detailSlug: string
  targetType: EntityType
  targetSlug: string
  placement: string
}) {
  trackJourneyEvent({
    type: 'detail_related_entity_click',
    source: `${params.detailType}:${params.detailSlug}`,
    sourceType: 'detail',
    targetType: params.targetType,
    target: `${params.targetType}:${params.targetSlug}`,
    placement: params.placement,
  })
}
