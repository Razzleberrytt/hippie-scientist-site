import {
  getAllCompoundsRuntime,
  RuntimeCompound,
} from './semantic-runtime'

export type SemanticSearchResult = RuntimeCompound & {
  semantic_score: number
  semantic_reasons: string[]
}

const SYNONYMS: Record<string, string[]> = {
  sleep: ['insomnia', 'rest', 'sleep quality', 'latency', 'melatonin'],
  focus: ['attention', 'cognition', 'memory', 'productivity', 'nootropic'],
  stress: ['anxiety', 'calm', 'relaxation', 'mood'],
  recovery: ['exercise', 'muscle', 'performance', 'hydration'],
  longevity: ['aging', 'oxidative', 'mitochondria', 'antioxidant'],
}

function normalize(value: string) {
  return value.toLowerCase().trim()
}

function tokenize(query: string) {
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
}

function includes(text: string, keyword: string) {
  return text.includes(normalize(keyword))
}

function expandTerms(tokens: string[]) {
  const expanded = new Set(tokens)

  for (const token of tokens) {
    expanded.add(token)

    for (const [key, values] of Object.entries(SYNONYMS)) {
      if (token === key || values.includes(token)) {
        expanded.add(key)

        for (const value of values) {
          expanded.add(value)
        }
      }
    }
  }

  return [...expanded]
}

function scoreCompound(compound: RuntimeCompound, terms: string[]) {
  const reasons: string[] = []

  const haystack = [
    compound.name,
    compound.summary,
    ...compound.effects,
    ...compound.mechanisms,
    ...compound.clusters,
    ...compound.aliases,
    compound.archetype,
  ]
    .join(' ')
    .toLowerCase()

  let score = 0

  for (const term of terms) {
    if (includes(compound.name, term)) {
      score += 12
      reasons.push(`name match: ${term}`)
    }

    if (compound.effects.some((effect) => includes(effect.toLowerCase(), term))) {
      score += 8
      reasons.push(`effect match: ${term}`)
    }

    if (compound.mechanisms.some((mechanism) => includes(mechanism.toLowerCase(), term))) {
      score += 7
      reasons.push(`mechanism match: ${term}`)
    }

    if (compound.clusters.some((cluster) => includes(cluster.toLowerCase(), term))) {
      score += 6
      reasons.push(`cluster match: ${term}`)
    }

    if (includes(compound.archetype.toLowerCase(), term)) {
      score += 5
      reasons.push(`archetype match: ${term}`)
    }

    if (includes(haystack, term)) {
      score += 2
    }
  }

  if (compound.evidence_tier) score += 1
  if (compound.sources.length >= 5) score += 1

  return {
    score,
    reasons: [...new Set(reasons)].slice(0, 5),
  }
}

export function semanticSearch(query: string, limit = 24): SemanticSearchResult[] {
  const tokens = tokenize(query)
  const terms = expandTerms(tokens)

  return getAllCompoundsRuntime()
    .map((compound) => {
      const result = scoreCompound(compound, terms)

      return {
        ...compound,
        semantic_score: result.score,
        semantic_reasons: result.reasons,
      }
    })
    .filter((compound) => compound.semantic_score > 0)
    .sort((a, b) => b.semantic_score - a.semantic_score || a.name.localeCompare(b.name))
    .slice(0, limit)
}
