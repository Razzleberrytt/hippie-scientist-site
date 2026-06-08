export type SemanticAuthorityAssessment = {
  canIndex: boolean
  confidence: 'low' | 'moderate' | 'strong'
  reasons: string[]
}

function hasMeaningfulText(value: unknown) {
  return typeof value === 'string' && value.trim().length >= 80
}

function hasMeaningfulList(value: unknown) {
  return Array.isArray(value) && value.length >= 2
}

export function evaluateSemanticAuthority(record: any): SemanticAuthorityAssessment {
  const reasons: string[] = []

  const hasSummary = hasMeaningfulText(
    record?.summary ||
      record?.description ||
      record?.short_earthy_summary ||
      record?.overview,
  )

  const hasEffects = hasMeaningfulList(
    record?.effects ||
      record?.primary_effects ||
      record?.mechanisms,
  )

  const hasEvidenceSignals = Boolean(
    record?.evidence_tier ||
      record?.evidenceLevel ||
      record?.evidence_grade,
  )

  const hasSemanticLinks = Boolean(
    record?.ecosystem_taxonomy ||
      record?.related_slugs ||
      record?.pathways ||
      record?.semantic_priority,
  )

  if (hasSummary) reasons.push('summary-depth')
  if (hasEffects) reasons.push('effect-coverage')
  if (hasEvidenceSignals) reasons.push('evidence-signals')
  if (hasSemanticLinks) reasons.push('semantic-connectivity')

  const score = reasons.length

  if (score >= 4) {
    return {
      canIndex: true,
      confidence: 'strong',
      reasons,
    }
  }

  if (score >= 2) {
    return {
      canIndex: true,
      confidence: 'moderate',
      reasons,
    }
  }

  return {
    canIndex: false,
    confidence: 'low',
    reasons,
  }
}
