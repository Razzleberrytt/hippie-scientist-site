import { asStringArray } from '@/utils/asStringArray'
import { rankHerbsByEffect } from '@/utils/effectSearch'
import { splitClean } from '@/lib/sanitize'
import type { Herb } from '@/types/herb'

export type EffectCollectionIntent = 'sleep' | 'focus' | 'relaxation'

export type EffectCollectionConfig = {
  intent: EffectCollectionIntent
  query: string
  title: string
  intro: string
  seoDescription: string
  safetyFraming: string[]
  cautionKeywords: string[]
}

export type RankedCollectionHerb = {
  herb: Herb
  rank: number
  score: number
  matchedEffects: string[]
  confidence: 'high' | 'medium' | 'low'
  compoundSupportCount: number
  summary: string
  safetyNotes: string[]
}

export const EFFECT_COLLECTION_CONFIGS: Record<EffectCollectionIntent, EffectCollectionConfig> = {
  sleep: {
    intent: 'sleep',
    query: 'sleep',
    title: 'Best Herbs for Sleep Support',
    intro:
      'Sleep-support herbs differ in how they help: some lower nighttime arousal while others are better for pre-bed settling. This ranking prioritizes herbs with direct sleep-effect matches and stronger data support, so you can compare options beyond generic “calming” claims.',
    seoDescription:
      'Ranked herbs for sleep support using effect-match scoring, confidence weighting, and practical safety framing.',
    safetyFraming: [
      'Avoid stacking several sedative herbs at once when first testing a new routine.',
      'If you use sleep medication, check herb-drug interactions before combining.',
      'Stop use and reassess if next-day grogginess or paradoxical agitation appears.',
    ],
    cautionKeywords: ['sedative', 'cns depressant', 'alcohol', 'benzodiazepine', 'drowsy'],
  },
  focus: {
    intent: 'focus',
    query: 'focus',
    title: 'Top Herbs for Focus and Cognitive Clarity',
    intro:
      'Strong focus support is not just stimulation. The best profiles combine attention signals, cleaner cognitive effects, and enough safety context to avoid avoidable crashes. This page ranks herbs using the same effect-matching model as homepage search, then adds practical caution notes.',
    seoDescription:
      'Data-ranked herbs for focus and cognition with confidence, compound support signals, and concise safety cautions.',
    safetyFraming: [
      'Stimulating herbs can increase anxiety, irritability, or insomnia when overdosed.',
      'Monitor blood pressure and sleep quality when layering nootropic or energizing herbs.',
      'Review interactions if you use ADHD medication, antidepressants, or other stimulants.',
    ],
    cautionKeywords: ['stimulant', 'insomnia', 'hypertension', 'anxiety', 'blood pressure'],
  },
  relaxation: {
    intent: 'relaxation',
    query: 'relaxation',
    title: 'Most Useful Herbs for Relaxation and Stress Relief',
    intro:
      'Relaxation herbs are useful for different reasons: some reduce physical tension, some support emotional downshift, and others are better for winding down in the evening. These rankings emphasize direct relaxation-effect matches and evidence quality so readers can choose intentionally.',
    seoDescription:
      'Explore ranked relaxation herbs for stress support with transparent effect matching and practical safety guidance.',
    safetyFraming: [
      'Relaxation does not always equal sedation, but some herbs can still impair reaction time.',
      'Use extra caution with alcohol, sleep aids, and anti-anxiety medications.',
      'If symptoms are persistent or severe, use professional care alongside self-experiments.',
    ],
    cautionKeywords: ['sedative', 'ssri', 'alcohol', 'pregnan', 'benzodiazepine'],
  },
}

function safetyBlob(herb: Herb): string {
  return [
    ...splitClean(herb.safety),
    ...splitClean(herb.sideeffects),
    ...splitClean(herb.sideEffects),
    ...splitClean(herb.interactions),
    ...splitClean(herb.interactionsText),
    ...splitClean(herb.contraindications),
    ...splitClean(herb.contraindicationsText),
  ]
    .join(' ')
    .toLowerCase()
}

function summaryText(herb: Herb): string {
  const fallback = 'Review the full herb profile for mechanism, effect depth, and safety context.'
  const description = String(herb.effectsSummary || herb.description || '').trim()
  return description || fallback
}

function makeSafetyNotes(herb: Herb, config: EffectCollectionConfig): string[] {
  const blob = safetyBlob(herb)
  const notes: string[] = []

  if (config.cautionKeywords.some(keyword => blob.includes(keyword))) {
    notes.push('Record includes interaction or sensitivity cautions relevant to this goal.')
  }

  if (blob.includes('pregnan')) {
    notes.push(
      'Pregnancy/lactation caution appears in safety fields; confirm suitability clinically.'
    )
  }

  if (!notes.length) {
    notes.push('Check contraindications and interactions on the detail page before use.')
  }

  return notes.slice(0, 2)
}

export function buildEffectCollectionFeed(
  herbs: Herb[],
  intent: EffectCollectionIntent,
  limit = 18
) {
  const config = EFFECT_COLLECTION_CONFIGS[intent]
  if (!config) return []

  return rankHerbsByEffect(herbs, config.query)
    .slice(0, limit)
    .map((entry, index) => ({
      herb: entry.herb,
      rank: index + 1,
      score: Math.round(entry.score),
      matchedEffects: entry.matchedEffects,
      confidence: entry.confidence,
      compoundSupportCount: entry.compoundSupportCount,
      summary: summaryText(entry.herb),
      safetyNotes: makeSafetyNotes(entry.herb, config),
    }))
}

export function effectCollectionChips(herb: Herb) {
  return asStringArray(herb.effects)
    .flatMap(effect => effect.split(/[;,|]/))
    .map(effect => effect.trim())
    .filter(Boolean)
    .slice(0, 4)
}
