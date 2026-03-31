import { getGovernedResearchEnrichment, type GovernedEntityType } from '@/lib/governedResearch'
import { buildEnrichmentRecommendations } from '@/lib/enrichmentRecommendations'
import type { EvidenceLabel, ResearchEnrichment } from '@/types/researchEnrichment'

export type EnrichmentComparableEntity = {
  entityType: GovernedEntityType
  entitySlug: string
  entityName: string
}

export type GovernedEntitySnapshot = {
  entityType: GovernedEntityType
  entitySlug: string
  entityName: string
  evidenceLabel: EvidenceLabel
  hasSafetySignals: boolean
  hasMechanismCoverage: boolean
  hasConstituentCoverage: boolean
  hasConflictOrUncertainty: boolean
  weakEvidenceOnly: boolean
  lastReviewedAt: string
}

export type GovernedCollectionSummary = {
  includedCount: number
  governedReviewedCount: number
  nonGovernedCount: number
  evidenceLabelDistribution: Record<EvidenceLabel, number>
  strongerHumanSupportCount: number
  limitedHumanSupportCount: number
  preclinicalOrTraditionalOnlyCount: number
  safetySignalsPresentCount: number
  interactionsPresentCount: number
  mechanismCoveragePresentCount: number
  constituentCoveragePresentCount: number
  unresolvedConflictOrUncertaintyCount: number
  lastReviewedAtMostRecent: string | null
  lastReviewedAtOldest: string | null
  hasSufficientGovernedCoverage: boolean
  allowComparativeHighlights: boolean
  degradeReasons: string[]
  relatedGovernedCompoundCount: number
  relatedGovernedCompoundSlugs: string[]
  governedEntities: GovernedEntitySnapshot[]
}

const EVIDENCE_LABELS: EvidenceLabel[] = [
  'stronger_human_support',
  'limited_human_support',
  'observational_only',
  'preclinical_only',
  'traditional_use_only',
  'mixed_or_uncertain',
  'conflicting_evidence',
  'insufficient_evidence',
]

const WEAK_EVIDENCE_ONLY = new Set<EvidenceLabel>([
  'preclinical_only',
  'traditional_use_only',
  'insufficient_evidence',
])

function hasSafetySignals(enrichment: ResearchEnrichment) {
  return Boolean(
    enrichment.interactions.length ||
      enrichment.contraindications.length ||
      enrichment.adverseEffects.length ||
      enrichment.populationSpecificNotes.length ||
      (enrichment.safetyProfile?.summary?.total ?? 0) > 0,
  )
}

function hasConflictOrUncertainty(enrichment: ResearchEnrichment) {
  const label = enrichment.pageEvidenceJudgment.evidenceLabel
  return Boolean(
    enrichment.conflictNotes.length ||
      enrichment.pageEvidenceJudgment.conflictNotes.length ||
      enrichment.pageEvidenceJudgment.uncertaintyNotes.length ||
      enrichment.editorialReadiness?.hasConflictOrWeakEvidence ||
      label === 'mixed_or_uncertain' ||
      label === 'conflicting_evidence',
  )
}

function toSnapshot(entity: EnrichmentComparableEntity): GovernedEntitySnapshot | null {
  const enrichment = getGovernedResearchEnrichment(entity.entityType, entity.entitySlug)
  if (!enrichment) return null

  const evidenceLabel = enrichment.pageEvidenceJudgment.evidenceLabel
  return {
    entityType: entity.entityType,
    entitySlug: entity.entitySlug,
    entityName: entity.entityName,
    evidenceLabel,
    hasSafetySignals: hasSafetySignals(enrichment),
    hasMechanismCoverage: enrichment.mechanisms.length > 0,
    hasConstituentCoverage: enrichment.constituents.length > 0,
    hasConflictOrUncertainty: hasConflictOrUncertainty(enrichment),
    weakEvidenceOnly: WEAK_EVIDENCE_ONLY.has(evidenceLabel),
    lastReviewedAt: enrichment.lastReviewedAt,
  }
}

function createEmptyDistribution() {
  return EVIDENCE_LABELS.reduce(
    (acc, label) => {
      acc[label] = 0
      return acc
    },
    {} as Record<EvidenceLabel, number>,
  )
}

