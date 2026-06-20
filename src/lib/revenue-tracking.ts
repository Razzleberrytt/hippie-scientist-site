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

export function trackAffiliateClick(productName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'affiliate_click', {
      product_name: productName,
      value: 1,
      currency: 'USD',
    })
  }
}

export function trackEmailCapture(source: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'email_signup', {
      signup_source: source,
      value: 1,
    })
  }
}

export function trackProfileView(profileName: string, profileType: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'profile_view', {
      profile_name: profileName,
      profile_type: profileType,
    })
  }
}

export function trackRecommendationImpression(sourceProduct: string, recommendedProducts: string[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'recommendation_impression', {
      source_product: sourceProduct,
      recommended_products: recommendedProducts.join(','),
      count: recommendedProducts.length,
    })
  }
}

export function trackStackView(stackName: string, products: string[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'stack_view', {
      stack_name: stackName,
      product_count: products.length,
      products: products.join(','),
    })
  }
}

export function trackRevenueEvent(input: RevenueEventInput) {
  if (typeof window === 'undefined') return

  const event = buildRevenueEvent(input)
  window.dispatchEvent(new CustomEvent('ths:revenue-event', { detail: event }))

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)

  if (window.gtag) {
    window.gtag('event', event.kind, {
      event_category: event.location,
      event_label: event.label,
      event_target: event.target || undefined,
    })
  }

}
