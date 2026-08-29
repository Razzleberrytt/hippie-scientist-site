import { canTrackAnalytics } from '@/lib/consent'
import { getNewsletterAttribution } from '@/lib/email-attribution'

export type RevenueEventKind =
  | 'recommendation_impression'
  | 'recommendation_click'
  | 'affiliate_click'
  | 'cta_click'
  | 'email_signup_attempt'
  | 'email_signup_success'
  | 'revenue_attributed'

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
export type RevenueVisitorSource = 'organic' | 'paid-search' | 'email' | 'social' | 'referral' | 'direct' | 'internal' | 'unknown'
export type RevenueLandingQueryClass = 'commercial' | 'comparison' | 'safety' | 'dose' | 'timing' | 'mechanism' | 'research' | 'informational' | 'unknown'

export type RevenueEventInput = {
  kind: string
  location: string
  label: string
  target?: string
  productSlug?: string
  productSlot?: string
  productAsin?: string
  modulePosition?: string
  ctaVariant?: string
  experimentVariant?: string
  retailer?: string
  valueUsd?: number
}

export type RevenueEventContext = {
  pagePath?: string
  pageSearch?: string
  referrer?: string
  landingPath?: string
  landingSearch?: string
  landingReferrer?: string
  viewportWidth?: number
  viewportHeight?: number
  scrollY?: number
  documentHeight?: number
  countryCode?: string
}

export type RevenueEvent = {
  kind: RevenueEventKind
  location: string
  label: string
  target: string
  targetHost: string
  pagePath: string
  routeFamily: RevenueRouteFamily
  contentCluster: string
  productSlug: string
  productSlot: string
  productAsin: string
  modulePosition: string
  ctaVariant: string
  experimentVariant: string
  retailer: string
  visitorSource: RevenueVisitorSource
  landingQueryClass: RevenueLandingQueryClass
  landingQueryClassSource: 'explicit' | 'route-inferred'
  countryCode: string
  valueUsd: number
  deviceType: RevenueDeviceType
  scrollDepth: RevenueScrollDepth
  occurredAt: string
}

const LANDING_SESSION_KEY = 'ths_revenue_landing_v1'

function canSendAnalytics(): boolean {
  return canTrackAnalytics()
}

export function normalizeRevenueEventKind(kind: string): RevenueEventKind {
  if (
    kind === 'recommendation_impression' ||
    kind === 'recommendation_click' ||
    kind === 'affiliate_click' ||
    kind === 'cta_click' ||
    kind === 'email_signup_attempt' ||
    kind === 'email_signup_success' ||
    kind === 'revenue_attributed'
  ) return kind
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
  if (path.includes('/best-supplements-for-') || path.startsWith('/best-for/') || path.startsWith('/guides/best/')) return 'best-supplements'
  if (path.startsWith('/top/')) return 'top-list'
  if (path.startsWith('/goals/')) return 'goal'
  if (path.startsWith('/stacks/')) return 'stack'
  if (path === '/buy-guide' || path.startsWith('/buy-guide/') || path === '/learn/product-quality' || path.startsWith('/learn/product-quality/')) return 'buy-guide'
  if (path.startsWith('/guides/')) return 'guide'
  return 'other'
}

export function classifyRevenueContentCluster(pathname: string): string {
  const path = normalizeRevenuePagePath(pathname).toLowerCase()
  const clusters = ['sleep', 'anxiety', 'stress', 'focus', 'cognition', 'adhd', 'metabolic', 'energy', 'safety', 'evidence', 'magnesium', 'ashwagandha', 'melatonin', 'l-theanine', 'creatine', 'berberine']
  return clusters.find((cluster) => path.includes(`/${cluster}`) || path.includes(`${cluster}-`)) ?? 'general'
}

export function inferRevenueProductSlug(pathname: string): string {
  const path = normalizeRevenuePagePath(pathname)
  const match = path.match(/^\/(?:herbs|compounds)\/([^/]+)/)
  if (!match) return ''
  try { return decodeURIComponent(match[1]) } catch { return match[1] }
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
  try { return new URL(target).hostname.replace(/^www\./, '') } catch { return '' }
}

function safeUrlSearch(search: string | undefined) {
  try { return new URLSearchParams((search ?? '').replace(/^\?/, '')) } catch { return new URLSearchParams() }
}

