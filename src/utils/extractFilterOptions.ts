import type { Herb } from '@/types'
import type { CompoundSummaryRecord } from '@/lib/compound-data'
import { normalizeText } from './normalizeText'
import { asStringArray } from './asStringArray'
import { isNonEmptyString } from './isNonEmptyString'

const IGNORED_EFFECT_TAGS = new Set(['psychoactive', 'effects', 'herb', 'compound'])

function splitList(value: unknown): string[] {
  if (Array.isArray(value)) return asStringArray(value)
  if (!isNonEmptyString(value)) return []
  return value
    .split(/[\n;,|]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function toCleanUnique(values: string[]) {
  const seen = new Map<string, string>()

  values.forEach(value => {
    const trimmed = value.trim()
    if (!trimmed) return

    const key = normalizeText(trimmed)
    if (!key || IGNORED_EFFECT_TAGS.has(key)) return
    if (!seen.has(key)) seen.set(key, trimmed)
  })

  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b))
}

export function extractFilterOptions(input: { herbs?: Herb[]; compounds?: CompoundSummaryRecord[] }): {
  effects: string[]
  classes: string[]
  categories: string[]
} {
  const herbEffects = (input.herbs || []).flatMap(herb => splitList(herb.effects))
  const compoundEffects = (input.compounds || []).flatMap(compound => splitList(compound.effects))

  const classes = (input.herbs || [])
    .map(herb => String((herb as Record<string, unknown>).class || herb.category || '').trim())
    .filter(Boolean)

  const categories = (input.compounds || [])
    .map(compound => String((compound.category || compound.className || '').trim()))
    .filter(Boolean)

  return {
    effects: toCleanUnique([...herbEffects, ...compoundEffects]),
    classes: toCleanUnique(classes),
    categories: toCleanUnique(categories),
  }
}
