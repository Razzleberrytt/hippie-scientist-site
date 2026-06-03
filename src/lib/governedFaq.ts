import { getEvidenceLabelMeta, getTopicJudgment } from '@/lib/governedResearch'
import type { GovernedEntityType } from '@/lib/governedResearch'
import type { ResearchEnrichment } from '@/types/researchEnrichment'

export type GovernedFaqQuestionType =
  | 'association'
  | 'evidence_level'
  | 'safety_caution'
  | 'evidence_limits'
  | 'research_gap'

export type GovernedFaqItem = {
  questionType: GovernedFaqQuestionType
  question: string
  answer: string
}

export type GovernedFaqSectionContent = {
  evidenceSnapshot: string
  whatWeKnow: string[]
  whatRemainsUncertain: string[]
  keyCautions: string[]
  faqItems: GovernedFaqItem[]
  excludedQuestionTypes: Array<{ questionType: GovernedFaqQuestionType; reason: string }>
  emitFaqSchema: boolean
}

const WEAK_OR_UNCERTAIN_LABELS = new Set([
  'preclinical_only',
  'traditional_use_only',
  'insufficient_evidence',
  'mixed_or_uncertain',
  'conflicting_evidence',
])

function toSentence(value: string, fallback: string) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (!cleaned) return fallback
  const sentence = cleaned.match(/[^.!?]+[.!?]?/)?.[0]?.trim() || cleaned
  return sentence.endsWith('.') ? sentence : `${sentence}.`
}

function dedupe(items: string[]) {
  return [...new Set(items.map(item => item.trim()).filter(Boolean))]
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

export function buildGovernedFaqSectionContent(args: {
  entityType: GovernedEntityType
  entityName: string
  enrichment: ResearchEnrichment
}): GovernedFaqSectionContent {
  const { entityType, entityName, enrichment } = args
  const entityLabel = entityType === 'herb' ? 'herb' : 'compound'
  const pageLabel = enrichment.pageEvidenceJudgment.evidenceLabel
  const weakOrUncertain = WEAK_OR_UNCERTAIN_LABELS.has(pageLabel)
  const pageLabelMeta = getEvidenceLabelMeta(pageLabel)
  const reviewedDate = formatDate(enrichment.lastReviewedAt)
  const sourceCount = enrichment.sourceRefs.length

  const cautionClaims = dedupe([
    ...(enrichment.safetyProfile?.safetyEntries.map(entry => entry.findingTextShort) || []),
    ...enrichment.interactions.map(item => item.claim),
    ...enrichment.contraindications.map(item => item.claim),
    ...enrichment.adverseEffects.map(item => item.claim),
    ...enrichment.populationSpecificNotes.map(item => item.claim),
  ])

  const uncertaintyClaims = dedupe([
    ...enrichment.conflictNotes.map(item => item.claim),
    ...enrichment.researchGaps.map(item => item.claim),
    ...enrichment.unsupportedOrUnclearUses.map(item => item.claim),
    ...enrichment.pageEvidenceJudgment.uncertaintyNotes,
    ...enrichment.pageEvidenceJudgment.conflictNotes,
  ])

  const supportedClaimSnippets = dedupe(enrichment.supportedUses.map(item => item.claim))

  const whatWeKnow = dedupe([
    toSentence(enrichment.evidenceSummary, 'Evidence summary is currently limited.'),
    ...(supportedClaimSnippets.length > 0
      ? [
          weakOrUncertain
            ? `${entityName} has possible associations with ${supportedClaimSnippets
                .slice(0, 2)
                .join(' and ')}, but confidence is limited and context-dependent.`
            : `${entityName} is associated in approved summaries with ${supportedClaimSnippets
                .slice(0, 2)
                .join(' and ')}.`,
        ]
      : []),
  ])

  const whatRemainsUncertain = uncertaintyClaims.slice(0, 4)

  const keyCautions = cautionClaims.slice(0, 4)
  const faqItems: GovernedFaqItem[] = []
  const excludedQuestionTypes: Array<{ questionType: GovernedFaqQuestionType; reason: string }> = []

  if (supportedClaimSnippets.length > 0) {
    faqItems.push({
      questionType: 'association',
      question: `What is ${entityName} commonly associated with in governed research?`,
      answer: weakOrUncertain
        ? `${entityName} is associated with ${supportedClaimSnippets
            .slice(0, 2)
            .join(
              ' and ',
            )} in approved summaries, but these signals are still limited or uncertain rather than definitive clinical proof.`
        : `Approved summaries most often associate ${entityName} with ${supportedClaimSnippets
            .slice(0, 2)
            .join(' and ')}.`,
    })
  } else {
    excludedQuestionTypes.push({
      questionType: 'association',
      reason: 'no_publishable_supported_use_claims',
    })
  }

  faqItems.push({
    questionType: 'evidence_level',
    question: `How strong is the evidence for ${entityName}?`,
    answer: `Current governed grading is ${pageLabelMeta.title.toLowerCase()}. ${pageLabelMeta.tone} This content is for education and should not replace professional medical guidance.`,
  })

  if (keyCautions.length > 0) {
    faqItems.push({
      questionType: 'safety_caution',
      question: `Are there key safety or interaction cautions for ${entityName}?`,
      answer: `Yes. Approved notes highlight cautions such as ${keyCautions
        .slice(0, 2)
        .join(' and ')}. Always review interactions, contraindications, and population-specific context.`,
    })
  } else {
    excludedQuestionTypes.push({
      questionType: 'safety_caution',
      reason: 'no_publishable_safety_or_interaction_signals',
    })
  }

  if (whatRemainsUncertain.length > 0) {
    faqItems.push({
      questionType: 'evidence_limits',
      question: `What remains uncertain about ${entityName}?`,
      answer: `Approved uncertainty notes include ${whatRemainsUncertain
        .slice(0, 2)
        .join(
          ' and ',
        )}. Treat current findings as directional until stronger human data resolves these limits.`,
    })
  } else {
    excludedQuestionTypes.push({
      questionType: 'evidence_limits',
      reason: 'no_publishable_uncertainty_or_conflict_notes',
    })
  }

  if (enrichment.researchGaps.length > 0) {
    faqItems.push({
      questionType: 'research_gap',
      question: `What is still under-researched for ${entityName}?`,
      answer: `Current governed gaps include ${enrichment.researchGaps
        .map(item => item.claim)
        .slice(0, 2)
        .join(
          ' and ',
        )}. More high-quality human evidence is needed before stronger conclusions are appropriate for this ${entityLabel}.`,
    })
  } else {
    excludedQuestionTypes.push({
      questionType: 'research_gap',
      reason: 'no_publishable_research_gap_entries',
    })
  }

  const visibleFaqItems = faqItems.filter(item => item.question && item.answer)
  return {
    evidenceSnapshot: `${pageLabelMeta.title} evidence profile · ${sourceCount} source${
      sourceCount === 1 ? '' : 's'
    } in approved governed references${reviewedDate ? ` · last reviewed ${reviewedDate}` : ''}.`,
    whatWeKnow,
    whatRemainsUncertain,
    keyCautions,
    faqItems: visibleFaqItems,
    excludedQuestionTypes,
    emitFaqSchema: visibleFaqItems.length >= 2,
  }
}
