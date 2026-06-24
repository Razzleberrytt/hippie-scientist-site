function toText(value: unknown): string {
  return String(value ?? '').trim()
}

function hasPlaceholderText(value: unknown): boolean {
  const text = toText(value).toLowerCase()
  if (!text) return false
  if (text === 'nan') return true
  return text.includes('no direct effects data') || text.includes('contextual inference')
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap(item => toStringList(item))
      .map(item => item.trim())
      .filter(Boolean)
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>

    if (typeof record.title === 'string' || typeof record.url === 'string') {
      const parts = [toText(record.title), toText(record.url), toText(record.note)].filter(Boolean)
      return parts.length > 0 ? [parts.join(' ')] : []
    }

    return Object.values(record)
      .flatMap(item => toStringList(item))
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,;|]+/g)
      .map(item => item.trim())
      .filter(Boolean)
  }

  return []
}

function countReferences(value: unknown, fallback?: unknown): number {
  const fromList = toStringList(value).filter(item => !hasPlaceholderText(item))
  if (fromList.length > 0) return fromList.length

  const fallbackNumber = Number(fallback)
  if (Number.isFinite(fallbackNumber) && fallbackNumber > 0) {
    return Math.round(fallbackNumber)
  }

  return 0
}

function hasReviewedFlag(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false

  const record = value as Record<string, unknown>
  const reviewedSignals = [
    record.reviewed,
    record.reviewedAt,
    record.lastReviewedAt,
    record.enrichedAndReviewed,
    record.publishable,
  ]

  return reviewedSignals.some(signal => {
    if (typeof signal === 'boolean') return signal
    if (typeof signal === 'string') return Boolean(signal.trim())
    return false
  })
}

export type PublishQualityInput = {
  title?: unknown
  name?: unknown
  summary?: unknown
  description?: unknown
  sources?: unknown
  sourceCount?: unknown
  reviewed?: unknown
  reviewedMeta?: unknown
  safety?: unknown
  contraindications?: unknown
  interactions?: unknown
}

export function isPublishQualityDetailPage(input: PublishQualityInput): boolean {
  const nameOrTitle = toText(input.title || input.name)
  if (!nameOrTitle || hasPlaceholderText(nameOrTitle)) return false

  const contentFields = [input.summary, input.description]
  if (contentFields.some(hasPlaceholderText)) return false

  const sourceCount = countReferences(input.sources, input.sourceCount)
  const reviewed =
    hasReviewedFlag(input.reviewed) ||
    hasReviewedFlag(input.reviewedMeta)

  if (sourceCount < 2 && !reviewed) return false

  const safetyFields = [input.safety, input.contraindications, input.interactions]
  const hasAnySafetyField = safetyFields.some(value => {
    if (value == null) return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0
    return toText(value).length > 0
  })

  if (!hasAnySafetyField) return true

  const hasSafetyContent = safetyFields
    .flatMap(value => toStringList(value))
    .some(entry => !hasPlaceholderText(entry))

  return hasSafetyContent
}
