import { dedupeEditorialItems, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'
type RuntimeRecord = Record<string, any>

function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return dedupeEditorialItems(value)
  }

  if (typeof value === 'string') {
    return dedupeEditorialItems(value.split(/,|;|\|/))
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

  return tags.slice(0, 6).filter(isRenderableText).map((tag) => ({
    href: `/protocols/${tag
      .toLowerCase()
      .replace(/\s+/g, '-')}`,
    title: `${tag} Protocol`,
    summary:
      'Evidence-aware protocol exploration generated from semantic ecosystem overlap and pathway continuity.',
    tags: [tag],
  })).filter((item) => shouldRenderCard(item.title, item.summary))
}
