export function safeTrim(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

export function safeLower(value: unknown): string {
  return safeTrim(value).toLowerCase()
}

export function safeIncludes(value: unknown, search: unknown): boolean {
  const haystack = safeLower(value)
  const needle = safeLower(search)
  if (!haystack || !needle) return false
  return haystack.includes(needle)
}

export function safeArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value === null || value === undefined) return []
  return [value as T]
}

export function safeObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

export function safeJoin(value: unknown, separator = ' '): string {
  return safeArray(value)
    .map((item) => safeTrim(item))
    .filter(Boolean)
    .join(separator)
}

export function safeSlug(value: unknown): string {
  return safeTrim(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function safeNumber(value: unknown, fallback = 0): number {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function safeScore(value: unknown, fallback = 0): number {
  const score = safeNumber(value, fallback)
  return Number.isFinite(score) ? score : fallback
}

export function normalizeSearchToken(value: unknown): string {
  return safeTrim(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeSearchTokens(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : safeTrim(value).split(/[\s,;|/]+/)

  const seen = new Set<string>()

  return raw
    .map(normalizeSearchToken)
    .filter(Boolean)
    .filter((token) => {
      if (seen.has(token)) return false
      seen.add(token)
      return true
    })
}

export function safeRelatedList(value: unknown): string[] {
  const seen = new Set<string>()

  return safeArray(value)
    .flatMap((item) => {
      if (Array.isArray(item)) return item
      return safeTrim(item).split(/[\n,;|]+/)
    })
    .map(safeSlug)
    .filter(Boolean)
    .filter((slug) => {
      if (seen.has(slug)) return false
      seen.add(slug)
      return true
    })
}
