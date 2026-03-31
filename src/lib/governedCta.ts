import type { ConfidenceLevel } from '@/utils/calculateConfidence'
import type { GovernedEntityType } from '@/lib/governedResearch'
import type { ResearchEnrichment } from '@/types/researchEnrichment'
import type { CtaSlotType } from '@/config/ctaExperiments'

type GovernedCtaParams = {
  entityType: GovernedEntityType
  entitySlug: string
  cautionCount: number
  confidence: ConfidenceLevel
  sourceCount: number
  relatedCollectionCount: number
  enrichment: ResearchEnrichment | null
}

export type GovernedCtaDecision = {
  slotOrder: CtaSlotType[]
  usedSignals: string[]
  excludedSignals: Array<{ signal: string; reason: string }>
  tone: 'safety_first' | 'conservative' | 'evidence_forward'
  copy: {
    toolTitle: string
    toolBody: string
    builderBody: string
    relatedTitle: string
    affiliateLeadIn: string
  }
}

const SAFETY_LABELS = new Set([
  'conflicting_evidence',
  'mixed_or_uncertain',
  'insufficient_evidence',
])
const LIMITED_LABELS = new Set(['preclinical_only', 'traditional_use_only', 'observational_only'])

function hasSafetySignals(enrichment: ResearchEnrichment | null, cautionCount: number) {
  if (cautionCount > 0) return true
  if (!enrichment) return false
  return (
    enrichment.interactions.length > 0 ||
    enrichment.contraindications.length > 0 ||
    enrichment.adverseEffects.length > 0 ||
    enrichment.populationSpecificNotes.length > 0
  )
}

export function resolveGovernedCtaDecision(params: GovernedCtaParams): GovernedCtaDecision {
  const { cautionCount, confidence, sourceCount, relatedCollectionCount, enrichment } = params
  const usedSignals: string[] = []
  const excludedSignals: Array<{ signal: string; reason: string }> = []

  const hasPublishableGoverned = Boolean(enrichment)
  if (hasPublishableGoverned) {
    usedSignals.push('publishable_governed_enrichment')
  } else {
    excludedSignals.push({
      signal: 'governed_enrichment',
      reason: 'no_publishable_governed_enrichment',
    })
  }

  const safetySensitive = hasSafetySignals(enrichment, cautionCount)
  if (safetySensitive) usedSignals.push('safety_or_interaction_context')

  const evidenceLabel = enrichment?.pageEvidenceJudgment?.evidenceLabel
  const weakOrConflictingEvidence =
    !!evidenceLabel && (SAFETY_LABELS.has(evidenceLabel) || LIMITED_LABELS.has(evidenceLabel))

  if (weakOrConflictingEvidence) {
    usedSignals.push(`evidence_label:${evidenceLabel}`)
  } else if (!evidenceLabel) {
    excludedSignals.push({ signal: 'evidence_label', reason: 'missing_publishable_evidence_label' })
  }

  const hasMechanismCoverage = Boolean(
    (enrichment?.mechanisms.length || 0) + (enrichment?.constituents.length || 0) > 0,
  )
  if (hasMechanismCoverage) {
    usedSignals.push('mechanism_or_constituent_coverage')
  }

  const conservativePage = confidence === 'low' || sourceCount < 2 || weakOrConflictingEvidence
  if (confidence === 'low') usedSignals.push('low_confidence_tier')
  if (sourceCount < 2) usedSignals.push('sparse_sources')

  const slotOrder: CtaSlotType[] =
    safetySensitive || conservativePage
      ? ['tool', 'related', 'builder', 'affiliate']
      : ['tool', 'builder', 'related', 'affiliate']

  if (relatedCollectionCount === 0) {
    excludedSignals.push({ signal: 'related_compare_step', reason: 'no_related_collections' })
  }

  const tone: GovernedCtaDecision['tone'] = safetySensitive
    ? 'safety_first'
    : conservativePage
      ? 'conservative'
      : 'evidence_forward'

  const copy =
    tone === 'safety_first'
      ? {
          toolTitle: 'Check interactions before next steps',
          toolBody:
            'Caution signals are present. Run this profile in the checker before planning combinations or products.',
          builderBody:
            'Move to the builder only after the interaction check and caution notes are reviewed.',
          relatedTitle: 'Learn or compare before stacking',
          affiliateLeadIn:
            'After reviewing safety and evidence context, compare these manually reviewed product options.',
        }
      : tone === 'conservative'
        ? {
            toolTitle: 'Start with the interaction checker',
            toolBody:
              'Evidence is limited or mixed for this page. Use the checker and supporting guidance before making stack or product decisions.',
            builderBody:
              'If the checker looks clear, keep builder plans conservative and add one change at a time.',
            relatedTitle: 'Review comparisons and context first',
            affiliateLeadIn:
              'These products stay secondary while evidence remains limited; review fit and disclosure before exploring.',
          }
        : {
            toolTitle: 'Validate interactions first',
            toolBody:
              'Use the checker as a first pass, then continue with compare guidance or stack planning.',
            builderBody: 'Continue to the builder after checking interactions and overlap.',
            relatedTitle: 'Compare adjacent collections',
            affiliateLeadIn:
              'When fit looks appropriate, review these curated options and disclosures after tool-based checks.',
          }

  return {
    slotOrder,
    usedSignals,
    excludedSignals,
    tone,
    copy,
  }
}
