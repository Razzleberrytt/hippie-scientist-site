export type RevenueEventKind = 'recommendation_click' | 'cta_click' | 'email_signup_attempt'

export type RevenueEventInput = {
  kind: string
  location: string
  label: string
  target?: string
}

export type RevenueEvent = {
  kind: RevenueEventKind
  location: string
  label: string
  target: string
  occurredAt: string
}

export function normalizeRevenueEventKind(kind: string): RevenueEventKind {
  if (kind === 'recommendation_click' || kind === 'cta_click' || kind === 'email_signup_attempt') {
    return kind
  }
  return 'cta_click'
}

export function buildRevenueEvent(input: RevenueEventInput): RevenueEvent {
  return {
    kind: normalizeRevenueEventKind(input.kind),
    location: input.location,
    label: input.label,
    target: input.target || '',
    occurredAt: new Date().toISOString(),
  }
}

export function trackRevenueEvent(input: RevenueEventInput) {
  if (typeof window === 'undefined') return

  const event = buildRevenueEvent(input)
  window.dispatchEvent(new CustomEvent('ths:revenue-event', { detail: event }))

  const dataLayerTarget = window as Window & {
    dataLayer?: RevenueEvent[]
  }
  dataLayerTarget.dataLayer = dataLayerTarget.dataLayer || []
  dataLayerTarget.dataLayer.push(event)

  try {
    const existing = window.localStorage.getItem('ths_revenue_events')
    const queue = existing ? JSON.parse(existing) : []
    if (Array.isArray(queue)) {
      queue.push(event)
      window.localStorage.setItem('ths_revenue_events', JSON.stringify(queue.slice(-50)))
    }
  } catch {
    // Local storage can be unavailable in privacy modes; event dispatch above still works.
  }
}
