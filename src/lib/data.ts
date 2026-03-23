import rawHerbs from '../../public/data/herbs.json'
import rawCompounds from '../../public/data/compounds.json'
import type { Herb } from '@/types/herb'
import type { Compound } from '../types/compound'
import { asStringArray } from '@/utils/asStringArray'
import { isNonEmptyString } from '@/utils/isNonEmptyString'
import { slugify } from '@/utils/slugify'

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

function normalizeHerb(raw: unknown): Herb | null {
  const item = asRecord(raw)
  if (!item) return null

  const name = pickFirstNonEmptyString(item.name, item.common, item.commonName)
  if (!name) return null

  const slug = pickFirstNonEmptyString(item.slug) || slugify(name)
  const id = pickFirstNonEmptyString(item.id) || slug || name

  return {
    ...item,
    id,
    slug,
    name,
    common: pickFirstNonEmptyString(item.common, item.commonName),
    scientific: pickFirstNonEmptyString(item.scientific, item.scientificName, item.latin),
    category: pickFirstNonEmptyString(item.category, item.class),
    intensity: pickFirstNonEmptyString(item.intensity),
    description: pickFirstNonEmptyString(item.description, item.summary),
    mechanism: pickFirstNonEmptyString(
      item.mechanism,
      item.mechanismOfAction,
      item.mechanismofaction
    ),
    region: pickFirstNonEmptyString(item.region),
    effects: asStringArray(item.effects),
    tags: asStringArray(item.tags),
    compounds: asStringArray(item.compounds ?? item.activeCompounds ?? item.active_compounds),
    active_compounds: asStringArray(
      item.active_compounds ?? item.activeCompounds ?? item.compounds
    ),
    contraindications: asStringArray(item.contraindications),
    interactions: asStringArray(item.interactions),
    preparations: asStringArray(item.preparations),
    sources: Array.isArray(item.sources) ? item.sources : [],
  }
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

export const herbs: Herb[] = (Array.isArray(rawHerbs) ? rawHerbs : [])
  .map(normalizeHerb)
  .filter((item): item is Herb => item !== null)

export const compounds: Compound[] = (Array.isArray(rawCompounds) ? rawCompounds : [])
  .map(normalizeCompound)
  .filter((item): item is Compound => item !== null)

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
  return herbs.map(herb => toEntity(herb, 'herb')).filter((item): item is Entity => Boolean(item))
}

export async function loadCompounds() {
  return compounds
    .map(compound => toEntity(compound, 'compound'))
    .filter((item): item is Entity => Boolean(item))
}

export async function loadCounts() {
  const [loadedHerbs, loadedCompounds] = await Promise.all([loadHerbs(), loadCompounds()])
  return { herbCount: loadedHerbs.length, compoundCount: loadedCompounds.length }
}
