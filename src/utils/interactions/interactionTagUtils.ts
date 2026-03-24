import type { InteractionSignalSource } from '@/types/interactions'
import { CANONICAL_INTERACTION_TAGS } from '@/data/interactionTags.seed'

const CANONICAL_SET = new Set<string>(CANONICAL_INTERACTION_TAGS)

const TAG_SYNONYMS: Record<string, string> = {
  maoi: 'maoi',
  'mao-related': 'maoi',
  'mao inhibitor': 'maoi',
  'mao-a': 'maoi',
  'mao-b': 'maoi',
  serotonergic: 'serotonergic',
  serotonin: 'serotonergic',
  sedative: 'sedative',
  anxiolytic: 'sedative',
  stimulant: 'stimulant',
  cardioactive: 'cardioactive',
  cardiovascular: 'cardioactive',
  'cardiovascular-caution': 'cardioactive',
  hepatotoxic: 'hepatotoxic',
  hepatotoxicity: 'hepatotoxic',
  'hepatotoxicity-caution': 'hepatotoxic',
  psychedelic: 'psychedelic',
  gabaergic: 'gabaergic',
  cholinergic: 'cholinergic',
  'cns depressant': 'cns-depressant',
}

function normalizeTag(input: string): string {
  const cleaned = input.toLowerCase().replace(/[_/]/g, '-').replace(/\s+/g, ' ').trim()
  return TAG_SYNONYMS[cleaned] ?? cleaned.replace(/\s+/g, '-')
}

export function normalizeInteractionTagVocabulary(tags: string[]): string[] {
  return Array.from(
    new Set(
      tags
        .map(normalizeTag)
        .filter(Boolean)
        .filter(tag => CANONICAL_SET.has(tag))
    )
  )
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
