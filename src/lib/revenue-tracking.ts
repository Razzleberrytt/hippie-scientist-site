import { getConsent } from './consent'

export type RevenueEventKind =
  | 'recommendation_impression'
  | 'recommendation_click'
  | 'affiliate_click'
  | 'cta_click'
  | 'email_signup_attempt'

export type RevenueRouteFamily =
  | 'home'
  | 'herb-profile'
  | 'compound-profile'
  | 'comparison'
  | 'best-supplements'
  | 'top-list'
  | 'goal'
  | 'stack'
  | 'buy-guide'
  | 'guide'
  | 'other'
  | 'unknown'

export type RevenueDeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown'
export type RevenueScrollDepth = '0-24' | '25-49' | '50-74' | '75-99' | '100' | 'unknown'

export type RevenueEventInput = {
  kind: string
  location: string
  label: string
  target?: string
  productSlug?: string
  productSlot?: string
  productAsin?: string
}

export type RevenueEventContext = {
  pagePath?: string
  viewportWidth?: number
  viewportHeight?: number
  scrollY?: number
  documentHeight?: number
}

export type RevenueEvent = {
  kind: RevenueEventKind
  location: string
  label: string
  target: string
  targetHost: string
  pagePath: string
  routeFamily: RevenueRouteFamily
  productSlug: string
  productSlot: string
  productAsin: string
  deviceType: RevenueDeviceType
  scrollDepth: RevenueScrollDepth
  occurredAt: string
}

export function normalizeRevenueEventKind(kind: string): RevenueEventKind {
  if (
    kind === 'recommendation_impression' ||
    kind === 'recommendation_click' ||
    kind === 'affiliate_click' ||
    kind === 'cta_click' ||
    kind === 'email_signup_attempt'
  ) {
    return kind
  }
  return 'cta_click'
}

export function normalizeRevenuePagePath(pathname: string): string {
  const pathOnly = pathname.split(/[?#]/, 1)[0]
  if (!pathOnly) return ''
  return pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
}

export function classifyRevenueRoute(pathname: string): RevenueRouteFamily {
  const path = normalizeRevenuePagePath(pathname)
  if (!path) return 'unknown'
  if (path === '/') return 'home'
  if (path.startsWith('/herbs/')) return 'herb-profile'
  if (path.startsWith('/compounds/')) return 'compound-profile'
  if (path.startsWith('/compare/') || path.includes('/compare/')) return 'comparison'
  if (path.includes('/best-supplements-for-') || path.startsWith('/best-for/')) return 'best-supplements'
  if (path.startsWith('/top/')) return 'top-list'
  if (path.startsWith('/goals/')) return 'goal'
  if (path.startsWith('/stacks/')) return 'stack'
  if (path === '/buy-guide' || path.startsWith('/buy-guide/')) return 'buy-guide'
  if (path.startsWith('/guides/')) return 'guide'
  return 'other'
}

export function inferRevenueProductSlug(pathname: string): string {
  const path = normalizeRevenuePagePath(pathname)
  const match = path.match(/^\/(?:herbs|compounds)\/([^/]+)/)
  if (!match) return ''

  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

export function getRevenueDeviceType(viewportWidth: number | undefined): RevenueDeviceType {
  if (!viewportWidth || viewportWidth <= 0) return 'unknown'
  if (viewportWidth < 768) return 'mobile'
  if (viewportWidth < 1024) return 'tablet'
  return 'desktop'
}

export function getRevenueScrollDepth(context: RevenueEventContext): RevenueScrollDepth {
  const viewportHeight = context.viewportHeight ?? 0
  const documentHeight = context.documentHeight ?? 0
  if (viewportHeight <= 0 || documentHeight <= 0) return 'unknown'

  const viewedBottom = Math.max(0, context.scrollY ?? 0) + viewportHeight
  const percentage = Math.min(100, Math.max(0, (viewedBottom / documentHeight) * 100))

  if (percentage >= 99) return '100'
  if (percentage >= 75) return '75-99'
  if (percentage >= 50) return '50-74'
  if (percentage >= 25) return '25-49'
  return '0-24'
}

export function getRevenueTargetHost(target: string | undefined): string {
  if (!target) return ''

  try {
    return new URL(target).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function buildRevenueEvent(input: RevenueEventInput, context: RevenueEventContext = {}): RevenueEvent {
  const pagePath = normalizeRevenuePagePath(context.pagePath ?? '')

  return {
    kind: normalizeRevenueEventKind(input.kind),
    location: input.location,
    label: input.label,
    target: input.target || '',
    targetHost: getRevenueTargetHost(input.target),
    pagePath,
    routeFamily: classifyRevenueRoute(pagePath),
    productSlug: input.productSlug || inferRevenueProductSlug(pagePath),
    productSlot: input.productSlot || '',
    productAsin: input.productAsin || '',
    deviceType: getRevenueDeviceType(context.viewportWidth),
    scrollDepth: getRevenueScrollDepth(context),
    occurredAt: new Date().toISOString(),
  }
}

export function getBrowserRevenueContext(): RevenueEventContext {
  if (typeof window === 'undefined' || typeof document === 'undefined') return {}

  const documentElementHeight = document.documentElement?.scrollHeight ?? 0
  const bodyHeight = document.body?.scrollHeight ?? 0

  return {
    pagePath: window.location.pathname,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    scrollY: window.scrollY,
    documentHeight: Math.max(documentElementHeight, bodyHeight),
  }
}

export function trackAffiliateClick(productName: string) {
  trackRevenueEvent({
    kind: 'affiliate_click',
    location: 'legacy-affiliate-click',
    label: productName,
  })
}

export function trackEmailCapture(source: string) {
  if (typeof window !== 'undefined' && window.gtag && getConsent() === 'granted') {
    window.gtag('event', 'email_signup', {
      signup_source: source,
      value: 1,
    })
  }
}

export function trackProfileView(profileName: string, profileType: string) {
  if (typeof window !== 'undefined' && window.gtag && getConsent() === 'granted') {
    window.gtag('event', 'profile_view', {
      profile_name: profileName,
      profile_type: profileType,
    })
  }
}

export function trackRecommendationImpression(sourceProduct: string, recommendedProducts: string[]) {
  trackRevenueEvent({
    kind: 'recommendation_impression',
    location: 'legacy-recommendation-impression',
    label: recommendedProducts.join(',') || sourceProduct,
    productSlug: sourceProduct,
  })
}

export function trackStackView(stackName: string, products: string[]) {
  if (typeof window !== 'undefined' && window.gtag && getConsent() === 'granted') {
    window.gtag('event', 'stack_view', {
      stack_name: stackName,
      product_count: products.length,
      products: products.join(','),
    })
  }
}

export function trackRevenueEvent(input: RevenueEventInput) {
  if (typeof window === 'undefined') return

  const event = buildRevenueEvent(input, getBrowserRevenueContext())
  window.dispatchEvent(new CustomEvent('ths:revenue-event', { detail: event }))

  if (getConsent() !== 'granted') return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)

  if (window.gtag) {
    window.gtag('event', event.kind, {
      event_category: event.location,
      event_label: event.label,
      event_target: event.target || undefined,
      target_host: event.targetHost || undefined,
      page_path: event.pagePath || undefined,
      route_family: event.routeFamily,
      product_slug: event.productSlug || undefined,
      product_slot: event.productSlot || undefined,
      product_asin: event.productAsin || undefined,
      device_type: event.deviceType,
      scroll_depth: event.scrollDepth,
    })
  }
}
