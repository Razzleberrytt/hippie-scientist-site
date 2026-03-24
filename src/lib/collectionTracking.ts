export type CollectionEventName =
  | 'collection_page_view'
  | 'collection_cta_click'
  | 'collection_item_add_to_checker'
  | 'collection_item_add_to_stack'
  | 'collection_combo_run'
  | 'collection_lead_capture_submit'

export type CollectionEventPayload = {
  slug: string
  itemType: 'herb' | 'compound' | 'combo'
  [key: string]: string | number | boolean
}

export type CollectionTrackedEvent = {
  name: CollectionEventName
  at: string
  payload: CollectionEventPayload
}

const COLLECTION_EVENTS_KEY = 'hs_collection_funnel_events_v1'
const COLLECTION_EVENT_LIMIT = 300

function readEvents(): CollectionTrackedEvent[] {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(COLLECTION_EVENTS_KEY) || '[]')
    return Array.isArray(parsed) ? (parsed as CollectionTrackedEvent[]) : []
  } catch {
    return []
  }
}

function persistEvents(events: CollectionTrackedEvent[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    COLLECTION_EVENTS_KEY,
    JSON.stringify(events.slice(0, COLLECTION_EVENT_LIMIT))
  )
}

export function trackCollectionEvent(name: CollectionEventName, payload: CollectionEventPayload) {
  if (typeof window === 'undefined') return

  const event: CollectionTrackedEvent = {
    name,
    at: new Date().toISOString(),
    payload,
  }

  persistEvents([event, ...readEvents()])

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[collection-funnel]', name, payload)
  }

  window.dispatchEvent(
    new CustomEvent('hs:collection-funnel', {
      detail: event,
    })
  )
}

export function getTrackedCollectionEvents() {
  return readEvents()
}
