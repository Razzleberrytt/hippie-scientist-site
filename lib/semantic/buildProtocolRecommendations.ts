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

function buildTags(record: RuntimeRecord) {
  return unique([
    ...asList(record?.primary_effects),
    ...asList(record?.topic_ecosystems),
    ...asList(record?.pathways),
  ])
}

export function buildProtocolRecommendations(record: RuntimeRecord) {
  const tags = buildTags(record)

  return tags.slice(0, 6).map((tag) => ({
    href: `/protocols/${tag
      .toLowerCase()
      .replace(/\s+/g, '-')}`,
    title: `${tag} Protocol`,
    summary:
      'Evidence-aware protocol exploration generated from semantic ecosystem overlap and pathway continuity.',
    tags: [tag],
  }))
}
