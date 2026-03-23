const BANNED_PHRASES = [
  'no direct effects data',
  'contextual inference',
  'no direct mechanism',
  'nan',
  '; nan',
  'no direct ',
]

const COLLAPSE_SEPARATORS = /\s*(?:[;|]+|\.{3,})\s*/g

function stripBannedPhrases(text: string): string {
  let sanitized = text
  for (const phrase of BANNED_PHRASES) {
    const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    sanitized = sanitized.replace(pattern, ' ')
  }
  return sanitized
}

export function sanitizeSurfaceText(value: unknown): string {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return ''

  const withoutBanned = stripBannedPhrases(text)
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

  return (
    input.fallback ||
    'Profile still being expanded. Review detail page for currently verified data.'
  )
}
