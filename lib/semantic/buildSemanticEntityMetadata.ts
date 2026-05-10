type RuntimeRecord = Record<string, any>

function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v ?? '').trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  }

  return []
}

function unique(values: string[]) {
  return [...new Set(values)]
}

export function buildSemanticEntityMetadata(record: RuntimeRecord) {
  return {
    title: record?.name || record?.title || record?.slug || 'Profile',

    semanticEffects: unique(asList(record?.primary_effects)).slice(0, 8),

    semanticMechanisms: unique(asList(record?.mechanisms)).slice(0, 8),

    semanticPathways: unique(asList(record?.pathways)).slice(0, 8),

    semanticEcosystems: unique(asList(record?.topic_ecosystems)).slice(0, 8),

    semanticComparisons: unique(asList(record?.comparison_groups)).slice(0, 8),

    semanticStacks: unique(asList(record?.stack_synergies)).slice(0, 8),
  }
}
