type RecommendationRecord = {
  href?: string
  title?: string
  score?: number
  overlap?: string[]
  rationale?: string
}

function normalize(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function dedupeSemanticRecommendations<T extends RecommendationRecord>(
  items: T[] = [],
  limit = 12
): T[] {
  const seen = new Set<string>()

  return items
    .filter(Boolean)
    .filter((item) => {
      const key = normalize(item.href || item.title)

      if (!key || seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
    .sort((a, b) => {
      const left = Number(a?.score || 0)
      const right = Number(b?.score || 0)

      if (right !== left) {
        return right - left
      }

      return normalize(a?.title).localeCompare(normalize(b?.title))
    })
    .slice(0, limit)
}
