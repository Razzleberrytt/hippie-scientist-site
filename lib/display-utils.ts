const INTERNAL_PATTERNS = [
  /research[_\s-]*only/i,
  /lean\s+row/i,
  /lean\s+monograph\s+row/i,
  /bulk\s+mode/i,
  /bulk\s+enrichment/i,
  /enriched\s+in\s+bulk\s+mode/i,
  /schema\s+artifact/i,
  /placeholder/i,
  /internal\s+cross-linking\s+supports/i,
  /treat dosing and outcomes as review-gated/i,
  /scispace evidence pass/i,
  /added as site-safe referenced entity during workbook readiness pass/i,
  /^n\/?a$/i,
  /^unknown$/i,
  /^tbd$/i,
  /^none$/i,
]

const LABEL_MAP: Record<string, string> = {
  healthy_aging: 'Healthy aging',
  fat_loss: 'Fat loss',
  stress_mood: 'Stress & mood',
  sleep_quality: 'Sleep quality',
  general_wellness: 'General wellness',
}

export function text(value: unknown): string {
  if (value === null || value === undefined) return ''

  if (Array.isArray(value)) {
    return value.map(text).filter(Boolean).join(', ')
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>

    return text(
      record.label ??
      record.name ??
      record.title ??
      record.text ??
      record.value ??
      record.description
    )
  }

  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function hideInternalValue(value: unknown): boolean {
  const normalized = text(value)

  if (!normalized) return true

  return INTERNAL_PATTERNS.some(pattern => pattern.test(normalized))
}

export function isClean(value: unknown): boolean {
  return !hideInternalValue(value)
}

export function formatDisplayLabel(value: unknown): string {
  const raw = text(value)
  if (!raw) return ''

  const normalized = raw.toLowerCase().trim()

  if (normalized === 'research only') return ''

  if (LABEL_MAP[normalized]) {
    return LABEL_MAP[normalized]
  }

  return raw
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())
}

export function labelize(value: unknown, fallback = 'Review'): string {
  const clean = formatDisplayLabel(value)

  if (!isClean(clean)) return fallback

  return clean || fallback
}

export function list(value: unknown): string[] {
  if (value === null || value === undefined) return []

  const raw = Array.isArray(value)
    ? value
    : String(value).split(/\n|;|\|/)

  return raw
    .flatMap(item => text(item).split(/,(?=\s*[a-zA-Z])/))
    .map(item => formatDisplayLabel(item.replace(/^[-*•]\s*/, '').trim()))
    .filter(isClean)
}

export function unique(items: string[]) {
  const seen = new Set<string>()

  return items.filter(item => {
    const key = item.toLowerCase()

    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

export function cleanSummary(value: unknown, type: 'herb' | 'compound' = 'compound') {
  const summary = text(value)

  if (isClean(summary)) return summary

  if (type === 'herb') {
    return 'Evidence-aware botanical profile with mechanism, safety, and practical context.'
  }

  return 'Evidence-aware compound profile with mechanism, safety, and practical context.'
}
