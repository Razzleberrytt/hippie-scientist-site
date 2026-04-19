import { cleanEffectChips, isJunk, sanitizeSummaryText, splitClean } from '@/lib/sanitize'

export type ProfileStatus = 'complete' | 'partial' | 'minimal'
export type SummaryQuality = 'strong' | 'weak' | 'none'

function normalizeStatus(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function getProfileStatus(input: Record<string, unknown> | undefined | null): ProfileStatus {
  const status = normalizeStatus(input?.profile_status ?? input?.profileStatus)
  if (status === 'minimal' || status === 'partial' || status === 'complete') return status
  return 'complete'
}

export function getSummaryQuality(input: Record<string, unknown> | undefined | null): SummaryQuality {
  const quality = normalizeStatus(input?.summary_quality ?? input?.summaryQuality)
  if (quality === 'none' || quality === 'weak' || quality === 'strong') return quality
  return 'strong'
}

export function getPrimaryEffects(input: Record<string, unknown> | undefined | null, maxItems = 4): string[] {
  return cleanEffectChips(splitClean(input?.primary_effects ?? input?.primaryEffects), maxItems)
}

export function shouldRenderSummary(profileStatus: ProfileStatus, summaryQuality: SummaryQuality): boolean {
  if (summaryQuality === 'none') return false
  if (profileStatus === 'minimal') return false
  return true
}

export function resolveHeroSummary(
  input: Record<string, unknown> | undefined | null,
  maxSentences = 1,
): string {
  const summary = sanitizeSummaryText(input?.summary || input?.description || '', maxSentences)
  return isJunk(summary) ? '' : summary
}

export function resolveCoreInsight(
  input: Record<string, unknown> | undefined | null,
  maxSentences = 1,
): string {
  const insight = sanitizeSummaryText(input?.whyItMatters || '', maxSentences)
  return isJunk(insight) ? '' : insight
}
