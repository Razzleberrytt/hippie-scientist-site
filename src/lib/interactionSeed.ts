import {
  type SeededInteractionData,
  HERB_INTERACTION_SEED,
  COMPOUND_INTERACTION_SEED,
} from '@/data/interactionTags.seed'
import { normalizeInteractionTagVocabulary } from '@/utils/interactions/interactionTagUtils'

function normalizeKey(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function dedupeText(items: string[]): string[] {
  const seen = new Set<string>()
  const output: string[] = []
  items.forEach(item => {
    const cleaned = String(item || '').trim()
    if (!cleaned) return
    const key = cleaned.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    output.push(cleaned)
  })
  return output
}

function findSeedMatch(
  seedMap: Record<string, SeededInteractionData>,
  candidates: Array<unknown>
): SeededInteractionData | undefined {
  const keys = candidates.map(normalizeKey).filter(Boolean)
  for (const key of keys) {
    if (seedMap[key]) return seedMap[key]
  }
  return undefined
}

export function getHerbSeedInteractionData(
  raw: Record<string, unknown>
): SeededInteractionData | undefined {
  return findSeedMatch(HERB_INTERACTION_SEED, [
    raw.scientific,
    raw.scientificName,
    raw.latin,
    raw.common,
    raw.commonName,
    raw.name,
    raw.slug,
    raw.id,
  ])
}

export function getCompoundSeedInteractionData(
  raw: Record<string, unknown>
): SeededInteractionData | undefined {
  return findSeedMatch(COMPOUND_INTERACTION_SEED, [raw.name, raw.commonName, raw.slug, raw.id])
}

export function mergeInteractionData({
  rawTags,
  rawNotes,
  seed,
}: {
  rawTags: string[]
  rawNotes: string[]
  seed?: SeededInteractionData
}): { interactionTags: string[]; interactionNotes: string[] } {
  const interactionTags = normalizeInteractionTagVocabulary([
    ...rawTags,
    ...(seed?.interactionTags ?? []),
  ])
  const interactionNotes = dedupeText([...rawNotes, ...(seed?.interactionNotes ?? [])])
  return { interactionTags, interactionNotes }
}
