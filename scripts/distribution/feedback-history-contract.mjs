export const FEEDBACK_HISTORY_SCHEMA_VERSION = 'distribution-observation-history-v1'

function clean(value) {
  return String(value ?? '').trim()
}

function finiteNonNegative(value) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function finiteRate(value) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 && number <= 1 ? number : null
}

function parseDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function validateFeedbackHistoryEnvelope(input) {
  const errors = []
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['feedback history must be a normalized observation-history object'], history: [] }
  }
  if (input.schemaVersion !== FEEDBACK_HISTORY_SCHEMA_VERSION) {
    errors.push(`feedback history schemaVersion must be ${FEEDBACK_HISTORY_SCHEMA_VERSION}`)
  }
  if (!Array.isArray(input.history)) errors.push('feedback history must contain a history array')
  if (input.counts && Number(input.counts.accepted) !== input.history?.length) {
    errors.push('feedback history counts.accepted must equal history length')
  }

  const history = Array.isArray(input.history) ? input.history : []
  const seenObservationIds = new Set()
  history.forEach((entry, index) => {
    const prefix = `history[${index}]`
    for (const field of ['observationId','lifecycleId','identityFingerprint','candidateId','platform','angleKey']) {
      if (!clean(entry?.[field])) errors.push(`${prefix}.${field} is required`)
    }
    const publishedAt = parseDate(entry?.publishedAt)
    const observedFrom = parseDate(entry?.observedFrom)
    const observedTo = parseDate(entry?.observedTo)
    const capturedAt = parseDate(entry?.capturedAt)
    if (!publishedAt) errors.push(`${prefix}.publishedAt must be a valid date`)
    if (!observedFrom) errors.push(`${prefix}.observedFrom must be a valid date`)
    if (!observedTo) errors.push(`${prefix}.observedTo must be a valid date`)
    if (!capturedAt) errors.push(`${prefix}.capturedAt must be a valid date`)
    if (publishedAt && observedFrom && observedFrom < publishedAt) errors.push(`${prefix}.observedFrom cannot predate publication`)
    if (observedFrom && observedTo && observedTo < observedFrom) errors.push(`${prefix}.observedTo cannot predate observedFrom`)
    if (observedTo && capturedAt && capturedAt < observedTo) errors.push(`${prefix}.capturedAt cannot predate observedTo`)

    const views = finiteNonNegative(entry?.assetViews)
    const visits = finiteNonNegative(entry?.qualifiedVisits)
    const completionRate = finiteRate(entry?.completionRate)
    const saveRate = finiteRate(entry?.saveRate)
    if (views === null) errors.push(`${prefix}.assetViews must be non-negative and finite`)
    if (visits === null) errors.push(`${prefix}.qualifiedVisits must be non-negative and finite`)
    if (views !== null && visits !== null && visits > views) errors.push(`${prefix}.qualifiedVisits cannot exceed assetViews`)
    if (completionRate === null) errors.push(`${prefix}.completionRate must be between 0 and 1`)
    if (saveRate === null) errors.push(`${prefix}.saveRate must be between 0 and 1`)

    const observationId = clean(entry?.observationId)
    if (observationId) {
      if (seenObservationIds.has(observationId)) errors.push(`${prefix}.observationId is duplicated`)
      seenObservationIds.add(observationId)
    }
  })

  return { valid: errors.length === 0, errors, history }
}

export function assertValidFeedbackHistoryEnvelope(input) {
  const result = validateFeedbackHistoryEnvelope(input)
  if (!result.valid) throw new Error(`distribution feedback history invalid:\n- ${result.errors.join('\n- ')}`)
  return result.history
}
