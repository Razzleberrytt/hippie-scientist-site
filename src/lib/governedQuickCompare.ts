import herbsSummary from '../../public/data/herbs-summary.json'
import compoundsSummary from '../../public/data/compounds-summary.json'
import {
  getEvidenceLabelMeta,
  getGovernedResearchEnrichment,
  getPublishableGovernedEntries,
  type GovernedEntityType,
} from '@/lib/governedResearch'
import {
  buildEnrichmentRecommendations,
  type EnrichmentRecommendation,
} from '@/lib/enrichmentRecommendations'
import type { ResearchEnrichment } from '@/types/researchEnrichment'

export type GovernedQuickCompareDimension =
  | 'evidence_strength'
  | 'safety_caution_presence'
  | 'uncertainty_or_conflict'
  | 'relationship_context'
  | 'supported_use_overlap'

export type GovernedQuickCompareCard = {
  targetType: GovernedEntityType
  targetSlug: string
  targetName: string
  href: string
  dimensions: Partial<Record<GovernedQuickCompareDimension, string>>
  recommendationSignals: string[]
}

export type GovernedQuickCompareExclusion = {
  targetType: GovernedEntityType
  targetSlug: string
  reason:
    | 'same_entity'
    | 'not_publishable_governed'
    | 'no_supported_governed_dimensions'
    | 'candidate_limit_reached'
}

export type GovernedQuickCompareSection = {
  sourceType: GovernedEntityType
  sourceSlug: string
  sourceName: string
  sourceEvidenceLabel: string
  dimensionsUsed: GovernedQuickCompareDimension[]
  dimensionsExcluded: GovernedQuickCompareDimension[]
  cards: GovernedQuickCompareCard[]
  exclusions: GovernedQuickCompareExclusion[]
}

const CANDIDATE_LIMIT = 2

function asNameMap(rows: Array<{ slug?: string; name?: string; common?: string }>) {
  return new Map(rows.map(row => [String(row.slug || ''), String(row.common || row.name || row.slug || '')]))
}

const NAMES = {
  herb: asNameMap(herbsSummary as Array<{ slug?: string; name?: string; common?: string }>),
  compound: asNameMap(compoundsSummary as Array<{ slug?: string; name?: string; common?: string }>),
}

function normalizeTokens(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length >= 5)
}

function buildUseTokenSet(enrichment: ResearchEnrichment) {
  const tokens = new Set<string>()
  for (const claim of enrichment.supportedUses) {
    for (const token of normalizeTokens(claim.claim || '')) tokens.add(token)
  }
  return tokens
}

function hasSafetyCautions(enrichment: ResearchEnrichment) {
  return (
    enrichment.interactions.length > 0 ||
    enrichment.contraindications.length > 0 ||
    enrichment.adverseEffects.length > 0 ||
    (enrichment.safetyProfile?.summary.total || 0) > 0
  )
}

function hasUncertaintyOrConflict(enrichment: ResearchEnrichment) {
  return (
    enrichment.pageEvidenceJudgment.grading.conflictState !== 'none' ||
    enrichment.pageEvidenceJudgment.uncertaintyNotes.length > 0 ||
    enrichment.pageEvidenceJudgment.conflictNotes.length > 0 ||
    enrichment.conflictNotes.length > 0
  )
}

function relationContext(
  source: ResearchEnrichment,
  target: ResearchEnrichment,
  recommendation: EnrichmentRecommendation,
  targetType: GovernedEntityType,
  targetSlug: string,
) {
  const sourceRelation = (source.relatedEntities || []).find(
    item => item.entityType === targetType && item.slug === targetSlug,
  )
  const targetRelation = (target.relatedEntities || []).find(item => item.entityType)
  if (sourceRelation) {
    return `Governed relationship: ${sourceRelation.relationshipType.replace(/_/g, ' ')}.`
  }
  if (targetRelation) {
    return `Related through governed ${targetRelation.relationshipType.replace(/_/g, ' ')} context.`
  }
  return recommendation.reason
}

function buildDimensionText(
  source: ResearchEnrichment,
  target: ResearchEnrichment,
  recommendation: EnrichmentRecommendation,
): Partial<Record<GovernedQuickCompareDimension, string>> {
  const out: Partial<Record<GovernedQuickCompareDimension, string>> = {}

  const sourceEvidence = getEvidenceLabelMeta(source.pageEvidenceJudgment.evidenceLabel)
  const targetEvidence = getEvidenceLabelMeta(target.pageEvidenceJudgment.evidenceLabel)
  out.evidence_strength = `${targetEvidence.title}; this page is ${sourceEvidence.title.toLowerCase()}.`

  out.safety_caution_presence = hasSafetyCautions(target)
    ? 'Governed safety cautions are present; review interactions and contraindications before comparing use context.'
    : 'No specific governed caution entries are listed; keep standard interaction checks in place.'

  out.uncertainty_or_conflict = hasUncertaintyOrConflict(target)
    ? 'Uncertainty or conflicting signals are explicitly noted in governed evidence judgments.'
    : 'No explicit conflict flag is present in current governed evidence judgments.'

  out.relationship_context = relationContext(
    source,
    target,
    recommendation,
    recommendation.targetType,
    recommendation.targetSlug,
  )

  const sourceTokens = buildUseTokenSet(source)
  const targetTokens = buildUseTokenSet(target)
  const overlap = Array.from(sourceTokens).filter(token => targetTokens.has(token))
  if (overlap.length > 0) {
    out.supported_use_overlap = `Shares governed use-context themes (${overlap.slice(0, 2).join(', ')}).`
  }

  return out
}

