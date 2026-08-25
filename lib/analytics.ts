'use client'

import { canTrackAnalytics } from '@/lib/consent'
import { markNewsletterSignup } from '@/lib/email-attribution'

type Gtag = (
  command: 'event',
  eventName:
    | 'affiliate_click'
    | 'atlas_callout_click'
    | 'email_return'
    | 'email_signup'
    | 'experiment_conversion'
    | 'experiment_impression'
    | 'guide_view'
    | 'lead_magnet_click'
    | 'navigation_click'
    | 'page_view'
    | 'profile_feedback'
    | 'research_suggestion',
  params: Record<string, string | number | boolean | undefined>,
) => void

export type GuideViewParams = {
  slug: string
  cluster?: string
  pagePath: string
}

export type ExperimentAnalyticsParams = {
  experimentId: string
  variant: string
  location?: string
  pagePath?: string
}

export type NavigationClickParams = {
  label: string
  destination: string
  sourcePath?: string
  location: 'desktop-primary' | 'mobile-primary'
}

export type ProfileFeedbackParams = {
  question: 'evidence_clarity' | 'research_found' | 'missing_information'
  answer: 'yes' | 'no' | 'evidence_studies' | 'dose_form' | 'safety_interactions' | 'timing_practical' | 'comparison' | 'other'
  pagePath?: string
}

export type ResearchSuggestionParams = {
  suggestionType: 'ingredient' | 'comparison' | 'missing_study'
  suggestionValue: string
  pagePath?: string
}

function getGtag(): Gtag | null {
  if (!canTrackAnalytics()) return null

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

export function trackPageView(params: { pagePath?: string }): boolean {
  try {
    const gtag = getGtag()
    if (!gtag) return false

    const pagePath = getCurrentPagePath(params.pagePath)
    gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
    })
    return true
  } catch {
    return false
  }
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
    const gtag = getGtag()
    if (!gtag) return

    markNewsletterSignup()
    const pagePath = getCurrentPagePath(params.pagePath)
    gtag('event', 'email_signup', {
      source: params.source,
      signup_source: params.source,
      page_path: pagePath,
      source_path: pagePath,
    })
  } catch {
    // Analytics must never block signup flow.
  }
}

export function trackEmailReturn(params: { campaign: string; content: string; pagePath?: string }): void {
  try {
    getGtag()?.('event', 'email_return', {
      email_campaign: params.campaign,
      email_content: params.content,
      page_path: getCurrentPagePath(params.pagePath),
    })
  } catch {
    // Analytics must never block navigation.
  }
}

export function trackExperimentImpression(params: ExperimentAnalyticsParams): void {
  try {
    getGtag()?.('event', 'experiment_impression', {
      experiment_id: params.experimentId,
      experiment_variant: params.variant,
      experiment_location: params.location,
      page_path: getCurrentPagePath(params.pagePath),
    })
  } catch {
    // Analytics must never affect the experiment experience.
  }
}

export function trackExperimentConversion(params: ExperimentAnalyticsParams): void {
  try {
    getGtag()?.('event', 'experiment_conversion', {
      experiment_id: params.experimentId,
      experiment_variant: params.variant,
      experiment_location: params.location,
      page_path: getCurrentPagePath(params.pagePath),
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

export function trackNavigationClick(params: NavigationClickParams): void {
  try {
    getGtag()?.('event', 'navigation_click', {
      navigation_label: params.label,
      navigation_destination: params.destination,
      navigation_location: params.location,
      source_path: getCurrentPagePath(params.sourcePath),
    })
  } catch {
    // Analytics must never block navigation.
  }
}

export function trackProfileFeedback(params: ProfileFeedbackParams): boolean {
  try {
    const gtag = getGtag()
    if (!gtag) return false
    gtag('event', 'profile_feedback', {
      feedback_question: params.question,
      feedback_answer: params.answer,
      page_path: getCurrentPagePath(params.pagePath),
    })
    return true
  } catch {
    return false
  }
}

export function trackResearchSuggestion(params: ResearchSuggestionParams): boolean {
  try {
    const gtag = getGtag()
    if (!gtag) return false
    gtag('event', 'research_suggestion', {
      suggestion_type: params.suggestionType,
      suggestion_value: params.suggestionValue,
      page_path: getCurrentPagePath(params.pagePath),
    })
    return true
  } catch {
    return false
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
