import {
  getGovernedResearchEnrichment,
  getPublishableGovernedEntries,
  type GovernedEntityType,
} from '@/lib/governedResearch'
import type { EvidenceLabel, ResearchClaim, ResearchEnrichment } from '@/types/researchEnrichment'

export type RecommendationSignalType =
  | 'shared_supported_use'
  | 'shared_safety_theme'
  | 'shared_mechanism_or_constituent'
  | 'herb_compound_relationship'
  | 'contrast_conflicting_or_uncertain'
  | 'evidence_strength_comparison'

export type EnrichmentRecommendation = {
  targetType: GovernedEntityType
  targetSlug: string
  signalType: RecommendationSignalType
  reason: string
  score: number
}

export type EnrichmentRecommendationBundle = {
  relatedHerbs: EnrichmentRecommendation[]
  relatedCompounds: EnrichmentRecommendation[]
  compareContrast: EnrichmentRecommendation[]
  safetyNextSteps: EnrichmentRecommendation[]
  mechanismNextSteps: EnrichmentRecommendation[]
  activeSignals: RecommendationSignalType[]
}

type ThemeSets = {
  supportedUseThemes: Set<string>
  unsupportedUseThemes: Set<string>
  safetyThemes: Set<string>
  mechanismThemes: Set<string>
}

export type GovernedRecommendationRow = {
  entityType: GovernedEntityType
  entitySlug: string
  researchEnrichment: ResearchEnrichment
}

const TOKEN_STOPWORDS = new Set([
  'with',
  'from',
  'this',
  'that',
  'these',
  'those',
  'into',
  'over',
  'under',
  'among',
  'may',
  'can',
  'data',
  'evidence',
  'effect',
  'effects',
  'signal',
  'signals',
  'context',
  'contexts',
  'reviewed',
  'review',
  'clinical',
  'human',
  'adults',
  'current',
  'remain',
  'using',
  'use',
  'used',
  'users',
  'studies',
  'study',
  'treatment',
  'outcome',
  'outcomes',
  'limited',
  'insufficient',
  'modulate',
  'pathway',
  'pathways',
])

const EVIDENCE_LABEL_RANK: Record<EvidenceLabel, number> = {
  stronger_human_support: 8,
  limited_human_support: 7,
  observational_only: 6,
  mixed_or_uncertain: 5,
  conflicting_evidence: 4,
  preclinical_only: 3,
  traditional_use_only: 2,
  insufficient_evidence: 1,
}

const CAUTION_LABELS = new Set<EvidenceLabel>([
  'mixed_or_uncertain',
  'conflicting_evidence',
  'preclinical_only',
  'traditional_use_only',
  'insufficient_evidence',
])

const WEAK_ONLY_LABELS = new Set<EvidenceLabel>([
  'preclinical_only',
  'traditional_use_only',
  'insufficient_evidence',
])

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length >= 4 && !TOKEN_STOPWORDS.has(token))
}

function claimThemes(claims: ResearchClaim[]) {
  const themes = new Set<string>()
  for (const claim of claims) {
    for (const token of tokenize(claim.claim || '')) {
      themes.add(token)
    }
    for (const token of tokenize(claim.strengthNote || '')) {
      themes.add(token)
    }
  }
  return themes
}

function deriveThemes(enrichment: ResearchEnrichment): ThemeSets {
  const safetyFromClaims = claimThemes([
    ...enrichment.interactions,
    ...enrichment.contraindications,
    ...enrichment.adverseEffects,
    ...enrichment.populationSpecificNotes,
  ])

  if (enrichment.safetyProfile?.safetyEntries?.length) {
    for (const entry of enrichment.safetyProfile.safetyEntries) {
      for (const token of tokenize(entry.targetName || '')) {
        safetyFromClaims.add(token)
      }
      for (const token of tokenize(entry.findingTextShort || '')) {
        safetyFromClaims.add(token)
      }
    }
  }

  return {
    supportedUseThemes: claimThemes(enrichment.supportedUses),
    unsupportedUseThemes: claimThemes(enrichment.unsupportedOrUnclearUses),
    safetyThemes: safetyFromClaims,
    mechanismThemes: claimThemes([...enrichment.mechanisms, ...enrichment.constituents]),
  }
}

