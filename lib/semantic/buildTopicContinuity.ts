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

export function buildTopicContinuity(record: RuntimeRecord) {
  const ecosystems = unique(asList(record?.topic_ecosystems))
  const pathways = unique(asList(record?.pathways))

  return [...ecosystems, ...pathways]
    .filter(isRenderableText)
    .slice(0, 8)
    .map((label) => ({
      label,
      href: `/topics/${label
        .toLowerCase()
        .replace(/\s+/g, '-')}`,
    }))
    .filter((item) => shouldRenderCard(item.label))
}
