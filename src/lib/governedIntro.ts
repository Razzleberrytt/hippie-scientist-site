import { getEvidenceLabelMeta } from '@/lib/governedResearch'
import { hasPlaceholderText } from '@/lib/summary'
import type { ResearchEnrichment } from '@/types/researchEnrichment'
import type { ConfidenceLevel } from '@/utils/calculateConfidence'

type IntroPayload = {
  whatItIs: string
  commonUse: string
  evidenceContext: string
  cautionNote?: string
  quickFacts: string[]
}

type IntroSignal =
  | 'evidence_summary'
  | 'supported_use'
  | 'unsupported_use'
  | 'safety_caution'
  | 'uncertainty_or_conflict'
  | 'review_status'

type IntroDecision = {
  mode: 'governed' | 'fallback'
  usedSignals: IntroSignal[]
  excludedSignals: Array<{ signal: IntroSignal; reason: string }>
}

export type GovernedIntroResult = IntroPayload & {
  decision: IntroDecision
}

const WEAK_EVIDENCE_LABELS = new Set([
  'preclinical_only',
  'traditional_use_only',
  'insufficient_evidence',
  'mixed_or_uncertain',
  'conflicting_evidence',
])

function firstSentence(value: string, fallback: string) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (!cleaned) return fallback
  const sentence = cleaned.match(/[^.!?]+[.!?]?/)?.[0]?.trim() || cleaned
  return sentence.length > 180 ? `${sentence.slice(0, 177).trimEnd()}…` : sentence
}

function formatReviewedDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

function isLowValueGovernedSummary(value: string) {
  const normalized = value.toLowerCase()
  return (
    normalized.includes('approved normalized findings') ||
    normalized.includes('topic types') ||
    normalized.includes('governed input')
  )
}

function unique<T>(items: T[]) {
  return [...new Set(items)]
}

function claimText(claim: { claim: string }) {
  return claim.claim.replace(/\s+/g, ' ').trim()
}

function summarizeEvidenceContext(args: {
  entityName: string
  enrichment: ResearchEnrichment
  sourceCount: number
}) {
  const { entityName, enrichment, sourceCount } = args
  const label = enrichment.pageEvidenceJudgment?.evidenceLabel ?? 'insufficient_evidence'
  const meta = getEvidenceLabelMeta(label)
  const conflictState = enrichment.pageEvidenceJudgment?.grading?.conflictState
  const uncertaintyNotes = [
    ...(enrichment.pageEvidenceJudgment?.uncertaintyNotes || []),
    ...(enrichment.pageEvidenceJudgment?.conflictNotes || []),
    ...enrichment.conflictNotes.map(claimText),
  ]
    .map(value => value.trim())
    .filter(Boolean)

  const leading = `Governed evidence grading is ${meta.title.toLowerCase()} across ${sourceCount} approved source${sourceCount === 1 ? '' : 's'}.`
  if (label === 'preclinical_only') {
    return `${leading} Signals are preclinical and should not be treated as proven human efficacy.`
  }
  if (label === 'traditional_use_only') {
    return `${leading} Use context is traditional and modern clinical confirmation remains limited.`
  }
  if (conflictState === 'conflicting_evidence' || label === 'conflicting_evidence') {
    const note = uncertaintyNotes[0]
    return note
      ? `${leading} Evidence is conflicting; ${firstSentence(note, `interpret ${entityName} findings cautiously`)}.`
      : `${leading} Evidence is conflicting across sources or contexts.`
  }
  if (WEAK_EVIDENCE_LABELS.has(label) && uncertaintyNotes.length > 0) {
    return `${leading} Key uncertainty: ${firstSentence(uncertaintyNotes[0], 'data quality and comparability remain limited')}.`
  }
  return `${leading} ${meta.tone}`
}