export function buildGovernedQuickCompareSection(
  entityType: GovernedEntityType,
  entitySlug: string,
): GovernedQuickCompareSection | null {
  const source = getGovernedResearchEnrichment(entityType, entitySlug)
  if (!source) return null

  const publishable = new Set(
    getPublishableGovernedEntries().map(row => `${row.entityType}:${row.entitySlug}`),
  )

  const recommendationBundle = buildEnrichmentRecommendations(entityType, entitySlug)
  const recommendationCandidates = [
    ...recommendationBundle.compareContrast,
    ...recommendationBundle.safetyNextSteps,
    ...recommendationBundle.mechanismNextSteps,
    ...recommendationBundle.relatedHerbs,
    ...recommendationBundle.relatedCompounds,
  ]

  const deduped = new Map<string, EnrichmentRecommendation>()
  for (const candidate of recommendationCandidates) {
    const key = `${candidate.targetType}:${candidate.targetSlug}`
    const existing = deduped.get(key)
    if (!existing || candidate.score > existing.score) deduped.set(key, candidate)
  }
  for (const candidate of getPublishableGovernedEntries()) {
    if (candidate.entityType === entityType && candidate.entitySlug === entitySlug) continue
    const key = `${candidate.entityType}:${candidate.entitySlug}`
    if (!deduped.has(key)) {
      deduped.set(key, {
        targetType: candidate.entityType,
        targetSlug: candidate.entitySlug,
        signalType: 'evidence_strength_comparison',
        reason: 'Publishable governed page available for cautious side-by-side evidence and safety context review.',
        score: 10,
      })
    }
  }

  const cards: GovernedQuickCompareCard[] = []
  const exclusions: GovernedQuickCompareExclusion[] = []

  for (const recommendation of deduped.values()) {
    if (recommendation.targetType === entityType && recommendation.targetSlug === entitySlug) {
      exclusions.push({
        targetType: recommendation.targetType,
        targetSlug: recommendation.targetSlug,
        reason: 'same_entity',
      })
      continue
    }

    const key = `${recommendation.targetType}:${recommendation.targetSlug}`
    if (!publishable.has(key)) {
      exclusions.push({
        targetType: recommendation.targetType,
        targetSlug: recommendation.targetSlug,
        reason: 'not_publishable_governed',
      })
      continue
    }

    const target = getGovernedResearchEnrichment(recommendation.targetType, recommendation.targetSlug)
    if (!target) {
      exclusions.push({
        targetType: recommendation.targetType,
        targetSlug: recommendation.targetSlug,
        reason: 'not_publishable_governed',
      })
      continue
    }

    const dimensions = buildDimensionText(source, target, recommendation)
    if (Object.keys(dimensions).length < 4) {
      exclusions.push({
        targetType: recommendation.targetType,
        targetSlug: recommendation.targetSlug,
        reason: 'no_supported_governed_dimensions',
      })
      continue
    }

    if (cards.length >= CANDIDATE_LIMIT) {
      exclusions.push({
        targetType: recommendation.targetType,
        targetSlug: recommendation.targetSlug,
        reason: 'candidate_limit_reached',
      })
      continue
    }

    cards.push({
      targetType: recommendation.targetType,
      targetSlug: recommendation.targetSlug,
      targetName:
        NAMES[recommendation.targetType].get(recommendation.targetSlug) || recommendation.targetSlug,
      href:
        recommendation.targetType === 'herb'
          ? `/herbs/${recommendation.targetSlug}`
          : `/compounds/${recommendation.targetSlug}`,
      dimensions,
      recommendationSignals: [recommendation.signalType],
    })
  }

  if (cards.length === 0) return null

  const used = new Set<GovernedQuickCompareDimension>()
  for (const card of cards) {
    for (const key of Object.keys(card.dimensions) as GovernedQuickCompareDimension[]) used.add(key)
  }

  const allDimensions: GovernedQuickCompareDimension[] = [
    'evidence_strength',
    'safety_caution_presence',
    'uncertainty_or_conflict',
    'relationship_context',
    'supported_use_overlap',
  ]

  return {
    sourceType: entityType,
    sourceSlug: entitySlug,
    sourceName: NAMES[entityType].get(entitySlug) || entitySlug,
    sourceEvidenceLabel: getEvidenceLabelMeta(source.pageEvidenceJudgment.evidenceLabel).title,
    dimensionsUsed: allDimensions.filter(dimension => used.has(dimension)),
    dimensionsExcluded: allDimensions.filter(dimension => !used.has(dimension)),
    cards,
    exclusions,
  }
}
