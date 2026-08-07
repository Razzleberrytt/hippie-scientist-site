'use client'

import { appendAnalyticsEvent } from '@/lib/analyticsEventStorage'

const SESSION_KEY = 'hs_compare_hub_session'
const SEEN_CATEGORY_KEY = 'hs_compare_hub_seen_categories'

type HubSession = { sessionId: string }

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

function seenCategories() {
  if (typeof window === 'undefined') return new Set<string>()
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SEEN_CATEGORY_KEY) || '[]')
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [])
  } catch {
    return new Set<string>()
  }
}

export function trackCompareHubCategoryShown(category: string) {
  if (typeof window === 'undefined' || !category) return
  const seen = seenCategories()
  if (seen.has(category)) return
  seen.add(category)
  try { window.sessionStorage.setItem(SEEN_CATEGORY_KEY, JSON.stringify(Array.from(seen))) } catch { /* ignore */ }
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
  appendAnalyticsEvent({
    type: 'compare_hub_click',
    slug: href,
    item: label,
    context: `session:${session.sessionId};source:${source};category:${category || 'none'}`,
    sourceType: 'compare_hub',
    targetType: href.includes('/dynamic/') ? 'dynamic_matrix' : 'comparison',
  })
}