function sharedThemes(a: Set<string>, b: Set<string>) {
  return Array.from(a).filter(theme => b.has(theme))
}

function describeSharedTheme(prefix: string, themes: string[]) {
  if (!themes.length) return prefix
  return `${prefix} (${themes.slice(0, 2).join(', ')}).`
}

function evaluatePair(
  source: GovernedRecommendationRow,
  candidate: GovernedRecommendationRow,
): EnrichmentRecommendation[] {
  if (source.entitySlug === candidate.entitySlug && source.entityType === candidate.entityType)
    return []

  const sourceThemes = deriveThemes(source.researchEnrichment)
  const candidateThemes = deriveThemes(candidate.researchEnrichment)

  const recs: EnrichmentRecommendation[] = []

  const supportedOverlap = sharedThemes(
    sourceThemes.supportedUseThemes,
    candidateThemes.supportedUseThemes,
  )
  if (supportedOverlap.length > 0) {
    recs.push({
      targetType: candidate.entityType,
      targetSlug: candidate.entitySlug,
      signalType: 'shared_supported_use',
      reason: describeSharedTheme(
        'Shares governed use-context themes for comparison',
        supportedOverlap,
      ),
      score: 70 + supportedOverlap.length,
    })
  }

  const safetyOverlap = sharedThemes(sourceThemes.safetyThemes, candidateThemes.safetyThemes)
  if (safetyOverlap.length > 0) {
    recs.push({
      targetType: candidate.entityType,
      targetSlug: candidate.entitySlug,
      signalType: 'shared_safety_theme',
      reason: describeSharedTheme(
        'Shares governed safety themes; review interaction cautions before stacking',
        safetyOverlap,
      ),
      score: 90 + safetyOverlap.length,
    })
  }

  const mechanismOverlap = sharedThemes(
    sourceThemes.mechanismThemes,
    candidateThemes.mechanismThemes,
  )
  if (mechanismOverlap.length > 0) {
    recs.push({
      targetType: candidate.entityType,
      targetSlug: candidate.entitySlug,
      signalType: 'shared_mechanism_or_constituent',
      reason: describeSharedTheme(
        'Shares mechanism or constituent themes in governed research',
        mechanismOverlap,
      ),
      score: 60 + mechanismOverlap.length,
    })
  }

  const sourceRelated = source.researchEnrichment.relatedEntities || []
  if (
    sourceRelated.some(
      item => item.entityType === candidate.entityType && item.slug === candidate.entitySlug,
    )
  ) {
    recs.push({
      targetType: candidate.entityType,
      targetSlug: candidate.entitySlug,
      signalType: 'herb_compound_relationship',
      reason: 'Has an explicit governed herb↔compound relationship link.',
      score: 100,
    })
  }

  const sourceUnsupportedVsCandidateSupported = sharedThemes(
    sourceThemes.unsupportedUseThemes,
    candidateThemes.supportedUseThemes,
  )
  const candidateUnsupportedVsSourceSupported = sharedThemes(
    candidateThemes.unsupportedUseThemes,
    sourceThemes.supportedUseThemes,
  )

  if (
    sourceUnsupportedVsCandidateSupported.length > 0 ||
    candidateUnsupportedVsSourceSupported.length > 0
  ) {
    const contrastThemes = [
      ...sourceUnsupportedVsCandidateSupported,
      ...candidateUnsupportedVsSourceSupported,
    ]
    recs.push({
      targetType: candidate.entityType,
      targetSlug: candidate.entitySlug,
      signalType: 'contrast_conflicting_or_uncertain',
      reason: describeSharedTheme(
        'Useful compare/contrast link where governed evidence context differs or is uncertain',
        contrastThemes,
      ),
      score: 95 + contrastThemes.length,
    })
  }

  const evidenceRankDelta =
    EVIDENCE_LABEL_RANK[candidate.researchEnrichment.pageEvidenceJudgment.evidenceLabel] -
    EVIDENCE_LABEL_RANK[source.researchEnrichment.pageEvidenceJudgment.evidenceLabel]
  const evidenceOverlap = sharedThemes(
    sourceThemes.supportedUseThemes,
    candidateThemes.supportedUseThemes,
  )
  if (evidenceOverlap.length > 0 && evidenceRankDelta !== 0) {
    recs.push({
      targetType: candidate.entityType,
      targetSlug: candidate.entitySlug,
      signalType: 'evidence_strength_comparison',
      reason: `${evidenceRankDelta > 0 ? 'Has relatively stronger governed evidence' : 'Has comparatively weaker or more uncertain governed evidence'} for overlapping themes (${evidenceOverlap.slice(0, 2).join(', ')}).`,
      score: 80 + Math.abs(evidenceRankDelta),
    })
  }

  return recs
}

