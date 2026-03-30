/**
 * Sanitization layer for messy raw data.
 *
 * The dataset was AI-generated and contains artefacts like:
 *   "No direct effects data. Contextual inference: nan.. nan."
 *   "; nan; nan"
 *   "traditionalUse; nan; nan"
 *
 * These functions strip those artefacts so the UI never renders junk.
 * They live here — NOT in the raw data files and NOT in the type layer.
 */

const JUNK_PATTERNS: RegExp[] = [
  /no direct \w+ data[^.]*\./gi,
  /contextual inference[^.]*\./gi,
  /\[object\s+object\]/gi,
  /\bnan\b/gi,
  /;\s*nan/gi,
  /nan\s*;/gi,
]

const JUNK_WHOLE_VALUE: RegExp[] = [
  /^[\s;,.|nan]+$/i,
  /^no direct/i,
  /^contextual inference/i,
  /^\[object\s+object\]$/i,
  /^placeholder$/i,
  /^tbd$/i,
  /^to be determined$/i,
  /^unknown$/i,
  /^n\/?a$/i,
  /^none$/i,
]

const NUMERIC_ONLY = /^\d+(?:[\s.,/-]\d+)*$/

/** True if a string is entirely junk — should not be rendered at all. */
export function isJunk(value: unknown): boolean {
  if (!value) return true
  const text = String(value).trim()
  if (!text) return true
  if (NUMERIC_ONLY.test(text)) return true
  return JUNK_WHOLE_VALUE.some(pattern => pattern.test(text))
}

/** Strip junk phrases from a string, returning '' if nothing real remains. */
export function cleanText(value: unknown): string {
  if (!value) return ''
  let text = String(value).trim()
  if (!text) return ''

  for (const pattern of JUNK_PATTERNS) {
    text = text.replace(pattern, ' ')
  }

  // Collapse whitespace, trailing punctuation artefacts
  text = text
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s.;,|]+/, '')
    .replace(/[\s.;,|]+$/, '')
    .trim()

  // If after stripping there's not enough real content, discard
  if (text.length < 3) return ''
  if (NUMERIC_ONLY.test(text)) return ''
  if (JUNK_WHOLE_VALUE.some(pattern => pattern.test(text))) return ''

  return text
}

/** Filter an array, removing junk entries. */
export function cleanList(value: unknown): string[] {
  const items: string[] = []

  const visit = (v: unknown) => {
    if (Array.isArray(v)) {
      v.forEach(visit)
      return
    }
    const cleaned = cleanText(v)
    if (cleaned && !items.some(existing => existing.toLowerCase() === cleaned.toLowerCase())) {
      items.push(cleaned)
    }
  }

  visit(value)
  return items
}

/**
 * Split a delimited string into a clean list.
 * Handles arrays too — returns a deduplicated, junk-free array.
 */
export function splitClean(value: unknown): string[] {
  if (Array.isArray(value)) return cleanList(value)

  if (typeof value === 'string') {
    const parts = value
      .split(/[\n,;|]/)
      .map(part => part.trim())
      .filter(Boolean)
    return cleanList(parts)
  }

  return []
}
