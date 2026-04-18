import { normalizeTagList } from '@/lib/tagNormalization'

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
  /\b(?:mechanism|effects?|description)\s+(?:not established|unknown|insufficient(?:\s+data)?)\b/gi,
  /\[object\s+object\]/gi,
  /\bnan\b/gi,
  /;\s*nan/gi,
  /nan\s*;/gi,
]

const JUNK_WHOLE_VALUE: RegExp[] = [
  /^[\s;,.|nan]+$/i,
  /^\.$/,
  /^[.\s]+$/,
  /^no direct/i,
  /^contextual inference/i,
  /^\[object\s+object\]$/i,
  /^placeholder$/i,
  /^tbd$/i,
  /^to be determined$/i,
  /^unknown$/i,
  /^not established$/i,
  /^insufficient data$/i,
  /^data pending$/i,
  /^n\/?a$/i,
  /^none$/i,
]

const NUMERIC_ONLY = /^\d+(?:[\s.,/-]\d+)*$/
const BROKEN_TOKEN = /^(anti|sedat|anxiol|analg|adapt|stimul|effect|effects?)$/i
const FILLER_CHIP_PATTERNS = [
  /^reported in\b/i,
  /^currently mentions\b/i,
  /^related herbs?\b/i,
  /^contextual inference\b/i,
]

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
    const trimmed = value.trim()
    if (!trimmed) return []

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        return Array.isArray(parsed) ? cleanList(parsed) : []
      } catch {
        return []
      }
    }

    const parts = value
      .split(/[\n,;|]/)
      .map(part => part.trim())
      .filter(Boolean)
    return cleanList(parts)
  }

  return []
}

function normalizeForDedup(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function ensureTerminalPunctuation(value: string): string {
  if (!value) return value
  return /[.!?]$/.test(value) ? value : `${value}.`
}

/** Remove duplicated/near-duplicated list entries and cap length when needed. */
export function uniqueNormalizedList(value: unknown, maxItems?: number): string[] {
  const unique = new Map<string, string>()

  cleanList(value).forEach(item => {
    const key = normalizeForDedup(item)
    if (!key || unique.has(key)) return
    unique.set(key, item)
  })

  const values = Array.from(unique.values())
  return typeof maxItems === 'number' ? values.slice(0, Math.max(0, maxItems)) : values
}

/** Clean malformed punctuation/spacing and remove repeated sentence fragments in prose strings. */
export function sanitizeReadableText(value: unknown): string {
  const base = cleanText(value)
  if (!base) return ''

  const normalized = base
    .replace(/\s+/g, ' ')
    .replace(/\s*([,;:.!?])\s*/g, '$1 ')
    .replace(/([,;:.!?]){2,}/g, '$1')
    .replace(/(?:\.\s*){2,}/g, '. ')
    .replace(/,\s*\./g, '. ')
    .trim()

  const sentenceParts = normalized
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean)

  const deduped = new Map<string, string>()
  sentenceParts.forEach(part => {
    const withPunctuation = ensureTerminalPunctuation(part.replace(/[.!?]+$/g, '').trim())
    const key = normalizeForDedup(withPunctuation)
    if (!key || deduped.has(key)) return
    deduped.set(key, withPunctuation)
  })

  return Array.from(deduped.values()).join(' ').trim()
}

function normalizeGuardKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/^contextual inference:\s*/i, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function looksBroken(value: string): boolean {
  const normalized = value.trim()
  if (!normalized) return true
  if (normalized.length < 4) return true
  if (BROKEN_TOKEN.test(normalized)) return true
  if (!/[a-z]/i.test(normalized)) return true
  return false
}


function shouldDropChip(value: string): boolean {
  if (looksBroken(value)) return true
  if (value.split(/\s+/).length > 3) return true
  return FILLER_CHIP_PATTERNS.some(pattern => pattern.test(value))
}

export function normalizePresentationLabel(value: unknown): string {
  const cleaned = sanitizeReadableText(value)
    .replace(/^contextual inference:\s*/i, '')
    .replace(/\(inferred from related species\)/gi, '(inferred)')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned || looksBroken(cleaned)) return ''
  return cleaned
}

export function dedupePresentationList(value: unknown, maxItems = 8): string[] {
  const seen = new Set<string>()
  const output: string[] = []
  splitClean(value)
    .map(entry => normalizePresentationLabel(entry))
    .filter(Boolean)
    .forEach(entry => {
      const key = normalizeGuardKey(entry)
      if (!key || seen.has(key)) return
      seen.add(key)
      output.push(entry)
    })
  return output.slice(0, Math.max(0, maxItems))
}

export function cleanEffectChips(value: unknown, maxItems = 5): string[] {
  const normalized = normalizeTagList(splitClean(value), {
    caseStyle: 'title',
    minLength: 4,
    maxItems: maxItems * 2,
  })

  const output = normalized.filter(entry => {
    const presentation = normalizePresentationLabel(entry)
    return Boolean(presentation) && !shouldDropChip(presentation)
  })

  return output.slice(0, Math.max(0, maxItems))
}

export function sanitizeSummaryText(value: unknown, maxSentences = 2): string {
  const cleaned = sanitizeReadableText(value)
  if (!cleaned) return ''
  const sentences = cleaned.match(/[^.!?]+[.!?]?/g) || [cleaned]
  const kept = dedupePresentationList(sentences, maxSentences)
  return kept.join(' ').trim()
}
