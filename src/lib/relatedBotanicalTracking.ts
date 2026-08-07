'use client'

import { appendAnalyticsEvent } from '@/lib/analyticsEventStorage'

const SESSION_KEY = 'hs_related_botanical_session'

type RelatedBotanicalSession = {
  sessionId: string
  visitedProfiles: string[]
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `related-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readSession(): RelatedBotanicalSession {
  if (typeof window === 'undefined') return { sessionId: createSessionId(), visitedProfiles: [] }
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || 'null')
    if (parsed && typeof parsed.sessionId === 'string' && Array.isArray(parsed.visitedProfiles)) {
      return {
        sessionId: parsed.sessionId,
        visitedProfiles: parsed.visitedProfiles.filter((item: unknown): item is string => typeof item === 'string'),
      }
    }
  } catch { /* analytics must never block UX */ }
  return { sessionId: createSessionId(), visitedProfiles: [] }
}

function saveSession(session: RelatedBotanicalSession) {
  if (typeof window === 'undefined') return
  try { window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch { /* ignore */ }
}

function ensureSourceVisited(sourceSlug: string) {
  const session = readSession()
  const visitedProfiles = session.visitedProfiles.includes(sourceSlug)
    ? session.visitedProfiles
    : [...session.visitedProfiles, sourceSlug]
  const next = { ...session, visitedProfiles }
  saveSession(next)
  return next
}

export type RelatedBotanicalTrackingItem = {
  slug: string
  position: number
  score: number
  reasonTypes: string[]
}

export function trackRelatedBotanicalsShown(sourceSlug: string, items: RelatedBotanicalTrackingItem[]) {
  if (typeof window === 'undefined' || !items.length) return
  const session = ensureSourceVisited(sourceSlug)
  appendAnalyticsEvent({
    type: 'related_botanicals_shown',
    slug: sourceSlug,
    item: items.map((item) => `${item.slug}~${item.position}~${item.score}~${item.reasonTypes.join('|')}`).join(','),
    context: `session:${session.sessionId};depth:${session.visitedProfiles.length};reason_types:${Array.from(new Set(items.flatMap((item) => item.reasonTypes))).sort().join('|')}`,
    sourceType: 'herb',
    targetType: 'herb',
  })
}

export function trackRelatedBotanicalClick(sourceSlug: string, item: RelatedBotanicalTrackingItem) {
  if (typeof window === 'undefined') return
  const session = ensureSourceVisited(sourceSlug)
  const visitedProfiles = session.visitedProfiles.includes(item.slug)
    ? session.visitedProfiles
    : [...session.visitedProfiles, item.slug]
  const next = { ...session, visitedProfiles }
  saveSession(next)

  appendAnalyticsEvent({
    type: 'related_botanical_click',
    slug: sourceSlug,
    item: item.slug,
    context: `session:${next.sessionId};position:${item.position};score:${item.score};reason_types:${item.reasonTypes.join('|')};profile_depth:${next.visitedProfiles.length}`,
    sourceType: 'herb',
    targetType: 'herb',
  })
}

export function trackRelatedBotanicalCompare(sourceSlug: string, item: RelatedBotanicalTrackingItem, compareHref: string) {
  if (typeof window === 'undefined') return
  const session = ensureSourceVisited(sourceSlug)
  appendAnalyticsEvent({
    type: 'related_botanical_compare_click',
    slug: sourceSlug,
    item: item.slug,
    context: `session:${session.sessionId};position:${item.position};score:${item.score};reason_types:${item.reasonTypes.join('|')};compare_href:${compareHref};profile_depth:${session.visitedProfiles.length}`,
    sourceType: 'herb',
    targetType: 'comparison',
  })
}
