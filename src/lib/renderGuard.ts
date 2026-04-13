import { dedupePresentationList, normalizePresentationLabel, sanitizeReadableText, splitClean } from '@/lib/sanitize'

type UniqueCopyInput = {
  hero?: unknown
  overview?: unknown
  context?: unknown
  mechanism?: unknown
}

type UniqueCopyOutput = {
  hero: string
  overview: string
  context: string
  mechanism: string
}

function normalizeMeaningKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}'"`]/g, ' ')
    .replace(/\b(?:the|a|an|and|or|for|of|to|with|from|in|on|by|it|this|that)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripChipTrailingPunctuation(value: string): string {
  return value.replace(/[\s.,;:!?-]+$/g, '').trim()
}

function isBrokenFragment(value: string): boolean {
  if (!value) return true
  if (value.length < 3) return true
  if (!/[a-z]/i.test(value)) return true
  if (/^[^a-z]+$/i.test(value)) return true
  if (/^(effect|effects|mechanism|overview|context)$/i.test(value)) return true
  return false
}

/**
 * Shared render guard for list-like UI values.
 * - Splits string/array content
 * - Removes broken fragments
 * - Deduplicates near-identical entries
 */
export function sanitizeRenderList(value: unknown, maxItems = 8): string[] {
  return dedupePresentationList(splitClean(value), maxItems).filter(item => !isBrokenFragment(item))
}

/**
 * Shared guard for pill/chip content.
 * - Reuses list sanitization
 * - Strips trailing punctuation artefacts ("focus..." => "focus")
 */
export function sanitizeRenderChips(value: unknown, maxItems = 8): string[] {
  const seen = new Set<string>()
  const output: string[] = []

  sanitizeRenderList(value, maxItems * 2).forEach(item => {
    const normalized = normalizePresentationLabel(stripChipTrailingPunctuation(item))
    const key = normalizeMeaningKey(normalized)
    if (!normalized || isBrokenFragment(normalized) || !key || seen.has(key)) return
    seen.add(key)
    output.push(normalized)
  })

  return output.slice(0, Math.max(0, maxItems))
}

/**
 * Ensures hero/overview/context/mechanism each keep a distinct purpose.
 * Duplicate meaning is collapsed to the earliest section priority:
 * hero -> overview -> context -> mechanism.
 */
export function buildUniqueDetailCopy(input: UniqueCopyInput): UniqueCopyOutput {
  const ordered: Array<keyof UniqueCopyOutput> = ['hero', 'overview', 'context', 'mechanism']
  const cleaned: UniqueCopyOutput = {
    hero: sanitizeReadableText(input.hero),
    overview: sanitizeReadableText(input.overview),
    context: sanitizeReadableText(input.context),
    mechanism: sanitizeReadableText(input.mechanism),
  }

  const acceptedKeys = new Set<string>()
  ordered.forEach(sectionKey => {
    const value = cleaned[sectionKey]
    if (!value) return
    const meaning = normalizeMeaningKey(value)
    if (!meaning || acceptedKeys.has(meaning)) {
      cleaned[sectionKey] = ''
      return
    }
    acceptedKeys.add(meaning)
  })

  return cleaned
}
