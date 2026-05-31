export const EVIDENCE_CONFIDENCE_TIERS = new Set([
  'strong_human',
  'moderate_human',
  'limited_human',
  'mixed',
  'mechanistic_only',
  'insufficient',
])

export const EVIDENCE_SAFETY_SEVERITIES = new Set(['low', 'moderate', 'high'])

export const EVIDENCE_RISK_TYPES = new Set([
  'pregnancy_breastfeeding',
  'sedative_stacking',
  'medication_interaction',
  'next_day_grogginess',
  'kidney_disease',
  'autoimmune',
  'liver',
  'blood_pressure',
  'pediatric',
  'complex_condition',
])

export const EVIDENCE_BLOCKED_TERMS = [
  /\bcure\b/i,
  /\btreats\b/i,
  /\btreatment\b/i,
  /\bprevents\b/i,
  /\bguaranteed\b/i,
  /\bclinically proven\b/i,
  /\bmiracle\b/i,
  /\brisk-free\b/i,
  /\bdoctor recommended\b/i,
  /\bFDA approved\b/i,
  /\bbest supplement\b/i,
  /\bno side effects\b/i,
]

function clean(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function requireFields(record, fields, label, errors) {
  for (const field of fields) {
    if (!clean(record?.[field])) errors.push(`${label} missing required field: ${field}`)
  }
}

function checkBlockedTerms(record, fields, label, errors) {
  for (const field of fields) {
    const value = clean(record?.[field])
    if (!value) continue
    for (const pattern of EVIDENCE_BLOCKED_TERMS) {
      if (pattern.test(value)) errors.push(`${label} contains blocked term in ${field}`)
    }
  }
}

export function validateEvidenceEnginePayload(payload, options) {
  const goal = options.goal
  const problemField = options.problemField
  const validProblems = options.validProblems
  const errors = []

  if (payload?.goal !== goal) errors.push(`payload goal must be ${goal}`)
  if (!Array.isArray(payload?.claims)) errors.push('payload claims must be an array')
  if (!Array.isArray(payload?.safetyNotes)) errors.push('payload safetyNotes must be an array')
  if (!payload?.sourcesByClaim || typeof payload.sourcesByClaim !== 'object' || Array.isArray(payload.sourcesByClaim)) {
    errors.push('payload sourcesByClaim must be an object')
  }

  const claims = Array.isArray(payload?.claims) ? payload.claims : []
  const safetyNotes = Array.isArray(payload?.safetyNotes) ? payload.safetyNotes : []
  const sourcesByClaim = payload?.sourcesByClaim && typeof payload.sourcesByClaim === 'object' ? payload.sourcesByClaim : {}

  for (const claim of claims) {
    const label = `claim ${clean(claim?.claim_id) || '(unknown)'}`
    requireFields(claim, [
      'claim_id',
      'ingredient_slug',
      'ingredient_name',
      problemField,
      'claim_statement',
      'confidence_tier',
      'evidence_summary',
      'limitations',
      'best_fit',
      'not_best_fit',
      'decision_group',
    ], label, errors)

    if (claim?.[problemField] && !validProblems.has(claim[problemField])) {
      errors.push(`${label} has invalid ${problemField}: ${claim[problemField]}`)
    }

    if (claim?.confidence_tier && !EVIDENCE_CONFIDENCE_TIERS.has(claim.confidence_tier)) {
      errors.push(`${label} has invalid confidence_tier: ${claim.confidence_tier}`)
    }

    const sources = sourcesByClaim[claim?.claim_id]
    if (!Array.isArray(sources) || sources.length === 0) {
      errors.push(`${label} must have at least one source`)
    }

    checkBlockedTerms(claim, [
      'claim_statement',
      'evidence_summary',
      'limitations',
      'best_fit',
      'not_best_fit',
      'decision_group',
    ], label, errors)
  }

  for (const [claimId, sources] of Object.entries(sourcesByClaim)) {
    if (!Array.isArray(sources)) {
      errors.push(`sourcesByClaim.${claimId} must be an array`)
      continue
    }

    for (const source of sources) {
      const label = `source ${clean(source?.source_id) || '(unknown)'}`
      requireFields(source, [
        'source_id',
        'claim_id',
        'citation_label',
        'source_type',
        'title',
        'year',
        'url',
      ], label, errors)
    }
  }

  for (const note of safetyNotes) {
    const label = `safety note ${clean(note?.safety_id) || '(unknown)'}`
    requireFields(note, [
      'safety_id',
      'ingredient_slug',
      'risk_type',
      'severity',
      'warning',
      'decision_effect',
    ], label, errors)

    if (note?.risk_type && !EVIDENCE_RISK_TYPES.has(note.risk_type)) {
      errors.push(`${label} has invalid risk_type: ${note.risk_type}`)
    }

    if (note?.severity && !EVIDENCE_SAFETY_SEVERITIES.has(note.severity)) {
      errors.push(`${label} has invalid severity: ${note.severity}`)
    }

    checkBlockedTerms(note, ['warning', 'decision_effect'], label, errors)
  }

  return errors
}
