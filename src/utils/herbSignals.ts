import type { Herb } from '@/types'
import { asStringArray } from '@/utils/asStringArray'
import { isNonEmptyString } from '@/utils/isNonEmptyString'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

function splitList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return asStringArray(value)
  }
  if (isNonEmptyString(value)) {
    return value
      .split(/[;,|\n]/)
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

export function getHerbEffects(herb: Herb): string[] {
  const raw = herb.effects
  return splitList(raw).map(effect => effect.toLowerCase())
}

export function getContraindications(herb: Herb): string[] {
  return splitList(herb.contraindications).map(item => item.toLowerCase())
}

export function getClassTokens(herb: Herb): string[] {
  const klass = String(herb.class ?? herb.category ?? '').toLowerCase()
  return klass
    .split(/[\s/,-]+/)
    .map(token => token.trim())
    .filter(Boolean)
}

export function getHerbConfidence(herb: Herb): ConfidenceLevel {
  const confidenceValue = String(
    herb.confidenceLevel ?? herb.confidence ?? herb.dataConfidence ?? ''
  ).toLowerCase()

  if (confidenceValue.includes('high')) return 'high'
  if (confidenceValue.includes('low')) return 'low'
  if (confidenceValue.includes('med')) return 'medium'

  const sourceCount = Array.isArray(herb.sources) ? herb.sources.length : 0
  if (sourceCount >= 3) return 'high'
  if (sourceCount <= 1) return 'low'
  return 'medium'
}

export function herbDisplayName(herb: Herb): string {
  return String(herb.common ?? herb.name ?? herb.scientific ?? herb.id ?? 'Unknown herb')
}
