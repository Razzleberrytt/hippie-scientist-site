export function normalizeSlug(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isCanonicalSlug(input: string, canonical: string): boolean {
  return normalizeSlug(input) === normalizeSlug(canonical)
}
