import { text } from '@/lib/display-utils'

const WEAK_EXACT_VALUES = new Set([
  'unknown',
  'n/a',
  'na',
  'none',
  'null',
  'undefined',
  'tbd',
  'todo',
  'placeholder',
  'not available',
  'not applicable',
  'not yet available',
  'no data',
  'no evidence',
  'strong',
  'moderate',
  'weak',
  'limited',
  'low',
  'high',
  'c',
])

const WEAK_PATTERNS = [
  /malformed semantic/i,
  /semantic leftovers?/i,
  /placeholder/i,
  /schema artifact/i,
  /workbook readiness pass/i,
  /sci\s*space evidence pass/i,
  /mechanism[-\s]*only pending/i,
  /research[_\s-]*only/i,
  /internal cross[-\s]*linking/i,
  /treat dosing and outcomes as review[-\s]*gated/i,
  /added as site[-\s]*safe referenced entity/i,
  /conservative evidence framing/i,
  /source backed preparation/i,
  /bulk (?:mode|enrichment|ingested)/i,
  /lean (?:herb |monograph )?row/i,
  /tracked for/i,
  /^(?:grade|tier|score|confidence)\s*[:=-]?\s*[a-f][+-]?$/i,
  /^[a-f][+-]?\s*(?:grade|tier|score|confidence)$/i,
]

function normalizedKey(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasRepeatedSeparatorJunk(value: string) {
  return /(?:[-–—_|/:;,]\s*){3,}/.test(value) || /^(?:[-–—_|/:;,.*#]+\s*)+$/.test(value)
}

function hasAccidentalDuplicatePhrase(value: string) {
  const normalized = normalizedKey(value)
  const words = normalized.split(' ').filter(Boolean)

  if (words.length < 2 || words.length > 12 || words.length % 2 !== 0) {
    return false
  }

  const midpoint = words.length / 2
  return words.slice(0, midpoint).join(' ') === words.slice(midpoint).join(' ')
}

export function isWeakSemanticValue(value: unknown): boolean {
  const cleaned = cleanEditorialText(value)

  if (!cleaned) return true
  if (cleaned.length === 1) return true
  if (hasRepeatedSeparatorJunk(cleaned)) return true

  const key = normalizedKey(cleaned)

  if (!key) return true
  if (WEAK_EXACT_VALUES.has(key)) return true
  if (/^[a-z]$/.test(key)) return true
  if (/^(?:unknown|none|null|undefined|n\/?a|tbd)(?:\s+|$)/i.test(cleaned)) return true
  if (WEAK_PATTERNS.some((pattern) => pattern.test(cleaned))) return true
  if (hasAccidentalDuplicatePhrase(cleaned)) return true

  return false
}

export function isRenderableText(value: unknown): boolean {
  return !isWeakSemanticValue(value)
}

export function cleanEditorialText(value: unknown): string {
  const raw = text(value)

  if (!raw) return ''

  return raw
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0)
      return code < 32 || code === 127 ? ' ' : char
    })
    .join('')
    .replace(/[_]+/g, ' ')
    .replace(/\s*([|/•])\s*(?:\1\s*)+/g, ' $1 ')
    .replace(/\s*([-–—])\s*(?:[-–—]\s*)+/g, ' — ')
    .replace(/([!?.,;:])\1{1,}/g, '$1')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([([{"'])\s+/g, '$1')
    .replace(/\s+([)\]}"'])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function dedupeEditorialItems(items: unknown[], limit = 6): string[] {
  const seen = new Set<string>()
  const clean: string[] = []

  for (const item of items) {
    const value = cleanEditorialText(item)
    const key = normalizedKey(value)

    if (!value || isWeakSemanticValue(value) || !key || seen.has(key)) {
      continue
    }

    seen.add(key)
    clean.push(value)

    if (clean.length >= limit) break
  }

  return clean
}

export function isDuplicateTitleBody(title: string, body: string): boolean {
  const normalizedTitle = normalizedKey(cleanEditorialText(title))
  const normalizedBody = normalizedKey(cleanEditorialText(body))

  return Boolean(normalizedTitle && normalizedBody && normalizedTitle === normalizedBody)
}

export function shouldRenderCard(title: unknown, body?: unknown): boolean {
  const cleanTitle = cleanEditorialText(title)
  const cleanBody = cleanEditorialText(body)

  if (!isRenderableText(cleanTitle)) return false
  if (body === undefined || body === null) return true
  if (!cleanBody) return true
  if (isDuplicateTitleBody(cleanTitle, cleanBody) && isWeakSemanticValue(cleanTitle)) return false

  return true
}
