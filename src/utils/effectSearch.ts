import type { Herb } from '@/types'
import { asStringArray } from '@/utils/asStringArray'
import { normalizeText } from '@/utils/normalizeText'

type ConfidenceWeight = 'high' | 'medium' | 'low'

export type RankedEffectHerb = {
  herb: Herb
  score: number
  matchedEffects: string[]
  normalizedQuery: string
  compoundSupportCount: number
  confidence: ConfidenceWeight
}

const EFFECT_SYNONYMS: Record<string, string[]> = {
  relaxation: [
    'calming',
    'calm',
    'relax',
    'sedative',
    'anxiolytic',
    'stress relief',
    'anti-anxiety',
  ],
  sleep: ['sleep', 'insomnia', 'sedative', 'night', 'bedtime'],
  focus: ['focus', 'attention', 'concentration', 'cognitive', 'nootropic'],
  energy: ['energy', 'stimulant', 'alertness', 'uplift'],
  mood: ['mood', 'euphoria', 'antidepressant', 'uplifting'],
}

function confidenceWeight(level: unknown): number {
  const normalized = normalizeText(level)
  if (normalized === 'high') return 1
  if (normalized === 'medium') return 0.65
  return 0.35
}

function toConfidence(level: unknown): ConfidenceWeight {
  const normalized = normalizeText(level)
  if (normalized === 'high' || normalized === 'medium') return normalized
  return 'low'
}

function splitEffects(herb: Herb): string[] {
  return asStringArray(herb.effects)
    .flatMap(effect => effect.split(/[;,|]/))
    .map(effect => effect.trim())
    .filter(Boolean)
}

export function normalizeEffectTerm(term: string): string {
  const normalized = normalizeText(term)
  if (!normalized) return ''

  const match = Object.entries(EFFECT_SYNONYMS).find(([canonical, synonyms]) => {
    if (canonical === normalized) return true
    return synonyms.some(synonym => normalized.includes(normalizeText(synonym)))
  })

  return match?.[0] || normalized
}

export function buildEffectIndex(herbs: Herb[]) {
  const index = new Map<string, Set<string>>()

  herbs.forEach(herb => {
    const slug = String(herb.slug || herb.id || herb.common || herb.name || '').trim()
    if (!slug) return

    splitEffects(herb).forEach(effect => {
      const canonical = normalizeEffectTerm(effect)
      if (!canonical) return
      if (!index.has(canonical)) index.set(canonical, new Set())
      index.get(canonical)?.add(slug)
    })
  })

  return index
}

export function effectSuggestions(herbs: Herb[], limit = 10): string[] {
  const effectCounts = new Map<string, number>()

  herbs.forEach(herb => {
    splitEffects(herb).forEach(effect => {
      const canonical = normalizeEffectTerm(effect)
      if (!canonical) return
      effectCounts.set(canonical, (effectCounts.get(canonical) || 0) + 1)
    })
  })

  return Array.from(effectCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([effect]) => effect)
}

export function rankHerbsByEffect(herbs: Herb[], query: string): RankedEffectHerb[] {
  const normalizedQuery = normalizeEffectTerm(query)
  if (!normalizedQuery) return []

  return herbs
    .map(herb => {
      const effects = splitEffects(herb)
      const normalizedEffects = effects.map(effect => normalizeEffectTerm(effect))
      const matchedEffects = effects.filter((effect, index) => {
        const normalizedEffect = normalizedEffects[index]
        return (
          normalizedEffect === normalizedQuery ||
          normalizedEffect.includes(normalizedQuery) ||
          normalizedQuery.includes(normalizedEffect)
        )
      })

      if (matchedEffects.length === 0) return null

      const exactMatches = normalizedEffects.filter(effect => effect === normalizedQuery).length
      const fuzzyMatches = matchedEffects.length - exactMatches
      const matchStrength = exactMatches * 45 + fuzzyMatches * 20

      const compounds = asStringArray(
        herb.activeCompounds || herb.active_compounds || herb.compounds || herb.compoundsDetailed
      )
      const compoundSupportCount = compounds.length
      const compoundStrength = Math.min(compoundSupportCount, 6) * 5

      const confidenceScore = confidenceWeight(herb.confidence) * 20

      return {
        herb,
        score: matchStrength + confidenceScore + compoundStrength,
        matchedEffects,
        normalizedQuery,
        compoundSupportCount,
        confidence: toConfidence(herb.confidence),
      }
    })
    .filter((entry): entry is RankedEffectHerb => Boolean(entry))
    .sort((a, b) => b.score - a.score)
}