function dedupeRecommendations(recommendations: EnrichmentRecommendation[]) {
  const bestByTargetAndSignal = new Map<string, EnrichmentRecommendation>()
  for (const recommendation of recommendations) {
    const key = `${recommendation.targetType}:${recommendation.targetSlug}:${recommendation.signalType}`
    const current = bestByTargetAndSignal.get(key)
    if (!current || recommendation.score > current.score) {
      bestByTargetAndSignal.set(key, recommendation)
    }
  }
  return Array.from(bestByTargetAndSignal.values()).sort(
    (a, b) => b.score - a.score || a.targetSlug.localeCompare(b.targetSlug),
  )
}

function sliceByType(
  recommendations: EnrichmentRecommendation[],
  targetType: GovernedEntityType,
  limit: number,
) {
  return recommendations.filter(item => item.targetType === targetType).slice(0, limit)
}

function filterRelatedRecommendations(
  scored: EnrichmentRecommendation[],
  source: GovernedRecommendationRow,
  targetType: GovernedEntityType,
  limit: number,
) {
  const sourceWeakOnly = WEAK_ONLY_LABELS.has(
    source.researchEnrichment.pageEvidenceJudgment.evidenceLabel,
  )
  return scored
    .filter(item => item.targetType === targetType)
    .filter(item => {
      if (item.signalType === 'herb_compound_relationship') return true
      if (item.signalType === 'shared_supported_use') return true
      if (
        item.signalType === 'shared_safety_theme' ||
        item.signalType === 'shared_mechanism_or_constituent'
      ) {
        return !sourceWeakOnly
      }
      return false
    })
    .slice(0, limit)
}

function buildLegacyRelatedSlices(
  scored: EnrichmentRecommendation[],
  targetType: GovernedEntityType,
  limit: number,
) {
  return sliceByType(
    scored.filter(
      item =>
        item.signalType === 'shared_supported_use' ||
        item.signalType === 'herb_compound_relationship',
    ),
    targetType,
    limit,
  )
}

export function buildEnrichmentRecommendationsFromRowsLegacy(
  source: GovernedRecommendationRow | null | undefined,
  rows: GovernedRecommendationRow[],
): EnrichmentRecommendationBundle {
  if (!source) {
    return {
      relatedHerbs: [],
      relatedCompounds: [],
      compareContrast: [],
      safetyNextSteps: [],
      mechanismNextSteps: [],
      activeSignals: [],
    }
  }

  const sourceEnrichment = source.researchEnrichment
  const candidateRows = rows.filter(
    row => !(row.entityType === source.entityType && row.entitySlug === source.entitySlug),
  )

  const scored = dedupeRecommendations(
    candidateRows.flatMap(candidate => evaluatePair(source, candidate)),
  )

  const relatedHerbs = buildLegacyRelatedSlices(scored, 'herb', 2)
  const relatedCompounds = buildLegacyRelatedSlices(scored, 'compound', 2)
  const compareContrast = scored
    .filter(
      item =>
        item.signalType === 'contrast_conflicting_or_uncertain' ||
        item.signalType === 'evidence_strength_comparison',
    )
    .slice(0, 2)
  const safetyNextSteps = scored
    .filter(item => item.signalType === 'shared_safety_theme')
    .slice(0, 2)
  const mechanismNextSteps = scored
    .filter(item => item.signalType === 'shared_mechanism_or_constituent')
    .slice(0, 2)

  const cautionLabel = sourceEnrichment.pageEvidenceJudgment.evidenceLabel
  const activeSignals = Array.from(
    new Set(
      [
        ...relatedHerbs,
        ...relatedCompounds,
        ...compareContrast,
        ...safetyNextSteps,
        ...mechanismNextSteps,
      ].map(item => item.signalType),
    ),
  )

  if (CAUTION_LABELS.has(cautionLabel) && compareContrast.length === 0) {
    const fallback = scored.find(item => item.signalType === 'shared_supported_use')
    if (fallback) {
      compareContrast.push({
        ...fallback,
        signalType: 'contrast_conflicting_or_uncertain',
        reason:
          'Evidence is mixed or uncertain here, so compare this page with another governed profile before drawing conclusions.',
      })
      if (!activeSignals.includes('contrast_conflicting_or_uncertain')) {
        activeSignals.push('contrast_conflicting_or_uncertain')
      }
    }
  }

  return {
    relatedHerbs,
    relatedCompounds,
    compareContrast,
    safetyNextSteps,
    mechanismNextSteps,
    activeSignals,
  }
}