export function buildFallbackHerbIntro(args: {
  herbDisplayName: string
  description: string
  mechanism: string
  therapeuticUses: string[]
  primaryEffects: string[]
  confidence: ConfidenceLevel
  sourceCount: number
  cautionCount: number
  contraindications: string[]
  interactions: string[]
  sideEffects: string[]
  introFacts: string[]
}): IntroPayload {
  const {
    herbDisplayName,
    description,
    mechanism,
    therapeuticUses,
    primaryEffects,
    confidence,
    sourceCount,
    cautionCount,
    contraindications,
    interactions,
    sideEffects,
    introFacts,
  } = args

  const whatItIs = firstSentence(
    description || mechanism,
    `${herbDisplayName} is an herbal profile with limited descriptive context so far.`,
  )
  const commonUse = therapeuticUses.length
    ? `Commonly referenced for ${therapeuticUses.slice(0, 2).join(' and ')}${therapeuticUses.length > 2 ? ', among other uses' : ''}.`
    : primaryEffects.length
      ? `Most often tracked for ${primaryEffects.slice(0, 2).join(' and ')} outcomes.`
      : 'Traditional use context is still being expanded for this entry.'

  const evidenceContext =
    confidence === 'high'
      ? `Confidence is high with ${sourceCount || 'no'} listed source${sourceCount === 1 ? '' : 's'}; still validate fit for your context.`
      : confidence === 'medium'
        ? `Confidence is mixed; this profile combines known signals with areas that still need stronger sourcing.`
        : `Confidence is low, so treat this page as preliminary and cross-check primary references before acting.`

  const cautionNote =
    cautionCount > 0
      ? contraindications[0] ||
        interactions[0] ||
        sideEffects[0] ||
        'Review contraindications and interaction notes before use.'
      : undefined

  return { whatItIs, commonUse, evidenceContext, cautionNote, quickFacts: introFacts }
}

export function buildFallbackCompoundIntro(args: {
  compoundName: string
  description: string
  mechanism: string
  therapeuticUses: string[]
  primaryEffects: string[]
  linkedHerbCount: number
  confidence: ConfidenceLevel
  sourceCount: number
  cautionCount: number
  contraindications: string[]
  interactions: string[]
  sideEffects: string[]
  introFacts: string[]
}): IntroPayload {
  const {
    compoundName,
    description,
    mechanism,
    therapeuticUses,
    primaryEffects,
    linkedHerbCount,
    confidence,
    sourceCount,
    cautionCount,
    contraindications,
    interactions,
    sideEffects,
    introFacts,
  } = args

  const whatItIs = firstSentence(
    description || mechanism,
    `${compoundName} is a compound entry with sparse descriptive context so far.`,
  )
  const commonUse = therapeuticUses.length
    ? `Commonly discussed in connection with ${therapeuticUses.slice(0, 2).join(' and ')}.`
    : primaryEffects.length
      ? `Most often tracked for ${primaryEffects.slice(0, 2).join(' and ')} outcomes in herb profiles.`
      : `Usage context is still being expanded; currently linked to ${linkedHerbCount} herb profile${linkedHerbCount === 1 ? '' : 's'}.`

  const evidenceContext =
    confidence === 'high'
      ? `Confidence is high with ${sourceCount || 'no'} listed source${sourceCount === 1 ? '' : 's'}; still review mechanism and safety fit.`
      : confidence === 'medium'
        ? 'Confidence is mixed; evidence is useful but not equally strong across all claims.'
        : 'Confidence is low, so read this as a preliminary summary and verify against primary references.'

  const cautionNote =
    cautionCount > 0
      ? contraindications[0] ||
        interactions[0] ||
        sideEffects[0] ||
        'Review contraindications and interaction notes before use.'
      : undefined

  return { whatItIs, commonUse, evidenceContext, cautionNote, quickFacts: introFacts }
}

