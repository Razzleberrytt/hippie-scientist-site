import type { Herb } from '@/types'
import { normalizeText } from './normalizeText'
import { searchEntries } from './searchEntries'
import type { EntryFilterState } from './filterModel'
import { asStringArray } from './asStringArray'
import { getReviewFreshnessState, matchesEnrichmentFilter } from '@/lib/enrichmentDiscovery'
import { applyBrowseQualityGate, assessBrowseRecord } from '@/utils/browseQuality'

function getConfidenceRank(level: string) {
  if (level === 'high') return 3
  if (level === 'medium') return 2
  return 1
}

function getHerbConfidence(herb: Herb) {
  const confidenceValue = String(herb.confidence ?? '').toLowerCase()
  if (confidenceValue === 'high' || confidenceValue === 'medium') return confidenceValue
  return 'low'
}

function getEvidenceRank(herb: Herb) {
  const label = herb.researchEnrichmentSummary?.evidenceLabel
  if (label === 'stronger_human_support') return 8
  if (label === 'limited_human_support') return 7
  if (label === 'observational_only') return 6
  if (label === 'mixed_or_uncertain') return 5
  if (label === 'preclinical_only') return 4
  if (label === 'traditional_use_only') return 3
  if (label === 'conflicting_evidence') return 2
  if (label === 'insufficient_evidence') return 1
  return 0
}

function getFreshnessRank(herb: Herb) {
  const freshness = getReviewFreshnessState(herb.researchEnrichmentSummary?.lastReviewedAt)
  if (freshness === 'fresh') return 3
  if (freshness === 'aging') return 2
  if (freshness === 'stale') return 1
  return 0
}

export function filterHerbs(herbs: Herb[], filters: EntryFilterState): Herb[] {
  const searched = searchEntries(herbs, filters.query, herb => ({
    name: herb.common || herb.name || herb.scientific || herb.slug,
    type: String((herb as Record<string, unknown>).class || herb.category || ''),
    mechanism: herb.mechanism || herb.mechanismOfAction || herb.mechanismofaction,
    effects: asStringArray(herb.effects),
    activeCompounds: asStringArray(herb.activeCompounds || herb.active_compounds || herb.compounds),
    contraindications: asStringArray(herb.contraindications),
    safety: asStringArray(herb.safety),
  })).map(result => result.entry)

  const effectNeedles = filters.selectedEffects.map(effect => normalizeText(effect))
  const typeNeedle = normalizeText(filters.type)

  const filtered = searched.filter(herb => {
    const herbEffects = asStringArray(herb.effects).map(effect => normalizeText(effect))
    const confidence = getHerbConfidence(herb)
    const herbType = normalizeText(
      String((herb as Record<string, unknown>).class || herb.category || ''),
    )

    if (effectNeedles.length > 0) {
      const hasAllEffects = effectNeedles.every(effect =>
        herbEffects.some(herbEffect => herbEffect.includes(effect)),
      )
      if (!hasAllEffects) return false
    }

    if (filters.confidence !== 'all' && confidence !== filters.confidence) return false
    if (typeNeedle !== 'all' && typeNeedle && herbType !== typeNeedle) return false
    if (!matchesEnrichmentFilter(herb.researchEnrichmentSummary, filters.enrichment)) return false

    return true
  })

  const browseQuality = applyBrowseQualityGate(
    filtered,
    herb =>
      assessBrowseRecord({
        name: herb.common || herb.name || herb.scientific || herb.slug,
        summary: herb.summaryShort || herb.description,
        description: herb.description,
        mechanism: herb.mechanism || herb.mechanismOfAction,
        effects: asStringArray(herb.effects),
        associations: asStringArray(herb.activeCompounds || herb.active_compounds || herb.compounds),
        sourceCount: (herb as Record<string, unknown>).sourceCount,
        hasEvidence: Boolean(herb.researchEnrichmentSummary?.evidenceLabel),
        confidenceLevel: getHerbConfidence(herb),
      }),
    {
      // Keep browse behavior non-destructive: all records stay discoverable/searchable,
      // while noisy entries are demoted through ranking signals.
      rankOnly: true,
    },
  )

  const qualityFiltered = browseQuality.items

  return qualityFiltered.sort((a, b) => {
    if (filters.sort === 'az') {
      return String(a.common || a.name || a.scientific || '').localeCompare(
        String(b.common || b.name || b.scientific || ''),
      )
    }

    if (filters.sort === 'confidence') {
      return getConfidenceRank(getHerbConfidence(b)) - getConfidenceRank(getHerbConfidence(a))
    }

    if (filters.sort === 'governed_evidence') {
      const evidenceDiff = getEvidenceRank(b) - getEvidenceRank(a)
      if (evidenceDiff !== 0) return evidenceDiff
      return getFreshnessRank(b) - getFreshnessRank(a)
    }

    if (filters.sort === 'review_freshness') {
      const freshnessDiff = getFreshnessRank(b) - getFreshnessRank(a)
      if (freshnessDiff !== 0) return freshnessDiff
      return getEvidenceRank(b) - getEvidenceRank(a)
    }

    if (filters.sort === 'safety_first') {
      const safetyDiff =
        Number(Boolean(b.researchEnrichmentSummary?.safetyCautionsPresent)) -
        Number(Boolean(a.researchEnrichmentSummary?.safetyCautionsPresent))
      if (safetyDiff !== 0) return safetyDiff
      const conflictDiff =
        Number(Boolean(b.researchEnrichmentSummary?.conflictingEvidence)) -
        Number(Boolean(a.researchEnrichmentSummary?.conflictingEvidence))
      if (conflictDiff !== 0) return conflictDiff
      return getEvidenceRank(b) - getEvidenceRank(a)
    }

    const aDemoted = Number(Boolean(browseQuality.assessments.get(a)?.demote))
    const bDemoted = Number(Boolean(browseQuality.assessments.get(b)?.demote))
    if (aDemoted !== bDemoted) return aDemoted - bDemoted

    const rankScoreDiff =
      (browseQuality.assessments.get(b)?.rankScore ?? 0) -
      (browseQuality.assessments.get(a)?.rankScore ?? 0)
    if (rankScoreDiff !== 0) return rankScoreDiff

    const effectCountDiff = asStringArray(b.effects).length - asStringArray(a.effects).length
    if (effectCountDiff !== 0) return effectCountDiff

    return String(a.common || a.name || a.scientific || '').localeCompare(
      String(b.common || b.name || b.scientific || ''),
    )
  })
}
