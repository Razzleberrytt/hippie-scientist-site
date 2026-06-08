export type SemanticConfidenceResult = {
  score: number
  confidence: 'low' | 'moderate' | 'strong'
  routingConfidence: number
  retrievalConfidence: number
  semanticStability: number
  recommendationConfidence: number
  reasons: string[]
}

function normalizeBoolean(value: unknown) {
  return Boolean(value)
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : []
}

export function calculateSemanticConfidence(record: any): SemanticConfidenceResult {
  const reasons: string[] = []

  let score = 0

  const summary = normalizeText(
    record?.summary ||
      record?.description ||
      record?.short_earthy_summary,
  )

  if (summary.length >= 120) {
    score += 18
    reasons.push('summary-depth')
  }

  const effects = normalizeList(
    record?.effects ||
      record?.primary_effects,
  )

  if (effects.length >= 3) {
    score += 14
    reasons.push('effect-coverage')
  }

  const mechanisms = normalizeList(record?.mechanisms)

  if (mechanisms.length >= 2) {
    score += 12
    reasons.push('mechanism-coverage')
  }

  if (
    normalizeBoolean(record?.evidence_tier) ||
    normalizeBoolean(record?.evidenceLevel)
  ) {
    score += 16
    reasons.push('evidence-signals')
  }

  if (
    normalizeBoolean(record?.ecosystem_taxonomy) ||
    normalizeBoolean(record?.semantic_priority)
  ) {
    score += 12
    reasons.push('semantic-connectivity')
  }

  if (
    normalizeBoolean(record?.authority_score) ||
    normalizeBoolean(record?.discovery_weight)
  ) {
    score += 10
    reasons.push('authority-weighting')
  }

  if (
    normalizeBoolean(record?.recommendation_weight) ||
    normalizeBoolean(record?.relationship_strength)
  ) {
    score += 8
    reasons.push('recommendation-readiness')
  }

  if (
    normalizeBoolean(record?.updatedAt) ||
    normalizeBoolean(record?.last_updated)
  ) {
    score += 10
    reasons.push('freshness-awareness')
  }

  const capped = Math.min(score, 100)

  const confidence: 'low' | 'moderate' | 'strong' =
    capped >= 75
      ? 'strong'
      : capped >= 45
        ? 'moderate'
        : 'low'

  return {
    score: capped,
    confidence,
    routingConfidence: Math.min(capped * 0.92, 100),
    retrievalConfidence: Math.min(capped * 0.96, 100),
    semanticStability: Math.min(capped * 0.88, 100),
    recommendationConfidence: Math.min(capped * 0.9, 100),
    reasons,
  }
}