export function buildGovernedCollectionSummary(
  entities: EnrichmentComparableEntity[],
): GovernedCollectionSummary {
  const governedEntities = entities
    .map(toSnapshot)
    .filter((snapshot): snapshot is GovernedEntitySnapshot => Boolean(snapshot))
    .sort((a, b) => a.entitySlug.localeCompare(b.entitySlug))

  const evidenceLabelDistribution = createEmptyDistribution()
  for (const entity of governedEntities) {
    evidenceLabelDistribution[entity.evidenceLabel] += 1
  }

  const reviewedDates = governedEntities
    .map(entity => Date.parse(entity.lastReviewedAt))
    .filter(time => Number.isFinite(time))
    .sort((a, b) => a - b)

  const includedCount = entities.length
  const governedReviewedCount = governedEntities.length
  const nonGovernedCount = Math.max(includedCount - governedReviewedCount, 0)
  const strongerHumanSupportCount = evidenceLabelDistribution.stronger_human_support
  const limitedHumanSupportCount = evidenceLabelDistribution.limited_human_support
  const preclinicalOrTraditionalOnlyCount =
    evidenceLabelDistribution.preclinical_only + evidenceLabelDistribution.traditional_use_only

  const hasSufficientGovernedCoverage = governedReviewedCount >= 2
  const hasComparativeHumanSignal = strongerHumanSupportCount + limitedHumanSupportCount >= 2
  const allowComparativeHighlights = hasSufficientGovernedCoverage && hasComparativeHumanSignal

  const degradeReasons: string[] = []
  if (!hasSufficientGovernedCoverage) {
    degradeReasons.push('insufficient-governed-coverage')
  }
  if (governedReviewedCount > 0 && !hasComparativeHumanSignal) {
    degradeReasons.push('limited-human-comparative-signal')
  }
  if (governedReviewedCount === 0) {
    degradeReasons.push('no-governed-enrichment')
  }

  const relatedGovernedCompoundSlugs = new Set<string>()
  for (const entity of governedEntities) {
    if (entity.entityType !== 'herb') continue
    const bundle = buildEnrichmentRecommendations('herb', entity.entitySlug)
    for (const item of [
      ...bundle.relatedCompounds,
      ...bundle.safetyNextSteps,
      ...bundle.mechanismNextSteps,
    ]) {
      if (item.targetType === 'compound' && item.targetSlug) {
        relatedGovernedCompoundSlugs.add(item.targetSlug)
      }
    }
  }
  if (
    governedEntities.some(entity => entity.entityType === 'herb') &&
    relatedGovernedCompoundSlugs.size === 0
  ) {
    degradeReasons.push('no-related-governed-compound-signals')
  }

  return {
    includedCount,
    governedReviewedCount,
    nonGovernedCount,
    evidenceLabelDistribution,
    strongerHumanSupportCount,
    limitedHumanSupportCount,
    preclinicalOrTraditionalOnlyCount,
    safetySignalsPresentCount: governedEntities.filter(entity => entity.hasSafetySignals).length,
    interactionsPresentCount: governedEntities.filter(entity => entity.hasSafetySignals).length,
    mechanismCoveragePresentCount: governedEntities.filter(entity => entity.hasMechanismCoverage)
      .length,
    constituentCoveragePresentCount: governedEntities.filter(
      entity => entity.hasConstituentCoverage,
    ).length,
    unresolvedConflictOrUncertaintyCount: governedEntities.filter(
      entity => entity.hasConflictOrUncertainty,
    ).length,
    lastReviewedAtMostRecent:
      reviewedDates.length > 0
        ? new Date(reviewedDates[reviewedDates.length - 1]).toISOString()
        : null,
    lastReviewedAtOldest:
      reviewedDates.length > 0 ? new Date(reviewedDates[0]).toISOString() : null,
    hasSufficientGovernedCoverage,
    allowComparativeHighlights,
    degradeReasons: Array.from(new Set(degradeReasons)),
    relatedGovernedCompoundCount: relatedGovernedCompoundSlugs.size,
    relatedGovernedCompoundSlugs: Array.from(relatedGovernedCompoundSlugs).sort(),
    governedEntities,
  }
}
