'use client'

type Gtag = (
  command: 'event',
  eventName: 'affiliate_click' | 'email_signup' | 'guide_view' | 'lead_magnet_click',
  params: Record<string, string | number | boolean | undefined>,
) => void

export type GuideViewParams = {
  slug: string
  cluster?: string
  pagePath: string
}

function getGtag(): Gtag | null {
  if (typeof window === 'undefined') return null

  const candidate = (window as Window & { gtag?: unknown }).gtag
  return typeof candidate === 'function' ? (candidate as Gtag) : null
}

export function trackAffiliateClick(params: { itemName: string; program: string; asin?: string }): void {
  try {
    getGtag()?.('event', 'affiliate_click', {
      item_name: params.itemName,
      herb_name: params.itemName,
      compound_name: params.itemName,
      affiliate_program: params.program,
      asin: params.asin,
    })
  } catch {
    // Analytics must never block navigation.
  }
}

export function trackEmailSignup(params: { source: string }): void {
  try {
    getGtag()?.('event', 'email_signup', {
      source: params.source,
    })
  } catch {
    // Analytics must never block signup flow.
  }
}

export function trackLeadMagnetClick(params: { slug: string; sourcePath: string }): void {
  try {
    getGtag()?.('event', 'lead_magnet_click', {
      lead_magnet_slug: params.slug,
      source_path: params.sourcePath,
    })
  } catch {
    // Analytics must never block resource access.
  }
}

export function getGuideTrackingContext(pathname: string): GuideViewParams | null {
  const pathOnly = pathname.split(/[?#]/, 1)[0]
  const segments = pathOnly.split('/').filter(Boolean)

  if (segments[0] !== 'guides' || segments.length < 2) return null

  return {
    slug: segments[segments.length - 1],
    cluster: segments.length > 2 ? segments[1] : undefined,
    pagePath: `/${segments.join('/')}/`,
  }
}

export function trackGuideView(params: GuideViewParams): void {
  try {
    getGtag()?.('event', 'guide_view', {
      guide_slug: params.slug,
      guide_cluster: params.cluster,
      page_path: params.pagePath,
    })
  } catch {
    // Analytics must never block page rendering.
  }
}
