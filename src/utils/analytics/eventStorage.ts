export const ANALYTICS_STORAGE_KEY = 'hs_analytics_events'
const LEGACY_COLLECTION_KEY = 'hs_collection_funnel_events_v1'
const EVENT_LIMIT = 500
const DEDUPE_WINDOW_MS = 1200

export type StoredAnalyticsEvent = {
  type: string
  slug?: string
  item?: string
  comboId?: string
  context?: string
  sourceType?: string
  targetType?: string
  pageType?: string
  entitySlug?: string
  ctaType?: string
  ctaPosition?: string
  variantId?: string
  timestamp: number
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function isStoredEvent(value: unknown): value is StoredAnalyticsEvent {
  if (!value || typeof value !== 'object') return false
  const candidate = value as StoredAnalyticsEvent
  return typeof candidate.type === 'string' && typeof candidate.timestamp === 'number'
}

function normalizeStoredEvent(event: StoredAnalyticsEvent): StoredAnalyticsEvent {
  const normalized: StoredAnalyticsEvent = {
    type: event.type,
    timestamp: event.timestamp,
  }

  if (event.slug) normalized.slug = event.slug
  if (event.item) normalized.item = event.item
  if (event.comboId) normalized.comboId = event.comboId
  if (event.context) normalized.context = event.context
  if (event.sourceType) normalized.sourceType = event.sourceType
  if (event.targetType) normalized.targetType = event.targetType
  if (event.pageType) normalized.pageType = event.pageType
  if (event.entitySlug) normalized.entitySlug = event.entitySlug
  if (event.ctaType) normalized.ctaType = event.ctaType
  if (event.ctaPosition) normalized.ctaPosition = event.ctaPosition
  if (event.variantId) normalized.variantId = event.variantId

  return normalized
}

function readRawEvents(key: string): StoredAnalyticsEvent[] {
  if (!isBrowser()) return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isStoredEvent).map(normalizeStoredEvent)
  } catch {
    return []
  }
}

function migrateLegacyEvents(existing: StoredAnalyticsEvent[]): StoredAnalyticsEvent[] {
  if (existing.length > 0) return existing

  const legacyEvents = readRawEvents(LEGACY_COLLECTION_KEY)
  if (legacyEvents.length > 0) {
    writeAnalyticsEvents(legacyEvents)
  }

  return legacyEvents
}

export function readAnalyticsEvents(): StoredAnalyticsEvent[] {
  const current = readRawEvents(ANALYTICS_STORAGE_KEY)
  return migrateLegacyEvents(current)
}

export function writeAnalyticsEvents(events: StoredAnalyticsEvent[]) {
  if (!isBrowser()) return

  const limited = events
    .filter(isStoredEvent)
    .map(normalizeStoredEvent)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, EVENT_LIMIT)

  window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(limited))
}

function isRapidDuplicate(previous: StoredAnalyticsEvent | undefined, next: StoredAnalyticsEvent) {
  if (!previous) return false
  const sameCoreIdentity =
    previous.type === next.type &&
    previous.slug === next.slug &&
    previous.item === next.item &&
    previous.comboId === next.comboId &&
    previous.context === next.context &&
    previous.sourceType === next.sourceType &&
    previous.targetType === next.targetType &&
    previous.pageType === next.pageType &&
    previous.entitySlug === next.entitySlug &&
    previous.ctaType === next.ctaType &&
    previous.ctaPosition === next.ctaPosition &&
    previous.variantId === next.variantId

  if (!sameCoreIdentity) return false

  return Math.abs(next.timestamp - previous.timestamp) <= DEDUPE_WINDOW_MS
}

function emitAnalyticsUpdate(event?: StoredAnalyticsEvent) {
  if (!isBrowser()) return

  window.dispatchEvent(
    new CustomEvent('hs:analytics-events-updated', {
      detail: event,
    })
  )
}

export function appendAnalyticsEvent(
  event: Omit<StoredAnalyticsEvent, 'timestamp'> & { timestamp?: number }
) {
  const next: StoredAnalyticsEvent = normalizeStoredEvent({
    ...event,
    timestamp: event.timestamp ?? Date.now(),
  })

  if (!next.type) return null

  const existing = readAnalyticsEvents()
  if (isRapidDuplicate(existing[0], next)) {
    return null
  }

  const updated = [next, ...existing]
  writeAnalyticsEvents(updated)
  emitAnalyticsUpdate(next)

  return next
}

export function clearAnalyticsEvents() {
  if (!isBrowser()) return
  window.localStorage.removeItem(ANALYTICS_STORAGE_KEY)
  emitAnalyticsUpdate()
}
