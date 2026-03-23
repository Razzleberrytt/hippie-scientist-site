import herbsData from '../../public/data/herbs.json'
import compoundsData from '../../public/data/compounds.json'
import type { Herb } from '../types/herb'
import type { Compound } from '../types/compound'
import { asStringArray } from '@/utils/asStringArray'
import { isNonEmptyString } from '@/utils/isNonEmptyString'

export const herbs: Herb[] = herbsData as unknown as Herb[]
export const compounds: Compound[] = compoundsData as unknown as Compound[]

export type Intensity = 'MILD' | 'MODERATE' | 'STRONG'
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

function toEntity(item: Record<string, unknown>, kind: 'herb' | 'compound'): Entity | null {
  const commonName = isNonEmptyString(item.commonName)
    ? item.commonName
    : isNonEmptyString(item.common)
      ? item.common
      : isNonEmptyString(item.name)
        ? item.name
        : undefined
  const latinName = isNonEmptyString(item.latinName)
    ? item.latinName
    : isNonEmptyString(item.scientific)
      ? item.scientific
      : isNonEmptyString(item.scientificName)
        ? item.scientificName
        : isNonEmptyString(commonName)
          ? commonName
          : null

  if (!latinName) return null

  const id = isNonEmptyString(item.id)
    ? item.id
    : isNonEmptyString(item.slug)
      ? item.slug
      : latinName

  const summary = isNonEmptyString(item.summary)
    ? item.summary
    : isNonEmptyString(item.description)
      ? item.description
      : undefined

  return {
    id,
    kind,
    commonName,
    latinName,
    summary,
    description: isNonEmptyString(item.description) ? item.description : undefined,
    tags: asStringArray(item.tags),
  }
}

export async function loadHerbs() {
  return herbs
    .map(herb => toEntity(herb as Record<string, unknown>, 'herb'))
    .filter((item): item is Entity => Boolean(item))
}

export async function loadCompounds() {
  return compounds
    .map(compound => toEntity(compound as Record<string, unknown>, 'compound'))
    .filter((item): item is Entity => Boolean(item))
}

export async function loadCounts() {
  const [loadedHerbs, loadedCompounds] = await Promise.all([loadHerbs(), loadCompounds()])
  return { herbCount: loadedHerbs.length, compoundCount: loadedCompounds.length }
}
