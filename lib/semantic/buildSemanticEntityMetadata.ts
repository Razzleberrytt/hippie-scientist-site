import { cleanEditorialText, dedupeEditorialItems } from '@/lib/editorial-rendering'

type RuntimeRecord = Record<string, any>

function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    return value.split(/,|;|\|/)
  }

  return []
}

export function buildSemanticEntityMetadata(record: RuntimeRecord) {
  return {
    title: cleanEditorialText(record?.name || record?.title || record?.slug) || 'Profile',

    semanticEffects: dedupeEditorialItems(asList(record?.primary_effects), 8),

    semanticMechanisms: dedupeEditorialItems(asList(record?.mechanisms), 8),

    semanticPathways: dedupeEditorialItems(asList(record?.pathways), 8),

    semanticEcosystems: dedupeEditorialItems(asList(record?.topic_ecosystems), 8),

    semanticComparisons: dedupeEditorialItems(asList(record?.comparison_groups), 8),

    semanticStacks: dedupeEditorialItems(asList(record?.stack_synergies), 8),
  }
}
