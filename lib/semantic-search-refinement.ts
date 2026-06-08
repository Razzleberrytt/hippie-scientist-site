import { list, text, unique } from '@/lib/display-utils'

export function buildSemanticSearchDocument(record: Record<string, unknown>) {
  const searchable = unique([
    record?.slug,
    record?.displayName,
    record?.name,
    record?.summary,
    ...list(record?.best_for),
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(text).filter(Boolean))

  return {
    slug: record?.slug,
    title: text(record?.displayName || record?.name || record?.slug),
    searchable,
    normalized: searchable.join(' ').toLowerCase(),
  }
}

export function semanticSearch(query: string, records: Record<string, unknown>[] = [], limit = 12) {
  const normalized = text(query).toLowerCase().trim()

  return records
    .map((record) => {
      const document = buildSemanticSearchDocument(record)

      const score = document.searchable.reduce((sum, field) => {
        const value = field.toLowerCase()
        if (value === normalized) return sum + 12
        if (value.includes(normalized)) return sum + 4
        if (normalized.split(' ').some((token) => value.includes(token))) return sum + 1
        return sum
      }, 0)

      return {
        record,
        score,
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || text(a.record?.name).localeCompare(text(b.record?.name)))
    .slice(0, limit)
}