export function buildGovernedDetailIntro(args: {
  entityName: string
  fallback: IntroPayload
  enrichment: ResearchEnrichment | null
  sourceCount: number
}): GovernedIntroResult {
  const { entityName, fallback, enrichment, sourceCount } = args
  const excludedSignals: IntroDecision['excludedSignals'] = []

  if (!enrichment) {
    return {
      ...fallback,
      decision: {
        mode: 'fallback',
        usedSignals: [],
        excludedSignals: [
          { signal: 'evidence_summary', reason: 'no_publishable_governed_enrichment' },
          { signal: 'supported_use', reason: 'no_publishable_governed_enrichment' },
          { signal: 'safety_caution', reason: 'no_publishable_governed_enrichment' },
          { signal: 'uncertainty_or_conflict', reason: 'no_publishable_governed_enrichment' },
          { signal: 'review_status', reason: 'no_publishable_governed_enrichment' },
        ],
      },
    }
  }

  const usedSignals: IntroSignal[] = []
  const supportedUseClaims = unique(enrichment.supportedUses.map(claimText).filter(Boolean))
  const unclearUseClaims = unique(enrichment.unsupportedOrUnclearUses.map(claimText).filter(Boolean))
  const cautionClaims = unique([
    ...(enrichment.safetyProfile?.safetyEntries.map(entry => entry.findingTextShort) || []),
    ...enrichment.interactions.map(claimText),
    ...enrichment.contraindications.map(claimText),
    ...enrichment.adverseEffects.map(claimText),
  ])
    .map(item => item.trim())
    .filter(Boolean)
  const uncertaintyClaims = unique([
    ...enrichment.pageEvidenceJudgment.uncertaintyNotes,
    ...enrichment.pageEvidenceJudgment.conflictNotes,
    ...enrichment.conflictNotes.map(claimText),
    ...enrichment.researchGaps.map(claimText),
  ])
    .map(item => item.trim())
    .filter(Boolean)

  const whatItIs =
    enrichment.evidenceSummary && !isLowValueGovernedSummary(enrichment.evidenceSummary)
      ? firstSentence(enrichment.evidenceSummary, fallback.whatItIs)
      : fallback.whatItIs
  usedSignals.push('evidence_summary')

  let commonUse = fallback.commonUse
  if (supportedUseClaims.length > 0) {
    commonUse = `${entityName} is commonly associated in approved summaries with ${supportedUseClaims.slice(0, 2).join(' and ')}.`
    usedSignals.push('supported_use')
  } else if (unclearUseClaims.length > 0) {
    commonUse = `Approved summaries discuss ${entityName} for ${unclearUseClaims.slice(0, 2).join(' and ')}, but evidence remains uncertain.`
    usedSignals.push('unsupported_use')
    excludedSignals.push({ signal: 'supported_use', reason: 'no_publishable_supported_use_claims' })
  } else {
    excludedSignals.push({ signal: 'supported_use', reason: 'no_publishable_use_association_claims' })
    excludedSignals.push({ signal: 'unsupported_use', reason: 'no_publishable_unsupported_use_claims' })
  }

  const evidenceContext = summarizeEvidenceContext({ entityName, enrichment, sourceCount })
  usedSignals.push('review_status')

  let cautionNote = fallback.cautionNote
  if (cautionClaims.length > 0) {
    cautionNote = cautionClaims[0]
    usedSignals.push('safety_caution')
  } else {
    excludedSignals.push({ signal: 'safety_caution', reason: 'no_publishable_safety_caution_claims' })
  }

  if (uncertaintyClaims.length > 0) {
    usedSignals.push('uncertainty_or_conflict')
  } else {
    excludedSignals.push({ signal: 'uncertainty_or_conflict', reason: 'no_publishable_uncertainty_or_conflict_claims' })
  }

  const reviewedDate = formatReviewedDate(enrichment.lastReviewedAt)
  const quickFacts = unique([
    `governed intro source: approved enrichment`,
    ...fallback.quickFacts,
    ...(reviewedDate ? [`last governed review ${reviewedDate}`] : []),
  ])

  return {
    whatItIs,
    commonUse,
    evidenceContext,
    cautionNote,
    quickFacts,
    decision: {
      mode: 'governed',
      usedSignals: unique(usedSignals),
      excludedSignals,
    },
  }
}

export function countPlaceholderSignals(intro: IntroPayload) {
  return [intro.whatItIs, intro.commonUse, intro.evidenceContext, intro.cautionNote || ''].filter(text =>
    hasPlaceholderText(text),
  ).length
}
