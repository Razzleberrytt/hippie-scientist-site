import type { GoalDefinition } from '@/data/goals'
import type { Herb } from '@/types'
import type { BlendFilters } from '@/types/blend'
import { getHerbConfidence, herbDisplayName } from '@/utils/herbSignals'
import { scoreHerbForGoal } from '@/utils/scoreHerbForGoal'

export type BlendRecommendation = {
  primary: Herb
  supporting: Herb[]
  reasoning: string[]
  usedLowConfidenceData: boolean
}

type ScoredHerb = {
  herb: Herb
  score: number
  matchedEffects: string[]
}

function toSet(values: string[]): Set<string> {
  return new Set(values.map(value => value.toLowerCase().trim()).filter(Boolean))
}

function normalizeIdentity(herb: Herb): string {
  return String(herb.slug ?? herb.id ?? herb.name ?? herb.common ?? '').toLowerCase()
}

function hasDuplicateProfile(selectedEffects: Set<string>, candidateEffects: string[]): boolean {
  if (!candidateEffects.length) return false
  const overlap = candidateEffects.filter(effect => selectedEffects.has(effect.toLowerCase()))
  return overlap.length >= Math.max(1, Math.ceil(candidateEffects.length * 0.66))
}

function supportsExperienceLevel(herb: Herb, experienceLevel: BlendFilters['experience']): boolean {
  if (!experienceLevel || experienceLevel === 'advanced') return true

  const intensity = String(herb.intensity ?? herb.intensityLevel ?? '').toLowerCase()
  const isStrong = intensity.includes('strong') || intensity.includes('high')

  if (experienceLevel === 'beginner') return !isStrong
  return true
}

export function generateBlend(
  herbs: Herb[],
  selectedGoal: GoalDefinition,
  options: BlendFilters = {}
): BlendRecommendation | null {
  const excluded = toSet(options.excludeHerbs ?? [])

  const scored = herbs
    .filter(herb => !excluded.has(normalizeIdentity(herb)))
    .filter(herb => supportsExperienceLevel(herb, options.experience))
    .map(herb => {
      const { score, matchedEffects } = scoreHerbForGoal(herb, selectedGoal)
      return { herb, score, matchedEffects }
    })
    .filter(entry => entry.score > 0)

  if (!scored.length) return null

  const confidenceFiltered =
    options.confidence && options.confidence !== 'all'
      ? scored.filter(entry => getHerbConfidence(entry.herb) === options.confidence)
      : scored

  const pool = confidenceFiltered.length ? confidenceFiltered : scored

  pool.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return herbDisplayName(a.herb).localeCompare(herbDisplayName(b.herb))
  })

  const primary = pool[0]
  const selectedEffects = new Set(primary.matchedEffects.map(effect => effect.toLowerCase()))

  const supportingEntries: ScoredHerb[] = []

  for (const candidate of pool.slice(1)) {
    if (supportingEntries.length >= 3) break

    if (hasDuplicateProfile(selectedEffects, candidate.matchedEffects)) continue

    supportingEntries.push(candidate)
    candidate.matchedEffects.forEach(effect => selectedEffects.add(effect.toLowerCase()))
  }

  if (supportingEntries.length < 2) {
    for (const fallback of pool.slice(1)) {
      if (supportingEntries.length >= 2) break
      if (
        supportingEntries.some(
          entry => normalizeIdentity(entry.herb) === normalizeIdentity(fallback.herb)
        )
      ) {
        continue
      }
      supportingEntries.push(fallback)
    }
  }

  const selectedEntries = [primary, ...supportingEntries]
  const usedLowConfidenceData = selectedEntries.some(
    entry => getHerbConfidence(entry.herb) === 'low'
  )

  const reasoning = [
    `Primary herb matches ${Math.max(primary.matchedEffects.length, 1)} key ${selectedGoal.label.toLowerCase()} effects.`,
    `Supporting herbs broaden coverage across ${new Set(supportingEntries.flatMap(entry => entry.matchedEffects)).size || 1} complementary effects.`,
    usedLowConfidenceData
      ? 'Some selected herbs have limited confidence data, so review sources and safety notes.'
      : 'Selected combination favors herbs with stronger confidence and minimal contraindication conflicts.',
  ]

  return {
    primary: primary.herb,
    supporting: supportingEntries.map(entry => entry.herb),
    reasoning,
    usedLowConfidenceData,
  }
}
