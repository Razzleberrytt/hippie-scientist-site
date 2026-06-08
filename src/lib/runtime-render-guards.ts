export function safeArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : []
}

export function safeObject<T extends Record<string, any> = Record<string, any>>(
  value: unknown,
): T {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as T)
    : ({} as T)
}

export function safeText(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : fallback
}

export function safeNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(numeric) ? numeric : fallback
}

export function clampScore(value: unknown, fallback = 0): number {
  return Math.max(0, Math.min(100, safeNumber(value, fallback)))
}

export function hasRenderableItems(value: unknown): boolean {
  return safeArray(value).length > 0
}

export function hasRenderableText(value: unknown): boolean {
  return safeText(value).length > 0
}

export function safeSlug(value: unknown, fallback = 'discovery'): string {
  const text = safeText(value, fallback)

  return text
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback
}

export function safeCandidates(value: unknown): any[] {
  return safeArray(value).filter(
    (item) => safeText(safeObject(item).slug).length > 0,
  )
}

export function shouldRenderSemanticSection(
  source: unknown,
  candidates: unknown,
): boolean {
  return (
    safeText(safeObject(source).slug).length > 0 &&
    safeCandidates(candidates).length > 0
  )
}