export function buildEnrichmentRecommendationsFromRows(
  source: GovernedRecommendationRow | null | undefined,
  rows: GovernedRecommendationRow[],
): EnrichmentRecommendationBundle {
  if (!source) {
    return {
      relatedHerbs: [],
      relatedCompounds: [],
      compareContrast: [],
      safetyNextSteps: [],
      mechanismNextSteps: [],
      activeSignals: [],
    }
  }

  const sourceEnrichment = source.researchEnrichment
  const candidateRows = rows.filter(
    row => !(row.entityType === source.entityType && row.entitySlug === source.entitySlug),
  )

  const scored = dedupeRecommendations(
    candidateRows.flatMap(candidate => evaluatePair(source, candidate)),
  )

  const relatedHerbs = filterRelatedRecommendations(scored, source, 'herb', 2)
  const relatedCompounds = filterRelatedRecommendations(scored, source, 'compound', 2)
  const compareContrast = scored
    .filter(
      item =>
        item.signalType === 'contrast_conflicting_or_uncertain' ||
        item.signalType === 'evidence_strength_comparison',
    )
    .slice(0, 2)
  const safetyNextSteps = scored
    .filter(item => item.signalType === 'shared_safety_theme')
    .slice(0, 2)
  const mechanismNextSteps = scored
    .filter(item => item.signalType === 'shared_mechanism_or_constituent')
    .slice(0, 2)

  const cautionLabel = sourceEnrichment.pageEvidenceJudgment.evidenceLabel
  const activeSignals = Array.from(
    new Set(
      [
        ...relatedHerbs,
        ...relatedCompounds,
        ...compareContrast,
        ...safetyNextSteps,
        ...mechanismNextSteps,
      ].map(item => item.signalType),
    ),
  )

  if (CAUTION_LABELS.has(cautionLabel) && compareContrast.length === 0) {
    const fallback = scored.find(item => item.signalType === 'shared_supported_use')
    if (fallback) {
      compareContrast.push({
        ...fallback,
        signalType: 'contrast_conflicting_or_uncertain',
        reason:
          'Evidence is mixed or uncertain here, so compare this page with another governed profile before drawing conclusions.',
      })
      if (!activeSignals.includes('contrast_conflicting_or_uncertain')) {
        activeSignals.push('contrast_conflicting_or_uncertain')
      }
    }
  }

  return {
    relatedHerbs,
    relatedCompounds,
    compareContrast,
    safetyNextSteps,
    mechanismNextSteps,
    activeSignals,
  }
}

export function buildEnrichmentRecommendations(
  entityType: GovernedEntityType,
  entitySlug: string,
): EnrichmentRecommendationBundle {
  const sourceEnrichment = getGovernedResearchEnrichment(entityType, entitySlug)
  const source = sourceEnrichment
    ? {
        entityType,
        entitySlug,
        researchEnrichment: sourceEnrichment,
      }
    : null
  return buildEnrichmentRecommendationsFromRows(source, getPublishableGovernedEntries())
}
