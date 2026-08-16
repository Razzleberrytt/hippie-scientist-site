export function normalizeSlug(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Backward-compatible semantic alias for callers that create a slug. */
export function slugify(value: unknown): string {
  return normalizeSlug(value)
}

/** Select the first non-empty candidate and normalize it once. */
export function canonicalSlug(...inputs: Array<string | null | undefined>): string {
  for (const input of inputs) {
    if (typeof input !== 'string' || !input.trim()) continue
    const slug = normalizeSlug(input)
    if (slug) return slug
  }
  return ''
}

export function isCanonicalSlug(input: string, canonical: string): boolean {
  return normalizeSlug(input) === normalizeSlug(canonical)
}
