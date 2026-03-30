import type { Herb } from '@/types/herb'
import type { Compound } from '../types/compound'
import { loadHerbData } from '@/lib/herb-data'
import { loadCompoundSummaryData } from '@/lib/compound-data'
import { asStringArray } from '@/utils/asStringArray'
import { isNonEmptyString } from '@/utils/isNonEmptyString'

type Intensity = 'MILD' | 'MODERATE' | 'STRONG'

export type Entity = {
  id: string
  kind: 'herb' | 'compound'
  commonName?: string
  latinName: string
  summary?: string
  description?: string
  tags?: string[]
  intensity?: Intensity
  regions?: string[]
  sources?: { title: string; url: string }[]
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function pickFirstNonEmptyString(...values: unknown[]): string {
  for (const value of values) {
    if (isNonEmptyString(value)) return value.trim()
  }
  return ''
}

function normalizeCompound(raw: unknown): Compound | null {
  const item = asRecord(raw)
  if (!item) return null

  const name = pickFirstNonEmptyString(item.name)
  if (!name) return null

  return {
    ...item,
    name,
    category: pickFirstNonEmptyString(item.category, item.type),
    mechanism: pickFirstNonEmptyString(item.mechanism, item.description),
    effects: asStringArray(item.effects),
    safety: asStringArray(item.safety ?? item.contraindications),
    herbs: asStringArray(item.herbs ?? item.foundIn),
    type: pickFirstNonEmptyString(item.type),
    foundIn: asStringArray(item.foundIn ?? item.herbs),
  }
}

function toEntity(item: unknown, kind: 'herb' | 'compound'): Entity | null {
  const record = asRecord(item)
  if (!record) return null

  const commonName = isNonEmptyString(record.commonName)
    ? record.commonName
    : isNonEmptyString(record.common)
      ? record.common
      : isNonEmptyString(record.name)
        ? record.name
        : undefined
  const latinName = isNonEmptyString(record.latinName)
    ? record.latinName
    : isNonEmptyString(record.scientific)
      ? record.scientific
      : isNonEmptyString(record.scientificName)
        ? record.scientificName
        : isNonEmptyString(commonName)
          ? commonName
          : null

  if (!latinName) return null

  const id = isNonEmptyString(record.id)
    ? record.id
    : isNonEmptyString(record.slug)
      ? record.slug
      : latinName

  const summary = isNonEmptyString(record.summary)
    ? record.summary
    : isNonEmptyString(record.description)
      ? record.description
      : undefined

  return {
    id,
    kind,
    commonName,
    latinName,
    summary,
    description: isNonEmptyString(record.description) ? record.description : undefined,
    tags: asStringArray(record.tags),
  }
}

export async function loadHerbs() {
  const canonicalHerbs = await loadHerbData()
  return canonicalHerbs
    .map(herb => toEntity(herb, 'herb'))
    .filter((item): item is Entity => Boolean(item))
}

export async function loadCompounds() {
  const summaryCompounds = await loadCompoundSummaryData()
  const compounds: Compound[] = summaryCompounds
    .map(normalizeCompound)
    .filter((item): item is Compound => item !== null)

  return compounds
    .map(compound => toEntity(compound, 'compound'))
    .filter((item): item is Entity => Boolean(item))
}

export async function loadCounts() {
  const [loadedHerbs, loadedCompounds] = await Promise.all([loadHerbs(), loadCompounds()])
  return { herbCount: loadedHerbs.length, compoundCount: loadedCompounds.length }
}
