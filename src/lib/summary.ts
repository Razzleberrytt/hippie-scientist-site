const BANNED_PHRASES = [
  'no direct effects data',
  'contextual inference',
  'no direct mechanism',
  'nan',
  '; nan',
  'no direct ',
  'lean monograph',
  'bulk mode',
  'internal cross-linking',
  'centers on the unspecified',
]

const SYSTEM_LANGUAGE_PATTERNS = [
  /lean monograph[^.]*\.?/gi,
  /[^.]*bulk mode[^.]*\.?/gi,
  /[^.]*internal cross-linking[^.]*\.?/gi,
  /[^.]*centers on the unspecified[^.]*\.?/gi,
]

const COLLAPSE_SEPARATORS = /\s*(?:[;|]+|\.{3,})\s*/g
const USER_FACING_FALLBACK = 'Traditionally used in herbal practice with emerging scientific interest.'

function stripBannedPhrases(text: string): string {
  let sanitized = text
  for (const pattern of SYSTEM_LANGUAGE_PATTERNS) {
    sanitized = sanitized.replace(pattern, ' ')
  }
  for (const phrase of BANNED_PHRASES) {
    const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    sanitized = sanitized.replace(pattern, ' ')
  }
  return sanitized
}

function dedupeSentences(text: string): string {
  const seen = new Set<string>()
  return text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean)
    .filter(sentence => {
      const key = sentence.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .join(' ')
}

export function sanitizeSurfaceText(value: unknown): string {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return ''

  const withoutBanned = dedupeSentences(stripBannedPhrases(text))
    .replace(COLLAPSE_SEPARATORS, '. ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([.])\1+/g, '$1')
    .trim()

  return withoutBanned
}

export function hasPlaceholderText(value: unknown): boolean {
  const text = String(value || '').toLowerCase()
  if (!text) return false
  return BANNED_PHRASES.some(phrase => text.includes(phrase))
}

export function normalizeCardSummary(value: unknown, options?: { summaryQuality?: string; maxLen?: number }): string {
  const maxLen = options?.maxLen ?? 120
  const summaryQuality = String(options?.summaryQuality || '').toLowerCase()
  const cleaned = sanitizeSurfaceText(value)
  const weak = summaryQuality === 'weak' || summaryQuality === 'none' || summaryQuality === 'minimal'

  if (weak || !cleaned || hasPlaceholderText(value) || hasPlaceholderText(cleaned)) return USER_FACING_FALLBACK
  return shorten(cleaned, maxLen)
}

function shorten(text: string, maxLen = 150) {
  if (text.length <= maxLen) return text
  return `${text.slice(0, maxLen - 1).trimEnd()}…`
}

function listText(value: unknown): string {
  if (Array.isArray(value))
    return value
      .map(v => sanitizeSurfaceText(v))
      .filter(Boolean)
      .join(', ')
  return sanitizeSurfaceText(value)
}

export function buildCardSummary(input: {
  effects?: unknown
  mechanism?: unknown
  description?: unknown
  activeCompounds?: unknown
  therapeuticUses?: unknown
  fallback?: string
  maxLen?: number
}): string {
  const candidates = [
    listText(input.effects),
    sanitizeSurfaceText(input.mechanism),
    sanitizeSurfaceText(input.description),
    listText(input.activeCompounds),
    listText(input.therapeuticUses),
  ]

  const best = candidates.find(candidate => candidate && candidate.length >= 24)
  if (best) return shorten(best, input.maxLen)

  const firstUsable = candidates.find(Boolean)
  if (firstUsable) return shorten(firstUsable, input.maxLen)

  return input.fallback || USER_FACING_FALLBACK
}