export function classifyRevenueVisitorSource(search: string | undefined, referrer: string | undefined, currentHost = ''): RevenueVisitorSource {
  const params = safeUrlSearch(search)
  const medium = (params.get('utm_medium') ?? '').toLowerCase()
  const source = (params.get('utm_source') ?? '').toLowerCase()
  if (/cpc|ppc|paid|sem/.test(medium)) return 'paid-search'
  if (/email|newsletter/.test(medium) || /email|newsletter/.test(source)) return 'email'
  if (/social/.test(medium) || /facebook|instagram|tiktok|youtube|reddit|x\.com|twitter/.test(source)) return 'social'
  if (!referrer) return 'direct'
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    if (currentHost && host === currentHost.replace(/^www\./, '')) return 'internal'
    if (/google\.|bing\.|duckduckgo\.|yahoo\.|brave\.|ecosia\./.test(host)) return 'organic'
    if (/facebook\.|instagram\.|tiktok\.|youtube\.|reddit\.|x\.com|twitter\./.test(host)) return 'social'
    return 'referral'
  } catch {
    return 'unknown'
  }
}

function inferQueryClassFromPath(pathname: string): RevenueLandingQueryClass {
  const path = normalizeRevenuePagePath(pathname).toLowerCase()
  if (path.includes('/compare/') || /-vs-/.test(path)) return 'comparison'
  if (path.includes('/safety') || path.includes('interaction')) return 'safety'
  if (path.includes('dosage') || path.includes('/dose')) return 'dose'
  if (path.includes('best-time') || path.includes('morning-or-night') || path.includes('timing')) return 'timing'
  if (path.includes('mechanism') || path.includes('pathway')) return 'mechanism'
  if (path.includes('evidence') || path.includes('research') || path.includes('atlas')) return 'research'
  if (path.includes('/best') || path.includes('/buy') || path.includes('product-quality')) return 'commercial'
  return 'informational'
}

export function classifyLandingQueryClass(pathname: string, search?: string): { value: RevenueLandingQueryClass; source: 'explicit' | 'route-inferred' } {
  const explicit = safeUrlSearch(search).get('query_class')?.toLowerCase()
  const allowed: RevenueLandingQueryClass[] = ['commercial', 'comparison', 'safety', 'dose', 'timing', 'mechanism', 'research', 'informational', 'unknown']
  if (explicit && allowed.includes(explicit as RevenueLandingQueryClass)) return { value: explicit as RevenueLandingQueryClass, source: 'explicit' }
  return { value: inferQueryClassFromPath(pathname), source: 'route-inferred' }
}

function readLandingContext(): Pick<RevenueEventContext, 'landingPath' | 'landingSearch' | 'landingReferrer'> {
  if (typeof window === 'undefined') return {}
  const fallback = { landingPath: window.location.pathname, landingSearch: window.location.search, landingReferrer: document.referrer }
  try {
    const existing = window.sessionStorage.getItem(LANDING_SESSION_KEY)
    if (existing) return JSON.parse(existing)
    window.sessionStorage.setItem(LANDING_SESSION_KEY, JSON.stringify(fallback))
  } catch {
    // Session attribution is best-effort and never blocks tracking.
  }
  return fallback
}

export function buildRevenueEvent(input: RevenueEventInput, context: RevenueEventContext = {}): RevenueEvent {
  const pagePath = normalizeRevenuePagePath(context.pagePath ?? '')
  const landingPath = context.landingPath || pagePath
  const landingSearch = context.landingSearch || context.pageSearch || ''
  const landingClass = classifyLandingQueryClass(landingPath, landingSearch)
  const targetHost = getRevenueTargetHost(input.target)

  return {
    kind: normalizeRevenueEventKind(input.kind),
    location: input.location,
    label: input.label,
    target: input.target || '',
    targetHost,
    pagePath,
    routeFamily: classifyRevenueRoute(pagePath),
    contentCluster: classifyRevenueContentCluster(pagePath),
    productSlug: input.productSlug || inferRevenueProductSlug(pagePath),
    productSlot: input.productSlot || '',
    productAsin: input.productAsin || '',
    modulePosition: input.modulePosition || getRevenueScrollDepth(context),
    ctaVariant: input.ctaVariant || '',
    experimentVariant: input.experimentVariant || '',
    retailer: input.retailer || targetHost || '',
    visitorSource: classifyRevenueVisitorSource(landingSearch, context.landingReferrer ?? context.referrer, typeof window !== 'undefined' ? window.location.hostname : ''),
    landingQueryClass: landingClass.value,
    landingQueryClassSource: landingClass.source,
    countryCode: (context.countryCode || '').toUpperCase().slice(0, 2),
    valueUsd: Number.isFinite(input.valueUsd) ? Number(input.valueUsd) : 0,
    deviceType: getRevenueDeviceType(context.viewportWidth),
    scrollDepth: getRevenueScrollDepth(context),
    occurredAt: new Date().toISOString(),
  }
}

