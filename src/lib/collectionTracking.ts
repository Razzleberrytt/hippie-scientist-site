import { appendAnalyticsEvent, readAnalyticsEvents } from '@/utils/analytics/eventStorage'

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
  type: CollectionEventName
  slug?: string
  item?: string
  comboId?: string
  timestamp: number
}

function inferItem(payload: CollectionEventPayload) {
  if (typeof payload.itemName === 'string' && payload.itemName.trim()) {
    return payload.itemName
  }

  if (typeof payload.itemSlug === 'string' && payload.itemSlug.trim()) {
    return payload.itemSlug
  }

  return undefined
}

export function trackCollectionEvent(name: CollectionEventName, payload: CollectionEventPayload) {
  if (typeof window === 'undefined') return

  const event = appendAnalyticsEvent({
    type: name,
    slug: payload.slug,
    item: inferItem(payload),
    comboId: typeof payload.comboId === 'string' ? payload.comboId : undefined,
    pageType: typeof payload.pageType === 'string' ? payload.pageType : undefined,
    entitySlug: typeof payload.entitySlug === 'string' ? payload.entitySlug : undefined,
    ctaType: typeof payload.ctaType === 'string' ? payload.ctaType : undefined,
    ctaPosition: typeof payload.ctaPosition === 'string' ? payload.ctaPosition : undefined,
    variantId: typeof payload.variantId === 'string' ? payload.variantId : undefined,
  })

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[collection-funnel]', name, payload)
  }

  if (!event) return

  window.dispatchEvent(
    new CustomEvent('hs:collection-funnel', {
      detail: event,
    })
  )
}

export function getTrackedCollectionEvents(): CollectionTrackedEvent[] {
  return readAnalyticsEvents().filter((event): event is CollectionTrackedEvent =>
    event.type.startsWith('collection_')
  )
}
