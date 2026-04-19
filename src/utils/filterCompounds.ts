import type { CompoundSummaryRecord } from '@/lib/compound-data'
import { calculateCompoundConfidence } from '@/utils/calculateConfidence'
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

function getCompoundConfidence(compound: CompoundSummaryRecord) {
  return calculateCompoundConfidence({
    mechanism: asStringArray(compound.mechanisms).join('; ') || compound.mechanism,
    effects: asStringArray(compound.primaryActions ?? compound.effects),
    compounds: asStringArray(compound.foundIn ?? compound.herbs),
  })
}

function getEvidenceRank(compound: CompoundSummaryRecord) {
  const label = compound.researchEnrichmentSummary?.evidenceLabel
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

function getFreshnessRank(compound: CompoundSummaryRecord) {
  const freshness = getReviewFreshnessState(compound.researchEnrichmentSummary?.lastReviewedAt)
  if (freshness === 'fresh') return 3
  if (freshness === 'aging') return 2
  if (freshness === 'stale') return 1
  return 0
}

export function filterCompounds(
  compounds: CompoundSummaryRecord[],
  filters: EntryFilterState,
): CompoundSummaryRecord[] {
  const searched = searchEntries(compounds, filters.query, compound => ({
    name: compound.name,
    type: compound.category || compound.className,
    mechanism: asStringArray(compound.mechanisms).join('; ') || compound.mechanism,
    effects: asStringArray(compound.primaryActions ?? compound.effects),
    activeCompounds: asStringArray(compound.foundIn ?? compound.herbs),
    contraindications: [],
    safety: [],
  })).map(result => result.entry)

  const effectNeedles = filters.selectedEffects.map(effect => normalizeText(effect))
  const typeNeedle = normalizeText(filters.type)

  const filtered = searched.filter(compound => {
    const effects = asStringArray(compound.primaryActions ?? compound.effects).map(effect =>
      normalizeText(effect),
    )
    const confidence = getCompoundConfidence(compound)
    const category = normalizeText(compound.category || compound.className)

    if (effectNeedles.length > 0) {
      const hasAllEffects = effectNeedles.every(effect =>
        effects.some(compoundEffect => compoundEffect.includes(effect)),
      )
      if (!hasAllEffects) return false
    }

    if (filters.confidence !== 'all' && confidence !== filters.confidence) return false
    if (typeNeedle !== 'all' && typeNeedle && category !== typeNeedle) return false
    if (!matchesEnrichmentFilter(compound.researchEnrichmentSummary, filters.enrichment))
      return false

    return true
  })

  const browseQuality = applyBrowseQualityGate(
    filtered,
    compound =>
      assessBrowseRecord({
        name: compound.name,
        summary: compound.summaryShort || compound.description,
        description: compound.description,
        mechanism: asStringArray(compound.mechanisms).join('; ') || compound.mechanism,
        effects: asStringArray(compound.primaryActions ?? compound.effects),
        associations: asStringArray(compound.foundIn ?? compound.herbs),
        sourceCount: compound.sourceCount,
        hasEvidence: Boolean(compound.researchEnrichmentSummary?.evidenceLabel),
        confidenceLevel: getCompoundConfidence(compound),
      }),
    {
      // Keep browse behavior non-destructive: all records stay discoverable/searchable,
      // while noisy entries are demoted through ranking signals.
      rankOnly: true,
    },
  )

  const qualityFiltered = browseQuality.items

  return qualityFiltered.sort((a, b) => {
    if (filters.sort === 'az') return a.name.localeCompare(b.name)

    if (filters.sort === 'confidence') {
      return (
        getConfidenceRank(getCompoundConfidence(b)) - getConfidenceRank(getCompoundConfidence(a))
      )
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

    const effectCountDiff =
      asStringArray(b.primaryActions ?? b.effects).length -
      asStringArray(a.primaryActions ?? a.effects).length
    if (effectCountDiff !== 0) return effectCountDiff

    return a.name.localeCompare(b.name)
  })
}
