const COLLAPSE_PUNCTUATION = /([,.;:!?]){2,}/g
const MEANINGLESS_TAG = /^(anti|effect|effects|tag|item|na|n\/a)$/i

type CaseStyle = 'title' | 'sentence' | 'none'

type NormalizeTagOptions = {
  caseStyle?: CaseStyle
  minLength?: number
  maxItems?: number
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/([\s-]+)/)
    .map(part => {
      if (/^[\s-]+$/.test(part)) return part
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join('')
}

function toSentenceCase(value: string): string {
  const normalized = value.toLowerCase()
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function flattenInput(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(item => flattenInput(item))
  if (value == null) return []
  return [String(value)]
}

function parseTagSegments(raw: string): string[] {
  const normalized = raw.trim()
  if (!normalized) return []

  const looksLikeArray = normalized.startsWith('[') && normalized.endsWith(']')
  if (looksLikeArray) {
    try {
      const parsed = JSON.parse(normalized.replace(/'/g, '"'))
      if (Array.isArray(parsed)) return parsed.flatMap(item => flattenInput(item))
    } catch {
      // Fall through to delimiter parsing for malformed workbook strings.
    }
  }

  return normalized
    .split(/[\n,;|]+/)
    .map(item => item.trim())
    .filter(Boolean)
}

function cleanTagToken(token: string): string {
  return token
    .replace(COLLAPSE_PUNCTUATION, '$1')
    .replace(/^[\s"'`,.[{(]+/, '')
    .replace(/[\s"'`,.\])}]+$/, '')
    .replace(/\.+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isRenderableTag(tag: string, minLength: number): boolean {
  if (!tag) return false
  if (tag.length < minLength) return false
  if (MEANINGLESS_TAG.test(tag)) return false
  return /[a-z]/i.test(tag)
}

function applyCaseStyle(value: string, caseStyle: CaseStyle): string {
  if (caseStyle === 'title') return toTitleCase(value)
  if (caseStyle === 'sentence') return toSentenceCase(value)
  return value
}

export function normalizeTagList(value: unknown, options: NormalizeTagOptions = {}): string[] {
  const caseStyle = options.caseStyle ?? 'title'
  const minLength = options.minLength ?? 4
  const maxItems = options.maxItems

  const unique = new Map<string, string>()

  flattenInput(value)
    .flatMap(entry => parseTagSegments(entry))
    .map(entry => cleanTagToken(entry))
    .filter(entry => isRenderableTag(entry, minLength))
    .filter(token => !token.endsWith('.'))
    .forEach(entry => {
      const cased = applyCaseStyle(entry, caseStyle)
      const key = cased.toLowerCase()
      if (!unique.has(key)) unique.set(key, cased)
    })

  const normalized = Array.from(unique.values())
  return typeof maxItems === 'number' ? normalized.slice(0, Math.max(0, maxItems)) : normalized
}
