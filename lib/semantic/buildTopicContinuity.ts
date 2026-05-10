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

export function buildTopicContinuity(record: RuntimeRecord) {
  const ecosystems = unique(asList(record?.topic_ecosystems))
  const pathways = unique(asList(record?.pathways))

  return [...ecosystems, ...pathways]
    .slice(0, 8)
    .map((label) => ({
      label,
      href: `/topics/${label
        .toLowerCase()
        .replace(/\s+/g, '-')}`,
    }))
}
