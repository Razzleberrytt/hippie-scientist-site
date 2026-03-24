import type { InteractionSignalSource } from '@/types/interactions'

const TAG_SYNONYMS: Record<string, string> = {
  maoi: 'mao-related',
  'mao inhibitor': 'mao-related',
  'mao-a': 'mao-related',
  'mao-b': 'mao-related',
  serotonergic: 'serotonergic',
  serotonin: 'serotonergic',
  sedative: 'sedative',
  stimulant: 'stimulant',
  cardioactive: 'cardiovascular-caution',
  cardiovascular: 'cardiovascular-caution',
  hepatotoxic: 'hepatotoxicity-caution',
  hepatotoxicity: 'hepatotoxicity-caution',
}

function normalizeTag(input: string): string {
  const cleaned = input.toLowerCase().replace(/[_/]/g, '-').replace(/\s+/g, ' ').trim()
  return TAG_SYNONYMS[cleaned] ?? cleaned.replace(/\s+/g, '-')
}

export function normalizeInteractionTagVocabulary(tags: string[]): string[] {
  return Array.from(new Set(tags.map(normalizeTag).filter(Boolean)))
}

export function mergeStructuredAndInferredSignals({
  structuredTags,
  inferredTags,
}: {
  structuredTags: string[]
  inferredTags: string[]
}): {
  tags: Set<string>
  sourceByTag: Map<string, InteractionSignalSource>
} {
  const normalizedStructured = normalizeInteractionTagVocabulary(structuredTags)
  const normalizedInferred = normalizeInteractionTagVocabulary(inferredTags)

  const tags = new Set<string>()
  const sourceByTag = new Map<string, InteractionSignalSource>()

  normalizedStructured.forEach(tag => {
    tags.add(tag)
    sourceByTag.set(tag, 'structured')
  })

  normalizedInferred.forEach(tag => {
    if (!tags.has(tag)) {
      tags.add(tag)
      sourceByTag.set(tag, 'inferred')
    }
  })

  return { tags, sourceByTag }
}
