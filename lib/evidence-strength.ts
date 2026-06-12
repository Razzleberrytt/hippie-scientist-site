import type { RuntimeRecord } from '@/types/content'
import {
  getEvidenceTier,
  getEvidenceLetterGrade,
  hasHumanEvidence,
  hasMechanismEvidence,
} from './evidence'

export type EvidenceStrengthTier =
  | 'strong'
  | 'moderate'
  | 'limited'
  | 'preliminary'
  | 'traditional'
  | 'mixed'
  | 'insufficient'
  | 'review'

export type EvidenceStrengthData = {
  /** 0–100 integer driving the progress bar width */
  score: number
  tier: EvidenceStrengthTier
  /** Human-readable label e.g. "Strong Human Evidence" */
  label: string
  grade: 'A' | 'B' | 'C' | 'D'
  humanEvidence: boolean
  mechanismEvidence: boolean
  /** One-line confidence explanation shown in expanded detail */
  explanation: string
  /** Reasons the score may be lower than expected */
  downgradeReasons: string[]
  /** Tailwind class for the progress bar fill */
  barColorClass: string
  /** Tailwind text color for labels */
  textColorClass: string
  /** Tailwind background color for badges */
  bgColorClass: string
  /** Tailwind border color */
  borderColorClass: string
}

const TIER_SCORES: Record<EvidenceStrengthTier, number> = {
  strong: 90,
  moderate: 70,
  limited: 45,
  mixed: 50,
  preliminary: 28,
  traditional: 18,
  insufficient: 8,
  review: 4,
}

const TIER_LABELS: Record<EvidenceStrengthTier, string> = {
  strong: 'Strong Human Evidence',
  moderate: 'Moderate Evidence',
  limited: 'Limited Evidence',
  mixed: 'Mixed Evidence',
  preliminary: 'Preliminary / Mechanistic',
  traditional: 'Traditional Use Only',
  insufficient: 'Insufficient Evidence',
  review: 'Needs Review',
}

const TIER_EXPLANATIONS: Record<EvidenceStrengthTier, string> = {
  strong:
    'Supported by robust human clinical trials, systematic reviews, or meta-analyses with consistent positive outcomes.',
  moderate:
    'Supported by human clinical trials showing generally positive outcomes, though study quality or size may vary.',
  limited:
    'Early human evidence or small-scale studies exist, but larger or better-controlled trials are lacking.',
  mixed:
    'Existing studies show conflicting results, making confident conclusions difficult.',
  preliminary:
    'Primary evidence comes from animal models, cell cultures, or theoretical mechanisms — not human trials.',
  traditional:
    'Supported primarily by long-standing historical or ethnobotanical use; modern clinical validation is minimal.',
  insufficient:
    'No standardized or verifiable clinical evidence is currently documented.',
  review:
    'Profile pending editorial review; evidence quality cannot yet be assessed.',
}

function barColor(tier: EvidenceStrengthTier): string {
  if (tier === 'strong') return 'bg-emerald-600'
  if (tier === 'moderate') return 'bg-blue-600'
  if (tier === 'limited' || tier === 'mixed') return 'bg-amber-500'
  if (tier === 'preliminary') return 'bg-amber-400'
  return 'bg-slate-400'
}

function textColor(tier: EvidenceStrengthTier): string {
  if (tier === 'strong') return 'text-emerald-800'
  if (tier === 'moderate') return 'text-blue-800'
  if (tier === 'limited' || tier === 'mixed') return 'text-amber-800'
  if (tier === 'preliminary') return 'text-amber-700'
  return 'text-slate-700'
}

function bgColor(tier: EvidenceStrengthTier): string {
  if (tier === 'strong') return 'bg-emerald-50'
  if (tier === 'moderate') return 'bg-blue-50'
  return 'bg-amber-50'
}

function borderColor(tier: EvidenceStrengthTier): string {
  if (tier === 'strong') return 'border-emerald-200'
  if (tier === 'moderate') return 'border-blue-200'
  return 'border-amber-200'
}

/**
 * Computes a normalized evidence strength summary from a RuntimeRecord.
 * Wraps the existing tier/grade system into a single typed object for UI components.
 */
export function getEvidenceStrengthData(record: RuntimeRecord): EvidenceStrengthData {
  const tier = getEvidenceTier(record) as EvidenceStrengthTier
  const grade = getEvidenceLetterGrade(record)
  const humanEvidence = hasHumanEvidence(record)
  const mechanismEvidence = hasMechanismEvidence(record)

  const downgradeReasons: string[] = []
  if (!humanEvidence && mechanismEvidence) {
    downgradeReasons.push('No direct human clinical trials documented.')
  }
  if (!humanEvidence && !mechanismEvidence) {
    downgradeReasons.push('No published mechanism or clinical evidence on file.')
  }

  let score = TIER_SCORES[tier]
  // Small boosts for corroborating signals without changing the tier
  if (mechanismEvidence && tier === 'limited') score = Math.min(score + 5, 55)
  if (humanEvidence && tier === 'moderate') score = Math.min(score + 5, 78)

  return {
    score: Math.min(100, Math.max(1, score)),
    tier,
    label: TIER_LABELS[tier],
    grade,
    humanEvidence,
    mechanismEvidence,
    explanation: TIER_EXPLANATIONS[tier],
    downgradeReasons,
    barColorClass: barColor(tier),
    textColorClass: textColor(tier),
    bgColorClass: bgColor(tier),
    borderColorClass: borderColor(tier),
  }
}
