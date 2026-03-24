/**
 * Normalizes a string to a consistent lookup token.
 * Used for fuzzy-matching herb/compound names from URL params and prebuilt combos.
 */
export function normalizeLookupToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
