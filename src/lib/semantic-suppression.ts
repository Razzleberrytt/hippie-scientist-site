export type SemanticSuppressionDecision = {
  allowed: boolean
  suppressionScore: number
  diversityScore: number
  redundancyPenalty: number
  reasons: string[]
}

function normalizeList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : []
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
}

function overlapRatio(a: string[], b: string[]) {
  const left = new Set(a)
  const right = new Set(b)

  if (left.size === 0 || right.size === 0) {
    return 0
  }

  let overlap = 0

  for (const item of left) {
    if (right.has(item)) {
      overlap += 1
    }
  }

  return overlap / Math.max(left.size, right.size)
}

export function evaluateSemanticSuppression(
  source: any,
  candidate: any,
): SemanticSuppressionDecision {
  const reasons: string[] = []

  const sourceEcosystems = normalizeList(source?.ecosystem_taxonomy)
    .map(normalizeText)

  const candidateEcosystems = normalizeList(candidate?.ecosystem_taxonomy)
    .map(normalizeText)

  const sourceEffects = normalizeList(
    source?.effects || source?.primary_effects,
  ).map(normalizeText)

  const candidateEffects = normalizeList(
    candidate?.effects || candidate?.primary_effects,
  ).map(normalizeText)

  const sourceDiversity = normalizeText(source?.diversity_group)
  const candidateDiversity = normalizeText(candidate?.diversity_group)

  const ecosystemOverlap = overlapRatio(
    sourceEcosystems,
    candidateEcosystems,
  )

  const effectOverlap = overlapRatio(
    sourceEffects,
    candidateEffects,
  )

  let redundancyPenalty = 0

  redundancyPenalty += ecosystemOverlap * 40
  redundancyPenalty += effectOverlap * 35

  if (
    sourceDiversity &&
    candidateDiversity &&
    sourceDiversity === candidateDiversity
  ) {
    redundancyPenalty += 20
    reasons.push('shared-diversity-group')
  }

  if (ecosystemOverlap >= 0.7) {
    reasons.push('high-ecosystem-overlap')
  }

  if (effectOverlap >= 0.7) {
    reasons.push('high-effect-overlap')
  }

  const suppressionScore = Math.min(redundancyPenalty, 100)
  const diversityScore = Math.max(100 - suppressionScore, 0)

  const allowed = suppressionScore < 70

  if (!allowed) {
    reasons.push('suppressed-for-redundancy')
  }

  return {
    allowed,
    suppressionScore,
    diversityScore,
    redundancyPenalty,
    reasons,
  }
}
