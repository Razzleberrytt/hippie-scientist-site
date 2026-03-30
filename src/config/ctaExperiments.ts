export type CtaPageType = 'herb_detail' | 'compound_detail' | 'collection_page'

export type CtaVariantId = 'A' | 'B' | 'C'

export type CtaSlotType = 'tool' | 'builder' | 'related' | 'affiliate'

export type CtaVariantDefinition = {
  id: CtaVariantId
  label: string
  description: string
  slotOrder: CtaSlotType[]
}

export type CtaExperimentConfig = {
  defaultVariantByPageType: Record<CtaPageType, CtaVariantId>
  pageOverrides: Record<string, CtaVariantId>
  trustFirstGuard: {
    pageTypes: CtaPageType[]
    cautionThreshold: number
    fallbackVariantId: CtaVariantId
  }
}

export const CTA_VARIANTS: Record<CtaVariantId, CtaVariantDefinition> = {
  A: {
    id: 'A',
    label: 'Tool-first compact',
    description: 'Tool CTA above builder and affiliate CTA with minimal editorial interruption.',
    slotOrder: ['tool', 'builder', 'affiliate', 'related'],
  },
  B: {
    id: 'B',
    label: 'Trust-first guided',
    description: 'Trust panel, then tool CTA, related context, then affiliate CTA.',
    slotOrder: ['tool', 'related', 'builder', 'affiliate'],
  },
  C: {
    id: 'C',
    label: 'Editorial compare path',
    description: 'Editorial/compare context before tool CTA, then affiliate CTA.',
    slotOrder: ['related', 'tool', 'builder', 'affiliate'],
  },
}

export const CTA_EXPERIMENT_CONFIG: CtaExperimentConfig = {
  defaultVariantByPageType: {
    herb_detail: 'B',
    compound_detail: 'B',
    collection_page: 'C',
  },
  pageOverrides: {
    'collection:herbs-for-relaxation': 'A',
    'collection:herbs-for-sleep': 'A',
    'collection:herbs-for-focus': 'A',
    'collection:calming-herb-combinations': 'A',
    'collection:stimulant-herb-combinations': 'A',
  },
  trustFirstGuard: {
    pageTypes: ['herb_detail', 'compound_detail'],
    cautionThreshold: 1,
    fallbackVariantId: 'B',
  },
}

export function resolveCtaVariant(params: {
  pageType: CtaPageType
  entityType: 'herb' | 'compound' | 'collection'
  entitySlug: string
  cautionCount?: number
}) {
  const overrideKey = `${params.entityType}:${params.entitySlug}`
  const overrideVariant = CTA_EXPERIMENT_CONFIG.pageOverrides[overrideKey]
  const defaultVariant = CTA_EXPERIMENT_CONFIG.defaultVariantByPageType[params.pageType]
  const initialVariant = overrideVariant || defaultVariant

  const shouldForceTrustVariant =
    CTA_EXPERIMENT_CONFIG.trustFirstGuard.pageTypes.includes(params.pageType) &&
    (params.cautionCount || 0) >= CTA_EXPERIMENT_CONFIG.trustFirstGuard.cautionThreshold

  const activeVariantId = shouldForceTrustVariant
    ? CTA_EXPERIMENT_CONFIG.trustFirstGuard.fallbackVariantId
    : initialVariant

  return {
    activeVariantId,
    variant: CTA_VARIANTS[activeVariantId],
    assignment: overrideVariant ? 'override' : shouldForceTrustVariant ? 'trust_guard' : 'default',
  } as const
}

export const CTA_EXPERIMENT_EVENTS = {
  impressionEvent: 'cta_slot_impression',
  clickEvent: 'cta_slot_click',
  trackedDimensions: ['pageType', 'entitySlug', 'ctaType', 'ctaPosition', 'variantId'] as const,
}
