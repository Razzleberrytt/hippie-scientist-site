import { asStringArray } from '@/utils/asStringArray'
import { isNonEmptyString } from '@/utils/isNonEmptyString'

export type HerbCompleteness = {
  hasMechanism: boolean
  hasEffects: boolean
  hasActiveCompounds: boolean
  hasContraindications: boolean
  effectCount: number
  activeCompoundCount: number
  contraindicationCount: number
  completenessScore: number
}

export type CompoundCompleteness = {
  hasMechanism: boolean
  hasEffects: boolean
  hasSafety: boolean
  hasHerbs: boolean
  effectCount: number
  safetyCount: number
  herbCount: number
  completenessScore: number
}

function splitDelimitedText(value: string): string[] {
  return value
    .split(/[\n,;|]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function toStringList(value: unknown): string[] {
  const values = asStringArray(value)
  if (values.length > 1) return values
  if (values.length === 1) {
    const [singleValue] = values
    return splitDelimitedText(singleValue)
  }
  if (isNonEmptyString(value)) return splitDelimitedText(value)
  return []
}

function countPresent(flags: boolean[]): number {
  return flags.filter(Boolean).length
}

export function getHerbDataCompleteness(entry: Record<string, unknown>): HerbCompleteness {
  const mechanism = entry.mechanism ?? entry.mechanismOfAction ?? entry.mechanismofaction
  const effects = toStringList(entry.effects)
  const activeCompounds = toStringList(
    entry.activeCompounds ?? entry.active_compounds ?? entry.compounds
  )
  const contraindications = toStringList(entry.contraindications)

  const hasMechanism = isNonEmptyString(mechanism)
  const hasEffects = effects.length > 0
  const hasActiveCompounds = activeCompounds.length > 0
  const hasContraindications = contraindications.length > 0

  const presentCount = countPresent([
    hasMechanism,
    hasEffects,
    hasActiveCompounds,
    hasContraindications,
  ])

  return {
    hasMechanism,
    hasEffects,
    hasActiveCompounds,
    hasContraindications,
    effectCount: effects.length,
    activeCompoundCount: activeCompounds.length,
    contraindicationCount: contraindications.length,
    completenessScore: Math.round((presentCount / 4) * 100),
  }
}

export function getCompoundDataCompleteness(entry: Record<string, unknown>): CompoundCompleteness {
  const mechanism = entry.mechanism ?? entry.mechanismOfAction
  const effects = toStringList(entry.effects)
  const safety = toStringList(entry.contraindications ?? entry.interactions ?? entry.safety)
  const herbs = toStringList(
    entry.herbs ?? entry.associatedHerbs ?? entry.foundInHerbs ?? entry.foundIn
  )

  const hasMechanism = isNonEmptyString(mechanism)
  const hasEffects = effects.length > 0
  const hasSafety = safety.length > 0
  const hasHerbs = herbs.length > 0

  const presentCount = countPresent([hasMechanism, hasEffects, hasSafety, hasHerbs])

  return {
    hasMechanism,
    hasEffects,
    hasSafety,
    hasHerbs,
    effectCount: effects.length,
    safetyCount: safety.length,
    herbCount: herbs.length,
    completenessScore: Math.round((presentCount / 4) * 100),
  }
}

export function getDataCompleteness(
  entry: Record<string, unknown>,
  entity: 'herb'
): HerbCompleteness
export function getDataCompleteness(
  entry: Record<string, unknown>,
  entity: 'compound'
): CompoundCompleteness
export function getDataCompleteness(entry: Record<string, unknown>, entity: 'herb' | 'compound') {
  if (entity === 'compound') return getCompoundDataCompleteness(entry)
  return getHerbDataCompleteness(entry)
}
