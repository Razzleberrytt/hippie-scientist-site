import { sanitizeSurfaceText } from '@/lib/summary'
import { splitClean } from '@/lib/sanitize'

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

export function extractPrimaryEffects(value: unknown, max = 3): string[] {
  return splitClean(value).slice(0, max)
}

export function computeConfidenceLevel(input: {
  mechanism?: unknown
  effects?: unknown
  compounds?: unknown
}): ConfidenceLevel {
  const hasMechanism = sanitizeSurfaceText(input.mechanism).length > 0
  const hasEffects = splitClean(input.effects).length > 0
  const hasCompounds = splitClean(input.compounds).length > 0

  const presentCount = [hasMechanism, hasEffects, hasCompounds].filter(Boolean).length

  if (presentCount === 3) return 'High'
  if (presentCount >= 1) return 'Medium'
  return 'Low'
}

export function confidenceBadgeClass(level: ConfidenceLevel) {
  if (level === 'High') return 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100'
  if (level === 'Medium') return 'border-amber-300/40 bg-amber-500/15 text-amber-100'
  return 'border-rose-300/45 bg-rose-500/15 text-rose-100'
}
