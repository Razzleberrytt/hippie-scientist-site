import type { Herb } from '@/types'
import { slugify } from '@/lib/slug'
import { getCommonName } from '@/lib/herbName'
import { normalizeScientificTags } from '@/lib/tags'

export const EXPLORE_EFFECTS = ['Calm', 'Focus', 'Lucidity', 'Visionary'] as const

type EffectKey = (typeof EXPLORE_EFFECTS)[number]

const EFFECT_KEYWORDS: Record<EffectKey, RegExp> = {
  Calm: /(calm|relax|sleep|sedative|anxiolytic|soothing|gaba)/i,
  Focus: /(focus|clarity|attention|energy|stimul|nootropic|cognitive)/i,
  Lucidity: /(lucid|dream|awareness|mindful|clear-headed|oneiro)/i,
  Visionary: /(vision|psychedelic|entheogen|hallucin|mystic|5-ht2a|perception)/i,
}

function textBlob(entity: Herb) {
  return [
    entity.common,
    entity.scientific,
    entity.name,
    entity.description,
    entity.effects,
    entity.benefits,
    entity.mechanism,
    entity.mechanismOfAction,
    ...(entity.tags || []),
    ...(entity.pharmCategories || []),
    ...(entity.compoundClasses || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function normalizedList(value: unknown): string[] {
  if (!value) return []
  const source = Array.isArray(value) ? value : [value]
  return source
    .flatMap(item => String(item).split(/[;,/]/g))
    .map(item => item.toLowerCase().trim())
    .filter(Boolean)
}

function normalizeIntensity(entity: Herb): number {
  const value = String(entity.intensityLevel || entity.intensityLabel || entity.intensity || '')
    .toLowerCase()
    .trim()
  if (value.includes('strong')) return 3
  if (value.includes('moderate')) return 2
  if (value.includes('mild')) return 1
  return 2
}

export function extractEffectBuckets(entity: Herb): EffectKey[] {
  const blob = textBlob(entity)
  return EXPLORE_EFFECTS.filter(effect => EFFECT_KEYWORDS[effect].test(blob))
}

export function scoreRelatedHerb(target: Herb, candidate: Herb): number {
  const targetEffects = new Set(extractEffectBuckets(target))
  const candidateEffects = extractEffectBuckets(candidate)
  const sharedEffects = candidateEffects.filter(effect => targetEffects.has(effect)).length

  const targetMechanisms = new Set(
    normalizedList([target.mechanism, target.mechanismOfAction, ...(target.pharmCategories || [])])
  )
  const candidateMechanisms = normalizedList([
    candidate.mechanism,
    candidate.mechanismOfAction,
    ...(candidate.pharmCategories || []),
  ])
  const sharedMechanisms = candidateMechanisms.filter(m => targetMechanisms.has(m)).length

  const targetClasses = new Set(normalizedList(target.compoundClasses || []))
  const candidateClasses = normalizedList(candidate.compoundClasses || [])
  const sharedClasses = candidateClasses.filter(entry => targetClasses.has(entry)).length

  const targetTags = new Set(normalizeScientificTags(target.tags || []))
  const sharedTags = normalizeScientificTags(candidate.tags || []).filter(tag =>
    targetTags.has(tag)
  ).length

  const intensityDistance = Math.abs(normalizeIntensity(target) - normalizeIntensity(candidate))
  const intensityScore = Math.max(0, 2 - intensityDistance)

  return (
    sharedEffects * 5 + sharedMechanisms * 4 + sharedClasses * 3 + sharedTags * 2 + intensityScore
  )
}

export function recommendRelatedHerbs(target: Herb, herbs: Herb[], limit = 4): Herb[] {
  return herbs
    .filter(candidate => candidate.slug !== target.slug)
    .map(candidate => ({ candidate, score: scoreRelatedHerb(target, candidate) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => entry.candidate)
}

export function recommendRelatedCompoundsForHerb(herb: Herb, compounds: Herb[], limit = 5): Herb[] {
  const activeCompounds = new Set(normalizedList(herb.active_compounds || herb.compounds || []))
  const herbMechanisms = new Set(normalizedList([herb.mechanism, ...(herb.pharmCategories || [])]))
  const herbClasses = new Set(normalizedList(herb.compoundClasses || []))
  const herbEffects = new Set(extractEffectBuckets(herb))

  return compounds
    .map(compound => {
      const compoundName = String(compound.name || compound.common || '').toLowerCase()
      const directMatch =
        activeCompounds.has(compoundName) || activeCompounds.has(slugify(compoundName))
      const mechanismOverlap = normalizedList([
        compound.mechanism,
        compound.mechanismOfAction,
        ...(compound.pharmCategories || []),
      ]).filter(entry => herbMechanisms.has(entry)).length
      const classOverlap = normalizedList(compound.compoundClasses || []).filter(entry =>
        herbClasses.has(entry)
      ).length
      const effectOverlap = extractEffectBuckets(compound).filter(effect =>
        herbEffects.has(effect)
      ).length

      const score =
        (directMatch ? 12 : 0) + mechanismOverlap * 4 + classOverlap * 3 + effectOverlap * 2
      return { compound, score }
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => entry.compound)
}

export function recommendRelatedCompounds(target: Herb, compounds: Herb[], limit = 4): Herb[] {
  return recommendRelatedCompoundsForHerb(target, compounds, limit)
}

export function getDisplayName(item: Herb): string {
  return (
    getCommonName(item) ?? item.common ?? item.scientific ?? item.name ?? item.slug ?? 'Unknown'
  )
}

export function pickRandomHerb(herbs: Herb[]): Herb | null {
  if (!herbs.length) return null
  const index = Math.floor(Math.random() * herbs.length)
  return herbs[index] ?? null
}
