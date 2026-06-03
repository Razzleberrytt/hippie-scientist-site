import type { GovernedFaqSectionContent } from '@/lib/governedFaq'
import { getEvidenceLabelMeta, type GovernedEntityType } from '@/lib/governedResearch'
import type { ResearchEnrichment } from '@/types/researchEnrichment'

export type GovernedRelatedQuestionType =
  | 'association'
  | 'evidence_strength'
  | 'safety_caution'
  | 'uncertainty'
  | 'compare'

export type GovernedRelatedQuestionItem = {
  questionType: GovernedRelatedQuestionType
  question: string
  answer: string
  href?: string
  linkLabel?: string
}

export type GovernedRelatedQuestionsSection = {
  items: GovernedRelatedQuestionItem[]
  excludedQuestionTypes: Array<{ questionType: GovernedRelatedQuestionType; reason: string }>
}

function dedupe(items: string[]) {
  return [...new Set(items.map(item => item.trim()).filter(Boolean))]
}

function firstSentence(value: string) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''
  const sentence = cleaned.match(/[^.!?]+[.!?]?/)?.[0]?.trim() || cleaned
  return sentence.endsWith('.') ? sentence : `${sentence}.`
}

export function buildGovernedRelatedQuestions(args: {
  entityType: GovernedEntityType
  entityName: string
  enrichment: ResearchEnrichment
  governedFaq: GovernedFaqSectionContent
  hasVisibleCompareSection: boolean
}): GovernedRelatedQuestionsSection {
  const { entityType, entityName, enrichment, governedFaq, hasVisibleCompareSection } = args
  const supportedClaims = dedupe(enrichment.supportedUses.map(item => firstSentence(item.claim)).filter(Boolean))
  const safetyClaims = dedupe([
    ...(enrichment.safetyProfile?.safetyEntries.map(entry => firstSentence(entry.findingTextShort)) || []),
    ...enrichment.interactions.map(item => firstSentence(item.claim)),
    ...enrichment.contraindications.map(item => firstSentence(item.claim)),
    ...enrichment.adverseEffects.map(item => firstSentence(item.claim)),
  ])
  const uncertaintyClaims = dedupe([
    ...enrichment.conflictNotes.map(item => firstSentence(item.claim)),
    ...enrichment.researchGaps.map(item => firstSentence(item.claim)),
    ...enrichment.pageEvidenceJudgment.uncertaintyNotes.map(item => firstSentence(item)),
  ])

  const evidenceMeta = getEvidenceLabelMeta(enrichment.pageEvidenceJudgment.evidenceLabel)
  const comparisonLabel = entityType === 'herb' ? 'compounds and related herbs' : 'related compounds and linked herbs'

  const candidates: GovernedRelatedQuestionItem[] = []
  const excludedQuestionTypes: Array<{ questionType: GovernedRelatedQuestionType; reason: string }> = []

  if (supportedClaims.length > 0) {
    candidates.push({
      questionType: 'association',
      question: `What is ${entityName} commonly associated with?`,
      answer: `Approved summaries most often associate ${entityName} with ${supportedClaims
        .slice(0, 1)
        .join(' ')} Read the “What we know” section for context.`,
      href: '#governed-what-we-know',
      linkLabel: 'Jump to What we know',
    })
  } else {
    excludedQuestionTypes.push({ questionType: 'association', reason: 'no_publishable_supported_use_signals' })
  }

  candidates.push({
    questionType: 'evidence_strength',
    question: `Is the evidence meaningful or still limited for ${entityName}?`,
    answer: `Current governed grading is ${evidenceMeta.title.toLowerCase()}. ${evidenceMeta.tone}`,
    href: '#governed-evidence-snapshot',
    linkLabel: 'Jump to Evidence snapshot',
  })

  if (safetyClaims.length > 0) {
    candidates.push({
      questionType: 'safety_caution',
      question: `Are there safety or interaction cautions for ${entityName}?`,
      answer: `Yes. Approved cautions include ${safetyClaims.slice(0, 1).join(' ')} Review safety and interaction notes before use decisions.`,
      href: '#governed-safety-interactions',
      linkLabel: 'Jump to Safety & interactions',
    })
  } else {
    excludedQuestionTypes.push({ questionType: 'safety_caution', reason: 'no_publishable_safety_signals' })
  }

  if (uncertaintyClaims.length > 0 || governedFaq.whatRemainsUncertain.length > 0) {
    const uncertainty = uncertaintyClaims[0] || firstSentence(governedFaq.whatRemainsUncertain[0] || '')
    candidates.push({
      questionType: 'uncertainty',
      question: `What remains uncertain or under-researched about ${entityName}?`,
      answer: uncertainty
        ? `${uncertainty} Treat current findings as directional until stronger human evidence resolves remaining gaps.`
        : 'Current governed notes still flag uncertainty and evidence gaps.',
      href: '#governed-uncertainty',
      linkLabel: 'Jump to uncertainty notes',
    })
  } else {
    excludedQuestionTypes.push({ questionType: 'uncertainty', reason: 'no_publishable_uncertainty_or_gap_signals' })
  }

  if (hasVisibleCompareSection) {
    candidates.push({
      questionType: 'compare',
      question: `How does ${entityName} compare with related options?`,
      answer: `Use the visible related sections on this page to compare governed evidence context, cautions, and mechanisms across ${comparisonLabel}.`,
      href: '#governed-compare-links',
      linkLabel: 'Jump to related comparisons',
    })
  } else {
    excludedQuestionTypes.push({ questionType: 'compare', reason: 'no_visible_related_compare_section' })
  }

  const selected = candidates.slice(0, 3)

  return {
    items: selected,
    excludedQuestionTypes,
  }
}
