const PLACEHOLDER_PATTERNS = [
  /still being (researched|verified|expanded)/i,
  /profile still being expanded/i,
  /data is still being verified/i,
  /limited verified data/i,
  /no direct (effects|mechanism)/i,
  /contextual inference/i,
  /\bn\/a\b/i,
  /^\s*(unknown|tbd|na|n\.a\.)\s*$/i,
]

const FRAGMENT_PATTERNS = [/^[^a-zA-Z]*$/, /^\d+(?:[\d\s.,-])*$/, /^[a-zA-Z]{1,2}$/]

const AUTHORITY_SUFFIX_PATTERN =
  /\b(?:l\.?|linn\.?|willd\.?|dc\.?|benth\.?|mill\.?|lam\.?|gaertn\.?|auct\.?|sp\.?|spp\.?)\b/gi

const COMMON_STOP_WORDS = new Set(['the', 'and', 'of', 'extract', 'compound', 'herb'])

export type BrowseQualityAssessment = {
  hide: boolean
  demote: boolean
  dedupeKey: string
  qualityScore: number
  reasons: string[]
}

function cleanText(value: unknown): string {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasPlaceholderOnly(text: string): boolean {
  if (!text) return true
  const normalized = text.toLowerCase()
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(normalized))
}

function hasMalformedName(name: string): boolean {
  if (!name) return true
  if (name.length < 3) return true
  return FRAGMENT_PATTERNS.some(pattern => pattern.test(name))
}

function isUltraLongChemicalName(name: string): boolean {
  if (name.length >= 72) return true
  const punctuationHeavy = (name.match(/[(),-]/g) || []).length >= 8
  const tokenCount = name.split(/\s+/).filter(Boolean).length
  return punctuationHeavy && tokenCount >= 8
}

function buildDedupeKey(name: string): string {
  const normalized = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(AUTHORITY_SUFFIX_PATTERN, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const compact = normalized
    .split(/[\s-]+/)
    .filter(token => token && !COMMON_STOP_WORDS.has(token))
    .slice(0, 4)

  return compact.join(' ')
}

function computeStrength(input: {
  summary: string
  description: string
  mechanism: string
  effectsCount: number
  sourceCount: number
  hasEvidence: boolean
}): number {
  let score = 0
  if (input.summary.length >= 40 && !hasPlaceholderOnly(input.summary)) score += 2
  if (input.description.length >= 40) score += 1
  if (input.mechanism.length >= 24) score += 1
  if (input.effectsCount >= 2) score += 1
  if (input.sourceCount >= 2) score += 1
  if (input.hasEvidence) score += 1
  return score
}

export function assessBrowseRecord(input: {
  name: unknown
  summary: unknown
  description?: unknown
  mechanism?: unknown
  effects?: unknown[]
  sourceCount?: unknown
  hasEvidence?: unknown
}): BrowseQualityAssessment {
  const name = cleanText(input.name)
  const summary = cleanText(input.summary)
  const description = cleanText(input.description)
  const mechanism = cleanText(input.mechanism)
  const effectsCount = Array.isArray(input.effects) ? input.effects.filter(Boolean).length : 0
  const sourceCount = Number(input.sourceCount) || 0
  const hasEvidence = Boolean(input.hasEvidence)
  const qualityScore = computeStrength({
    summary,
    description,
    mechanism,
    effectsCount,
    sourceCount,
    hasEvidence,
  })

  const reasons: string[] = []

  if (hasMalformedName(name)) reasons.push('malformed_name')
  if (hasPlaceholderOnly(summary) && qualityScore < 3) reasons.push('placeholder_summary')
  if (summary.length > 0 && summary.length < 24 && qualityScore < 3) reasons.push('weak_summary')
  if (!summary && qualityScore < 2) reasons.push('missing_summary')

  const longChemicalName = isUltraLongChemicalName(name)
  if (longChemicalName && qualityScore < 2) reasons.push('long_name_low_metadata')

  return {
    hide: reasons.length > 0,
    demote: longChemicalName || (summary.length > 0 && summary.length < 40),
    dedupeKey: buildDedupeKey(name),
    qualityScore,
    reasons,
  }
}

export function applyBrowseQualityGate<T>(
  items: T[],
  assess: (item: T) => BrowseQualityAssessment,
): {
  items: T[]
  assessments: Map<T, BrowseQualityAssessment>
  hiddenCount: number
  dedupedCount: number
  demotedCount: number
} {
  const assessments = new Map<T, BrowseQualityAssessment>()
  const survivors: T[] = []
  let hiddenCount = 0

  for (const item of items) {
    const assessment = assess(item)
    assessments.set(item, assessment)
    if (assessment.hide) {
      hiddenCount += 1
      continue
    }
    survivors.push(item)
  }

  const deduped = new Map<string, T>()
  let dedupedCount = 0

  for (const item of survivors) {
    const assessment = assessments.get(item)
    if (!assessment) continue
    const key = assessment.dedupeKey
    if (!key) {
      deduped.set(`__${deduped.size}`, item)
      continue
    }

    const existing = deduped.get(key)
    if (!existing) {
      deduped.set(key, item)
      continue
    }

    const currentScore = assessments.get(existing)?.qualityScore ?? 0
    if (assessment.qualityScore > currentScore) {
      deduped.set(key, item)
    }
    dedupedCount += 1
  }

  const dedupedItems = Array.from(deduped.values())
  const demotedCount = dedupedItems.reduce(
    (count, item) => count + (assessments.get(item)?.demote ? 1 : 0),
    0,
  )

  return {
    items: dedupedItems,
    assessments,
    hiddenCount,
    dedupedCount,
    demotedCount,
  }
}
