const INTERNAL_PATTERNS = [
  /research[_\s-]*only/i,
  /lean\s+(?:(?:herb|monograph)\s+)?row/i,
  /high\s+speed\s+phytochemical\s+ingestion/i,
  /(?:^|\b)(?:is\s+)?tracked\s+for\b/i,
  /conservative\s+evidence\s+framing/i,
  /keep\s+claims\s+tied/i,
  /source\s+backed\s+preparation\s+and\s+safety\s+context/i,
  /bulk\s+ingested\s+support\s+row/i,
  /bulk\s+(?:mode|enrichment)/i,
  /sci\s*space\s+evidence\s+pass/i,
  /scispace\s+evidence\s+pass/i,
  /mechanism[-\s]*only\s+pending\s+stronger\s+human/i,
  /pmid[-\s]*backed\s+human\s+evidence\s+is\s+present/i,
  /minimum\s+source\s+backed\s+intake/i,
  /workbook\s+readiness\s+pass/i,
  /enriched\s+in\s+bulk\s+mode/i,
  /schema\s+artifact/i,
  /placeholder/i,
  /internal\s+cross[-\s]*linking(?:\s+supports)?/i,
  /treat\s+dosing\s+and\s+outcomes\s+as\s+review[-\s]*gated/i,
  /added\s+as\s+site[-\s]*safe\s+referenced\s+entity\s+during\s+workbook\s+readiness\s+pass/i,
  /^n\/?a$/i,
  /^unknown$/i,
  /^tbd$/i,
  /^none$/i,
  /^no\s+major\s+flags$/i,
  /^not\s+yet\s+available$/i,
]

const LABEL_MAP: Record<string, string> = {
  healthy_aging: 'Healthy aging',
  'healthy aging': 'Healthy aging',
  fat_loss: 'Fat loss',
  'fat loss': 'Fat loss',
  stress_mood: 'Stress & mood',
  'stress mood': 'Stress & mood',
  'stress and mood': 'Stress & mood',
  sleep_quality: 'Sleep quality',
  'sleep quality': 'Sleep quality',
  general_wellness: 'General wellness',
  'general wellness': 'General wellness',
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
  if (!raw || hideInternalValue(raw)) return ''

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


export function editorialUseCaseLabel(value: unknown): string {
  const label = formatDisplayLabel(value)

  if (!isClean(label)) return ''

  const lower = label.toLowerCase()
  if (/metabolic|metabolism|glucose|insulin|weight|fat loss/.test(lower)) return 'Most commonly explored for metabolic support.'
  if (/sleep|insomnia|night/.test(lower)) return 'Most commonly explored for sleep and nighttime support.'
  if (/stress|mood|anxiety|calm/.test(lower)) return 'Most commonly explored for stress resilience and calm support.'
  if (/focus|cognition|memory|brain|attention/.test(lower)) return 'Most commonly explored for cognitive and focus support.'
  if (/recovery|performance|exercise|muscle/.test(lower)) return 'Most commonly explored for recovery and performance support.'

  const editorialLabel = label.toLowerCase().replace(/^best\s+for\s+/, '').replace(/\s+support$/, '')

  return `Most commonly explored for ${editorialLabel} support.`
}

export function isSafeInternalHref(value: unknown): value is string {
  const href = text(value)

  if (!href || !href.startsWith('/') || href.includes('//')) return false
  if (/\/(undefined|null|nan)(?:\/|$)/i.test(href)) return false
  if (/\s/.test(href)) return false

  return true
}
