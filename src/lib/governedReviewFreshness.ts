import type { ResearchEnrichment } from '@/types/researchEnrichment'

export type GovernedFreshnessState = 'fresh' | 'aging' | 'review_due' | 'partial'

export type GovernedFreshnessSignal = {
  state: GovernedFreshnessState
  reviewedDateLabel: string | null
  daysSinceReview: number | null
  statusLabel: string
  statusTone: string
  statusClassName: string
  keySignals: string[]
  whatChangedRecently: string | null
  exclusions: Array<{ signal: string; reason: string }>
}

const MS_PER_DAY = 24 * 60 * 60 * 1000
const FRESH_DAYS = 120
const AGING_DAYS = 240

function toSentence(input: string | null | undefined) {
  const text = String(input || '').trim()
  if (!text) return null
  const match = text.match(/^[^.?!]+[.?!]?/)
  return (match?.[0] || text).trim()
}

function formatReviewedDate(value: string | null | undefined) {
  const date = new Date(String(value || ''))
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function reviewAgeDays(value: string | null | undefined) {
  const ms = Date.parse(String(value || ''))
  if (!Number.isFinite(ms)) return null
  return Math.floor((Date.now() - ms) / MS_PER_DAY)
}

export function buildGovernedReviewFreshnessSignal(
  enrichment: ResearchEnrichment,
): GovernedFreshnessSignal {
  const hasSafetyCoverage =
    (enrichment.safetyProfile?.summary?.total ?? 0) > 0 ||
    enrichment.interactions.length > 0 ||
    enrichment.contraindications.length > 0 ||
    enrichment.adverseEffects.length > 0
  const hasUseCoverage =
    enrichment.supportedUses.length > 0 || enrichment.unsupportedOrUnclearUses.length > 0
  const hasMechanismCoverage =
    enrichment.mechanisms.length > 0 || enrichment.constituents.length > 0
  const hasUncertaintySignals =
    enrichment.conflictNotes.length > 0 ||
    enrichment.researchGaps.length > 0 ||
    enrichment.pageEvidenceJudgment.conflictNotes.length > 0 ||
    enrichment.pageEvidenceJudgment.uncertaintyNotes.length > 0

  const daysSinceReview = reviewAgeDays(enrichment.lastReviewedAt)
  const reviewedDateLabel = formatReviewedDate(enrichment.lastReviewedAt)

  const exclusions: GovernedFreshnessSignal['exclusions'] = []
  if (!hasSafetyCoverage) exclusions.push({ signal: 'safety_coverage', reason: 'no_publishable_governed_safety_entries' })
  if (!hasUseCoverage) exclusions.push({ signal: 'supported_use_coverage', reason: 'no_publishable_governed_use_claims' })
  if (!hasMechanismCoverage) {
    exclusions.push({ signal: 'mechanism_or_constituent_coverage', reason: 'no_publishable_governed_mechanism_or_constituent_claims' })
  }

  let state: GovernedFreshnessState = 'fresh'
  if (!hasSafetyCoverage || !hasUseCoverage || !hasMechanismCoverage) {
    state = 'partial'
  } else if (daysSinceReview === null || daysSinceReview > AGING_DAYS) {
    state = 'review_due'
  } else if (daysSinceReview > FRESH_DAYS) {
    state = 'aging'
  }

  const statusMeta: Record<GovernedFreshnessState, { label: string; tone: string; className: string }> = {
    fresh: {
      label: 'Fresh governed review',
      tone: 'Reviewed recently with broad governed coverage still present.',
      className: 'border-emerald-300/35 bg-emerald-500/10 text-emerald-100',
    },
    aging: {
      label: 'Aging review window',
      tone: 'Still publishable, but this review is aging and should be refreshed soon.',
      className: 'border-amber-300/35 bg-amber-500/10 text-amber-100',
    },
    review_due: {
      label: 'Review due',
      tone: 'Governed review metadata is old or missing enough to need re-review.',
      className: 'border-rose-300/35 bg-rose-500/10 text-rose-100',
    },
    partial: {
      label: 'Partial governed coverage',
      tone: 'Some governed sections are present, but key safety/use/mechanism areas remain limited.',
      className: 'border-violet-300/35 bg-violet-500/10 text-violet-100',
    },
  }

  const keySignals = [
    reviewedDateLabel ? `Last reviewed ${reviewedDateLabel}` : 'Review date not available',
    hasUncertaintySignals ? 'Uncertainty or conflict is explicitly noted' : 'No explicit uncertainty notes listed',
    hasSafetyCoverage
      ? 'Safety cautions are included in governed entries'
      : 'Safety section is still limited in governed entries',
  ]

  const recentParts: string[] = []
  const topSupported = toSentence(enrichment.supportedUses[0]?.claim)
  const topSafety = toSentence(
    enrichment.safetyProfile?.safetyEntries[0]?.findingTextShort || enrichment.interactions[0]?.claim,
  )
  const topGap = toSentence(enrichment.researchGaps[0]?.claim)

  if (topSupported) recentParts.push(`use context: ${topSupported}`)
  if (topSafety) recentParts.push(`safety update: ${topSafety}`)
  if (topGap) recentParts.push(`remaining gap: ${topGap}`)

  return {
    state,
    reviewedDateLabel,
    daysSinceReview,
    statusLabel: statusMeta[state].label,
    statusTone: statusMeta[state].tone,
    statusClassName: statusMeta[state].className,
    keySignals,
    whatChangedRecently:
      recentParts.length > 0 ? `Recent governed updates currently highlight ${recentParts.slice(0, 2).join(' · ')}.` : null,
    exclusions,
  }
}
