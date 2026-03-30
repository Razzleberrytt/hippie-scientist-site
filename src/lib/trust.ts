import type { ConfidenceLevel } from '@/utils/calculateConfidence'
import { hasPlaceholderText } from '@/lib/summary'

type EvidenceTier = 'strong' | 'moderate' | 'limited'

type EvidenceTierInput = {
  confidence: ConfidenceLevel
  sourceCount: number
  completenessScore: number
}

type ContentFlagInput = {
  description?: string
  mechanism?: string
  effects?: string[]
  therapeuticUses?: string[]
}

type TrustNoteInput = {
  evidenceTier: EvidenceTier
  sourceCount: number
  hasInferredContent: boolean
  hasFallbackContent: boolean
}

const INFERRED_PATTERN = /\b(inferred|theoretical|contextual inference|limited evidence|evidence is limited)\b/i

export function getEvidenceTier({ confidence, sourceCount, completenessScore }: EvidenceTierInput): EvidenceTier {
  if (confidence === 'high' && sourceCount >= 2 && completenessScore >= 75) return 'strong'
  if (confidence === 'low' || sourceCount === 0 || completenessScore < 50) return 'limited'
  return 'moderate'
}

export function getEvidenceTierLabel(tier: EvidenceTier): string {
  if (tier === 'strong') return 'Evidence tier: stronger'
  if (tier === 'moderate') return 'Evidence tier: mixed'
  return 'Evidence tier: limited'
}

export function getEvidenceTierClass(tier: EvidenceTier): string {
  if (tier === 'strong') return 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100'
  if (tier === 'moderate') return 'border-amber-300/45 bg-amber-500/15 text-amber-100'
  return 'border-rose-300/50 bg-rose-500/15 text-rose-100'
}

export function inferContentFlags(input: ContentFlagInput): {
  hasInferredContent: boolean
  hasFallbackContent: boolean
} {
  const texts = [input.description || '', input.mechanism || '', ...(input.effects || []), ...(input.therapeuticUses || [])]

  return {
    hasInferredContent: texts.some(text => INFERRED_PATTERN.test(text)),
    hasFallbackContent: texts.some(text => hasPlaceholderText(text)),
  }
}

export function formatReviewDate(value: string): string {
  if (!value.trim()) return 'Not listed'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function getTrustNote({
  evidenceTier,
  sourceCount,
  hasInferredContent,
  hasFallbackContent,
}: TrustNoteInput): string {
  if (hasFallbackContent) {
    return 'Some copy is fallback-derived or placeholder-adjacent. Treat claims as provisional.'
  }
  if (hasInferredContent) {
    return 'Some statements are inferred from indirect evidence; certainty is limited.'
  }
  if (evidenceTier === 'limited' || sourceCount <= 1) {
    return 'Evidence is currently sparse. Cross-check primary references before acting on this profile.'
  }
  return 'This page summarizes available evidence signals and should still be read with context.'
}

export function countCautionSignals(input: {
  contraindications?: string[]
  interactions?: string[]
  sideEffects?: string[]
}): number {
  return (input.contraindications || []).length + (input.interactions || []).length + (input.sideEffects || []).length
}
