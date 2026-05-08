import { cleanSummary, isClean, list, text } from '@/lib/display-utils'

export const RUNTIME_FALLBACKS = {
  summary: 'Research profile in progress.',
  primary_effects: ['research-pending'],
  evidence_grade: 'insufficient',
  profile_status: 'minimal',
} as const

export function safeSlug(record: any, fallback = 'research-profile') {
  const raw = text(record?.slug) || text(record?.name) || fallback

  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback
}

export function safeSummary(record: any, kind: 'herb' | 'compound' = 'herb') {
  const summary =
    text(record?.summary) ||
    text(record?.evidence_summary) ||
    text(record?.evidence_summary_short) ||
    text(record?.description) ||
    text(record?.coreInsight) ||
    text(record?.hero)

  const cleaned = cleanSummary(summary, kind)

  return isClean(cleaned) ? cleaned : RUNTIME_FALLBACKS.summary
}

export function safePrimaryEffects(record: any) {
  const effects = [
    ...list(record?.primary_effects),
    ...list(record?.primaryEffects),
    ...list(record?.effects),
    ...list(record?.best_for),
    ...list(record?.primaryDomain),
  ].filter(isClean)

  return effects.length ? effects : [...RUNTIME_FALLBACKS.primary_effects]
}

export function safeEvidenceGrade(record: any) {
  return (
    text(record?.evidence_grade) ||
    text(record?.evidence_tier) ||
    text(record?.evidenceTier) ||
    text(record?.summary_quality) ||
    RUNTIME_FALLBACKS.evidence_grade
  )
}

export function safeProfileStatus(record: any) {
  return (
    text(record?.profile_status) ||
    text(record?.summary_quality) ||
    text(record?.readiness) ||
    text(record?.status) ||
    RUNTIME_FALLBACKS.profile_status
  )
}

export function normalizeRuntimeRecord(record: any, kind: 'herb' | 'compound' = 'herb') {
  return {
    ...record,
    slug: safeSlug(record),
    summary: safeSummary(record, kind),
    primary_effects: safePrimaryEffects(record),
    evidence_grade: safeEvidenceGrade(record),
    profile_status: safeProfileStatus(record),
    safety_notes: text(record?.safety_notes) || text(record?.safetyNotes) || text(record?.safety) || '',
    affiliate_ready: Boolean(record?.affiliate_ready),
    affiliate_query: text(record?.affiliate_query) || text(record?.name) || '',
  }
}
