'use client'

import { getConsent, getSystemNoTracking } from '@/lib/consent'

type Gtag = (
  command: 'event',
  eventName:
    | 'affiliate_click'
    | 'atlas_callout_click'
    | 'email_signup'
    | 'guide_view'
    | 'lead_magnet_click',
  params: Record<string, string | number | boolean | undefined>,
) => void

export type GuideViewParams = {
  slug: string
  cluster?: string
  pagePath: string
}

function getGtag(): Gtag | null {
  if (typeof window === 'undefined') return null
  if (getConsent() !== 'granted' || getSystemNoTracking()) return null

  const candidate = (window as Window & { gtag?: unknown }).gtag
  return typeof candidate === 'function' ? (candidate as Gtag) : null
}

function normalizePagePath(pathname: string): string {
  const pathOnly = pathname.split(/[?#]/, 1)[0]
  if (!pathOnly) return '/'
  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withLeadingSlash === '/' || withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`
}

function getCurrentPagePath(explicitPath?: string): string {
  if (explicitPath) return normalizePagePath(explicitPath)
  if (typeof window === 'undefined') return '/'
  return normalizePagePath(window.location.pathname)
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

export function trackEmailSignup(params: { source: string; pagePath?: string }): void {
  try {
    const pagePath = getCurrentPagePath(params.pagePath)
    getGtag()?.('event', 'email_signup', {
      source: params.source,
      signup_source: params.source,
      page_path: pagePath,
      source_path: pagePath,
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

export type AtlasCalloutClickParams = {
  source: string
  target: 'primary' | 'secondary'
  destination: string
}

export function trackAtlasCalloutClick(params: AtlasCalloutClickParams): void {
  try {
    if (!getGtag()) return

    // dataLayer entries are consumed by tag managers, so they are only written
    // once the same consent gate that guards gtag has passed.
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> }
    analyticsWindow.dataLayer = analyticsWindow.dataLayer || []
    analyticsWindow.dataLayer.push({
      event: 'atlas_callout_click',
      atlas_source: params.source,
      atlas_target: params.target,
      atlas_destination: params.destination,
    })

    getGtag()?.('event', 'atlas_callout_click', {
      source: params.source,
      target: params.target,
      destination: params.destination,
    })
  } catch {
    // Analytics must never block navigation.
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