export function getBrowserRevenueContext(): RevenueEventContext {
  if (typeof window === 'undefined' || typeof document === 'undefined') return {}
  const documentElementHeight = document.documentElement?.scrollHeight ?? 0
  const bodyHeight = document.body?.scrollHeight ?? 0
  const landing = readLandingContext()
  return {
    pagePath: window.location.pathname,
    pageSearch: window.location.search,
    referrer: document.referrer,
    ...landing,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    scrollY: window.scrollY,
    documentHeight: Math.max(documentElementHeight, bodyHeight),
    countryCode: document.documentElement.dataset.countryCode || '',
  }
}

export function trackAffiliateClick(productName: string) {
  trackRevenueEvent({ kind: 'affiliate_click', location: 'legacy-affiliate-click', label: productName })
}

export function trackEmailCapture(source: string) {
  if (typeof window !== 'undefined' && window.gtag && canSendAnalytics()) {
    window.gtag('event', 'email_signup', { signup_source: source, value: 1 })
  }
}

export function trackProfileView(profileName: string, profileType: string) {
  if (typeof window !== 'undefined' && window.gtag && canSendAnalytics()) {
    window.gtag('event', 'profile_view', { profile_name: profileName, profile_type: profileType })
  }
}

export function trackRecommendationImpression(sourceProduct: string, recommendedProducts: string[]) {
  trackRevenueEvent({ kind: 'recommendation_impression', location: 'legacy-recommendation-impression', label: recommendedProducts.join(',') || sourceProduct, productSlug: sourceProduct })
}

export function trackStackView(stackName: string, products: string[]) {
  if (typeof window !== 'undefined' && window.gtag && canSendAnalytics()) {
    window.gtag('event', 'stack_view', { stack_name: stackName, product_count: products.length, products: products.join(',') })
  }
}

export function trackRevenueEvent(input: RevenueEventInput) {
  if (typeof window === 'undefined') return
  const event = buildRevenueEvent(input, getBrowserRevenueContext())
  window.dispatchEvent(new CustomEvent('ths:revenue-event', { detail: event }))
  if (!canSendAnalytics()) return

  const newsletter = getNewsletterAttribution()
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ ...event, newsletterAttributed: newsletter.newsletterAttributed, newsletterCampaign: newsletter.campaign, newsletterContent: newsletter.content, subscriberAgeDays: newsletter.subscriberAgeDays, firstEmailReturnAgeDays: newsletter.firstEmailReturnAgeDays })

  if (window.gtag) {
    window.gtag('event', event.kind, {
      event_category: event.location,
      event_label: event.label,
      event_target: event.target || undefined,
      target_host: event.targetHost || undefined,
      page_path: event.pagePath || undefined,
      route_family: event.routeFamily,
      content_cluster: event.contentCluster,
      product_slug: event.productSlug || undefined,
      product_slot: event.productSlot || undefined,
      product_asin: event.productAsin || undefined,
      module_position: event.modulePosition || undefined,
      cta_variant: event.ctaVariant || undefined,
      experiment_variant: event.experimentVariant || undefined,
      retailer: event.retailer || undefined,
      visitor_source: event.visitorSource,
      landing_query_class: event.landingQueryClass,
      landing_query_class_source: event.landingQueryClassSource,
      country_code: event.countryCode || undefined,
      value_usd: event.valueUsd || undefined,
      device_type: event.deviceType,
      scroll_depth: event.scrollDepth,
      newsletter_attributed: newsletter.newsletterAttributed,
      newsletter_campaign: newsletter.campaign || undefined,
      newsletter_content: newsletter.content || undefined,
      subscriber_age_days: newsletter.subscriberAgeDays ?? undefined,
      first_email_return_age_days: newsletter.firstEmailReturnAgeDays ?? undefined,
    })
  }
}
