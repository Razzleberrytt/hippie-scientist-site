'use client'

import { appendAnalyticsEvent } from '@/lib/analyticsEventStorage'

const SESSION_KEY = 'hs_compare_hub_session'
const SEEN_CATEGORY_KEY = 'hs_compare_hub_seen_categories'
const SEEN_COMPARISON_KEY = 'hs_compare_seen_pages'
const PENDING_ENTRY_KEY = 'hs_compare_pending_entry'

type HubSession = { sessionId: string }
type PendingEntry = {
  pageSlug: string
  source: CompareHubClickSource
  category: string
  label: string
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `compare-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getSession(): HubSession {
  if (typeof window === 'undefined') return { sessionId: createSessionId() }
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || 'null')
    if (parsed && typeof parsed.sessionId === 'string') return parsed
  } catch { /* analytics must never block UX */ }
  const session = { sessionId: createSessionId() }
  try { window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch { /* ignore */ }
  return session
}

function readStringSet(key: string) {
  if (typeof window === 'undefined') return new Set<string>()
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(key) || '[]')
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [])
  } catch {
    return new Set<string>()
  }
}

function persistStringSet(key: string, values: Set<string>) {
  if (typeof window === 'undefined') return
  try { window.sessionStorage.setItem(key, JSON.stringify(Array.from(values))) } catch { /* ignore */ }
}

function comparisonSlugFromHref(href: string) {
  const match = href.match(/^\/guides\/compare\/([^/?#]+)\/?(?:[?#].*)?$/)
  if (!match || match[1] === 'dynamic') return undefined
  return match[1]
}

function writePendingEntry(entry: PendingEntry) {
  if (typeof window === 'undefined') return
  try { window.sessionStorage.setItem(PENDING_ENTRY_KEY, JSON.stringify(entry)) } catch { /* ignore */ }
}

function consumePendingEntry(pageSlug: string): PendingEntry | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = window.sessionStorage.getItem(PENDING_ENTRY_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as Partial<PendingEntry>
    if (parsed.pageSlug !== pageSlug || typeof parsed.source !== 'string') return undefined
    window.sessionStorage.removeItem(PENDING_ENTRY_KEY)
    return {
      pageSlug,
      source: parsed.source as CompareHubClickSource,
      category: typeof parsed.category === 'string' ? parsed.category : 'none',
      label: typeof parsed.label === 'string' ? parsed.label : pageSlug,
    }
  } catch {
    return undefined
  }
}

export function trackCompareHubCategoryShown(category: string) {
  if (typeof window === 'undefined' || !category) return
  const seen = readStringSet(SEEN_CATEGORY_KEY)
  if (seen.has(category)) return
  seen.add(category)
  persistStringSet(SEEN_CATEGORY_KEY, seen)
  const session = getSession()
  appendAnalyticsEvent({
    type: 'compare_hub_category_shown',
    slug: category,
    context: `session:${session.sessionId};surface:featured_category`,
    sourceType: 'compare_hub',
    targetType: 'category',
  })
}

export type CompareHubClickSource = 'goal_starter' | 'featured_category' | 'featured_entry' | 'dynamic_matrix'

export function trackCompareHubClick({
  source,
  href,
  label,
  category,
}: {
  source: CompareHubClickSource
  href: string
  label: string
  category?: string
}) {
  if (typeof window === 'undefined') return
  const session = getSession()
  const pageSlug = comparisonSlugFromHref(href)
  if (pageSlug) {
    writePendingEntry({
      pageSlug,
      source,
      category: category || 'none',
      label,
    })
  }
  appendAnalyticsEvent({
    type: 'compare_hub_click',
    slug: href,
    item: label,
    context: `session:${session.sessionId};source:${source};category:${category || 'none'}`,
    sourceType: 'compare_hub',
    targetType: href.includes('/dynamic/') ? 'dynamic_matrix' : 'comparison',
  })
}

export type ComparisonOutcomeType = 'herb_profile' | 'compound_profile' | 'safety_checker' | 'reference' | 'another_comparison' | 'compare_hub'

export function trackComparisonPageViewed(pageSlug: string) {
  if (typeof window === 'undefined' || !pageSlug) return
  const session = getSession()
  const seen = readStringSet(SEEN_COMPARISON_KEY)
  const key = `${session.sessionId}|${pageSlug}`
  if (seen.has(key)) return
  seen.add(key)
  persistStringSet(SEEN_COMPARISON_KEY, seen)
  const entry = consumePendingEntry(pageSlug)
  appendAnalyticsEvent({
    type: 'comparison_page_viewed',
    slug: pageSlug,
    context: `session:${session.sessionId};entry_source:${entry?.source || 'direct_or_external'};entry_category:${entry?.category || 'none'};entry_label:${(entry?.label || pageSlug).replace(/[;:]/g, ' ')}`,
    sourceType: 'comparison',
    targetType: 'comparison',
  })
}

export function trackComparisonOutcome({
  pageSlug,
  outcome,
  href,
  label,
}: {
  pageSlug: string
  outcome: ComparisonOutcomeType
  href: string
  label?: string
}) {
  if (typeof window === 'undefined' || !pageSlug || !href) return
  const session = getSession()
  appendAnalyticsEvent({
    type: 'comparison_outcome_click',
    slug: pageSlug,
    item: href,
    context: `session:${session.sessionId};outcome:${outcome};label:${(label || href).replace(/[;:]/g, ' ')}`,
    sourceType: 'comparison',
    targetType: outcome,
  })
}
