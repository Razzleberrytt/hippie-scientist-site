import type { SeoCollection, SeoCollectionFilters } from '@/data/seoCollections'
import { splitClean } from '@/lib/sanitize'
import { type PrebuiltCombo } from '@/types/combos'

type CollectionRecord = Record<string, unknown>

export const COLLECTION_QUALITY_RULE = {
  introMinLength: 40,
  descriptionMinLength: 40,
  whoForMinLength: 70,
  selectionRationaleMinLength: 90,
  minCautions: 1,
  minAlternatives: 2,
  ctaLabelMinLength: 24,
  minItemsByType: {
    herb: 6,
    compound: 6,
    combo: 3,
  },
} as const

function toSearchBlob(fields: unknown[]): string {
  return fields
    .flatMap(field => splitClean(field))
    .map(token => token.toLowerCase())
    .join(' ')
}

function matchesAny(blob: string, terms?: string[]) {
  if (!terms?.length) return true
  return terms.some(term => blob.includes(term.toLowerCase()))
}

export function hasStableCollectionSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

export function filterHerbByCollection(herb: CollectionRecord, filters: SeoCollectionFilters): boolean {
  const effectBlob = toSearchBlob([herb.effects, herb.description])
  const mechanismBlob = toSearchBlob([herb.mechanism, herb.mechanismOfAction])
  const interactionBlob = toSearchBlob([herb.interactionTags, herb.interactions, herb.tags])

  const effectsMatch = matchesAny(effectBlob, filters.effectsAny)
  const mechanismMatch = matchesAny(mechanismBlob, filters.mechanismAny)
  const interactionMatch = matchesAny(interactionBlob, filters.interactionTagsAny)

  return effectsMatch && mechanismMatch && interactionMatch
}

export function filterCompoundByCollection(
  compound: CollectionRecord,
  filters: SeoCollectionFilters
): boolean {
  const effectBlob = toSearchBlob([compound.effects, compound.description])
  const mechanismBlob = toSearchBlob([compound.mechanism])
  const interactionBlob = toSearchBlob([
    compound.interactionTags,
    compound.interactions,
    compound.category,
  ])

  const effectsMatch = matchesAny(effectBlob, filters.effectsAny)
  const mechanismMatch = matchesAny(mechanismBlob, filters.mechanismAny)
  const interactionMatch = matchesAny(interactionBlob, filters.interactionTagsAny)

  return effectsMatch && mechanismMatch && interactionMatch
}

export function filterComboByCollection(combo: PrebuiltCombo, filters: SeoCollectionFilters): boolean {
  const goalMatch = !filters.comboGoalsAny?.length || filters.comboGoalsAny.includes(combo.goal)
  const nameMatch = matchesAny(combo.name.toLowerCase(), filters.comboNameAny)
  const descriptionMatch = matchesAny(combo.description.toLowerCase(), filters.comboDescriptionAny)
  return goalMatch && (nameMatch || descriptionMatch)
}

export function auditCollectionForIndexing(collection: SeoCollection, itemCount: number) {
  const reasons: string[] = []
  const editorial = collection.editorial

  if (!hasStableCollectionSlug(collection.slug)) reasons.push('unstable-slug')
  if (collection.intro.trim().length < COLLECTION_QUALITY_RULE.introMinLength) {
    reasons.push('missing-intro')
  }
  if (collection.description.trim().length < COLLECTION_QUALITY_RULE.descriptionMinLength) {
    reasons.push('missing-description')
  }
  if (!editorial) {
    reasons.push('missing-editorial-brief')
  } else {
    if (editorial.whoFor.trim().length < COLLECTION_QUALITY_RULE.whoForMinLength) {
      reasons.push('missing-who-for')
    }
    if (
      editorial.selectionRationale.trim().length <
      COLLECTION_QUALITY_RULE.selectionRationaleMinLength
    ) {
      reasons.push('missing-selection-rationale')
    }
    if (editorial.cautions.filter(note => note.trim().length > 0).length < COLLECTION_QUALITY_RULE.minCautions) {
      reasons.push('missing-caution')
    }
    if (
      editorial.alternatives.filter(item => item.trim().length > 0).length <
      COLLECTION_QUALITY_RULE.minAlternatives
    ) {
      reasons.push('missing-alternatives')
    }
    if (editorial.ctaLabel.trim().length < COLLECTION_QUALITY_RULE.ctaLabelMinLength) {
      reasons.push('missing-cta-guidance')
    }
  }

  const minRequired = COLLECTION_QUALITY_RULE.minItemsByType[collection.itemType]
  if (itemCount < minRequired) reasons.push('insufficient-matching-items')

  return {
    approved: reasons.length === 0,
    reasons,
    minRequired,
  }
}
