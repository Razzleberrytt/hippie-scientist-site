'use client'

type Gtag = (
  command: 'event',
  eventName: 'affiliate_click' | 'email_signup' | 'guide_view',
  params: Record<string, string | number | boolean | undefined>,
) => void

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

export function trackGuideView(params: { slug: string }): void {
  try {
    getGtag()?.('event', 'guide_view', {
      guide_slug: params.slug,
      page_path: `/guides/${params.slug}`,
    })
  } catch {
    // Analytics must never block page rendering.
  }
}
