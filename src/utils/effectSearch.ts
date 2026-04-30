import type { Herb } from '@/types'

type MatchConfidence = 'high' | 'medium' | 'low'

export type RankedEffectMatch = {
  herb: Herb
  normalizedQuery: string
  matchedEffects: string[]
  compoundSupportCount: number
  confidence: MatchConfidence
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item ?? '').trim()).filter(Boolean)
  }

  const text = String(value ?? '').trim()
  if (!text) return []

  return text.split(/[;,|/\n]+/).map(item => item.trim()).filter(Boolean)
}

function normalizeTerm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function getHerbEffectTerms(herb: Herb): string[] {
  const rawEffects = toStringList(herb.effects)
  const summaryTerms = toStringList(herb.effectsSummary)
  return [...rawEffects, ...summaryTerms].map(normalizeTerm).filter(Boolean)
}

function getCompoundSupportCount(herb: Herb): number {
  return toStringList(herb.compounds).length
}

export function effectSuggestions(herbs: Herb[], limit = 12): string[] {
  const seen = new Set<string>()

  for (const herb of herbs) {
    for (const effect of getHerbEffectTerms(herb)) {
      if (!seen.has(effect)) seen.add(effect)
      if (seen.size >= limit) return [...seen]
    }
  }

  return [...seen]
}

export function rankHerbsByEffect(herbs: Herb[], query: string): RankedEffectMatch[] {
  const normalizedQuery = normalizeTerm(query)
  if (!normalizedQuery) return []

  const queryTokens = normalizedQuery.split(' ').filter(Boolean)

  return herbs
    .map(herb => {
      const effectTerms = getHerbEffectTerms(herb)
      const matchedEffects = effectTerms.filter(effect => queryTokens.every(token => effect.includes(token)))
      const score = matchedEffects.length
      const confidence: MatchConfidence = score >= 2 ? 'high' : score === 1 ? 'medium' : 'low'

      return {
        herb,
        normalizedQuery,
        matchedEffects,
        compoundSupportCount: getCompoundSupportCount(herb),
        confidence,
        score,
      }
    })
    .filter(result => result.matchedEffects.length > 0)
    .sort((a, b) => b.score - a.score || b.compoundSupportCount - a.compoundSupportCount)
    .map(({ score: _score, ...result }) => result)
}
