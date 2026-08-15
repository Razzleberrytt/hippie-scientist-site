export type ProfileResearchMaturity = 'established' | 'emerging' | 'preliminary' | 'theoretical'

export type ProfilePresentationPolicy = {
  maturity: ProfileResearchMaturity
  templateDepth: 'rich' | 'standard' | 'short'
  keepNearTop: readonly ['conclusion', 'safety', 'evidence', 'dose']
  collapseMechanisms: boolean
  maxRelatedLinks: number
  minUniqueValueRatio: number
}

function value(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const candidate = record[key]
    if (candidate != null && String(candidate).trim()) return String(candidate).trim()
  }
  return ''
}

function count(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const candidate = Number(record[key])
    if (Number.isFinite(candidate) && candidate >= 0) return candidate
  }
  return 0
}

export function getProfileResearchMaturity(record: Record<string, unknown>): ProfileResearchMaturity {
  const label = value(record, ['evidence_grade', 'evidence_tier', 'evidenceTier', 'evidence_level', 'evidenceLevel']).toLowerCase()
  const humanStudies = count(record, ['human_study_count', 'humanStudyCount', 'human_trials', 'humanTrials'])
  const profileStatus = value(record, ['profile_status', 'review_status', 'summary_quality']).toLowerCase()

  if (/\b(a|strong|high)\b/.test(label) && humanStudies >= 2) return 'established'
  if (/\b(b|moderate)\b/.test(label) || humanStudies >= 2 || /complete|commercial_ready/.test(profileStatus)) return 'emerging'
  if (/\b(c|d|limited|preliminary|insufficient)\b/.test(label) || humanStudies === 1) return 'preliminary'
  return 'theoretical'
}

export function getProfilePresentationPolicy(record: Record<string, unknown>): ProfilePresentationPolicy {
  const maturity = getProfileResearchMaturity(record)
  if (maturity === 'established') {
    return {
      maturity,
      templateDepth: 'rich',
      keepNearTop: ['conclusion', 'safety', 'evidence', 'dose'],
      collapseMechanisms: true,
      maxRelatedLinks: 8,
      minUniqueValueRatio: 0.55,
    }
  }
  if (maturity === 'emerging') {
    return {
      maturity,
      templateDepth: 'standard',
      keepNearTop: ['conclusion', 'safety', 'evidence', 'dose'],
      collapseMechanisms: true,
      maxRelatedLinks: 6,
      minUniqueValueRatio: 0.5,
    }
  }
  return {
    maturity,
    templateDepth: 'short',
    keepNearTop: ['conclusion', 'safety', 'evidence', 'dose'],
    collapseMechanisms: true,
    maxRelatedLinks: 4,
    minUniqueValueRatio: 0.45,
  }
}
