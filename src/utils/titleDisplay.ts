const TITLE_TOKEN_SPLIT = /([\s,/()[\]-]+)/

function splitTitleTokens(name: string): string[] {
  return name.split(TITLE_TOKEN_SPLIT).filter(Boolean)
}

/**
 * Returns a card-safe display title while preserving canonical record names in data.
 * Keeps a short semantic prefix and appends an ellipsis when truncating.
 */
export function formatBrowseTitle(name: string, maxLength = 60): string {
  const normalized = String(name || '').replace(/\s+/g, ' ').trim()
  if (!normalized || normalized.length <= maxLength) return normalized

  const hardLimit = Math.max(24, maxLength - 1)
  const minKeep = Math.floor(maxLength * 0.55)
  const tokens = splitTitleTokens(normalized)

  let candidate = ''
  for (const token of tokens) {
    const next = `${candidate}${token}`
    if (next.length > hardLimit) break
    candidate = next
  }

  let trimmed = candidate.trim()
  if (!trimmed || trimmed.length < minKeep) {
    trimmed = normalized.slice(0, hardLimit).trimEnd()
  }

  trimmed = trimmed.replace(/[\s,;:/-]+$/g, '').trim()
  return `${trimmed}…`
}
