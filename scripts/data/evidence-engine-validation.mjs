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
  'stimulant_stacking',
  'medication_interaction',
  'anticoagulant_interaction',
  'next_day_grogginess',
  'kidney_disease',
  'autoimmune',
  'liver',
  'blood_pressure',
  'gastrointestinal',
  'seizure_risk',
  'allergic_reaction',
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

function isRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function isSafeExternalUrl(value) {
  const text = clean(value)
  if (!text) return false
  try {
    const url = new URL(text)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
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
  if (!isRecord(payload?.problemLabels)) {
    errors.push('payload problemLabels must be an object')
  }
  if (!isRecord(payload?.sourcesByClaim)) {
    errors.push('payload sourcesByClaim must be an object')
  }

  const claims = Array.isArray(payload?.claims) ? payload.claims : []
  const safetyNotes = Array.isArray(payload?.safetyNotes) ? payload.safetyNotes : []
  const problemLabels = isRecord(payload?.problemLabels)
    ? payload.problemLabels
    : {}
  const sourcesByClaim = isRecord(payload?.sourcesByClaim) ? payload.sourcesByClaim : {}
  const claimIds = new Set()

  for (const [problemKey, problemLabel] of Object.entries(problemLabels)) {
    if (!clean(problemKey)) errors.push('problemLabels must not include empty keys')
    if (!validProblems.has(problemKey)) errors.push(`problemLabels has unsupported key: ${problemKey}`)
    if (!isRecord(problemLabel)) {
      errors.push(`problemLabels.${problemKey} must be an object`)
      continue
    }
    requireFields(problemLabel, ['title', 'description'], `problemLabels.${problemKey}`, errors)
  }

  for (const claim of claims) {
    if (!isRecord(claim)) {
      errors.push('payload claims must contain only objects')
      continue
    }
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

    if (claim?.claim_id) {
      if (claimIds.has(claim.claim_id)) errors.push(`${label} duplicates claim_id`)
      claimIds.add(claim.claim_id)
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
    if (!claimIds.has(claimId)) errors.push(`sourcesByClaim.${claimId} does not match a published claim`)
    if (!Array.isArray(sources)) {
      errors.push(`sourcesByClaim.${claimId} must be an array`)
      continue
    }

    for (const source of sources) {
      if (!isRecord(source)) {
        errors.push(`sourcesByClaim.${claimId} must contain only source objects`)
        continue
      }
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

      if (source?.claim_id && source.claim_id !== claimId) {
        errors.push(`${label} claim_id must match sourcesByClaim key: ${claimId}`)
      }

      if (source?.url && !isSafeExternalUrl(source.url)) {
        errors.push(`${label} has invalid url: ${source.url}`)
      }
    }
  }

  for (const note of safetyNotes) {
    if (!isRecord(note)) {
      errors.push('payload safetyNotes must contain only objects')
      continue
    }
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
