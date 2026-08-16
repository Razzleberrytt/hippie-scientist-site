/** Canonical normalization primitives for entity names and slugs. */

const QUOTES = /[’'"“”`]/g

export function slugifyEntityName(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(QUOTES, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeEntityName(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(QUOTES, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stripParentheticalName(value) {
  return String(value ?? '').replace(/\s*\([^)]+\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

export function extractParentheticalNames(value) {
  return [...String(value ?? '').matchAll(/\(([^)]+)\)/g)]
    .map((match) => match[1].trim())
    .filter(Boolean)
}

export function stripBracketedIdentityNotes(value) {
  return String(value ?? '').replace(/\s*[([].*?[\])]\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

export function extractBracketedIdentityNames(value) {
  return [...String(value ?? '').matchAll(/[([](.*?)[\])]/g)]
    .map((match) => match[1].trim())
    .filter((name) => name.length > 2)
}

export function levenshteinDistance(left, right) {
  const a = String(left ?? '')
  const b = String(right ?? '')
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
    }
  }
  return matrix[a.length][b.length]
}
