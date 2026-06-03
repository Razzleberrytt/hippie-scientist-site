export type SemanticFreshnessResult = {
  freshnessScore: number
  authorityFreshness: number
  researchVelocity: number
  emergingInterestScore: number
  confidence: 'low' | 'moderate' | 'strong'
  reasons: string[]
}

function parseDate(value: unknown) {
  if (typeof value !== 'string') return null

  const parsed = new Date(value)

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed
}

function daysBetween(date: Date) {
  const now = Date.now()
  return Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24))
}

export function calculateSemanticFreshness(record: any): SemanticFreshnessResult {
  const reasons: string[] = []

  const updatedAt = parseDate(
    record?.updatedAt ||
      record?.last_updated ||
      record?.authority_last_reviewed,
  )

  let freshnessScore = 25

  if (updatedAt) {
    const age = daysBetween(updatedAt)

    if (age <= 30) {
      freshnessScore = 100
      reasons.push('recently-reviewed')
    } else if (age <= 90) {
      freshnessScore = 82
      reasons.push('actively-maintained')
    } else if (age <= 180) {
      freshnessScore = 68
      reasons.push('stable-review-window')
    } else if (age <= 365) {
      freshnessScore = 52
      reasons.push('aging-authority')
    } else {
      freshnessScore = 36
      reasons.push('stale-review-window')
    }
  } else {
    reasons.push('missing-review-date')
  }

  let researchVelocity = 40

  if (record?.emerging_interest_score) {
    researchVelocity += Math.min(Number(record.emerging_interest_score), 40)
    reasons.push('emerging-interest')
  }

  if (record?.research_velocity) {
    researchVelocity += Math.min(Number(record.research_velocity), 30)
    reasons.push('research-velocity')
  }

  const authorityFreshness = Math.min(
    Math.round((freshnessScore * 0.7) + (researchVelocity * 0.3)),
    100,
  )

  const emergingInterestScore = Math.min(
    researchVelocity,
    100,
  )

  const confidence: 'low' | 'moderate' | 'strong' =
    authorityFreshness >= 75
      ? 'strong'
      : authorityFreshness >= 45
        ? 'moderate'
        : 'low'

  return {
    freshnessScore,
    authorityFreshness,
    researchVelocity,
    emergingInterestScore,
    confidence,
    reasons,
  }
}
