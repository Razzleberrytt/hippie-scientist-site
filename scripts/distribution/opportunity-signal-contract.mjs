const DEMAND_SIGNAL_KEYS = Object.freeze([
  'searchOpportunity',
  'aiCitationOpportunity',
  'socialSuitability',
  'commercialValue',
  'informationUniqueness',
  'evergreenValue',
])

const MAX_OBSERVATION_AGE_DAYS = 90
const DAY_MS = 24 * 60 * 60 * 1000

function observedValue(value) {
  return value !== null && value !== '' && value !== undefined
}

function validIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.toISOString().slice(0, 10) === value
}

function observationAgeDays(value, now) {
  const observed = new Date(`${value}T00:00:00Z`).getTime()
  const current = new Date(now)
  const today = Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate())
  return Math.floor((today - observed) / DAY_MS)
}

export function validateOpportunitySignals(signals, { now = new Date() } = {}) {
  const errors = []
  if (!signals || Array.isArray(signals) || typeof signals !== 'object') {
    return { valid: false, errors: ['opportunity signals must be an object keyed by governed research-object id'] }
  }

  const current = new Date(now)
  if (Number.isNaN(current.getTime())) {
    return { valid: false, errors: ['opportunity signal validation clock must be a valid date'] }
  }

  for (const [id, record] of Object.entries(signals)) {
    if (!record || Array.isArray(record) || typeof record !== 'object') {
      errors.push(`${id}: signal record must be an object`)
      continue
    }
    const observed = DEMAND_SIGNAL_KEYS.filter((key) => observedValue(record[key]))
    for (const key of observed) {
      const value = record[key]
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        errors.push(`${id}: ${key} must be a finite number between 0 and 10`)
        continue
      }
      if (value < 0 || value > 10) errors.push(`${id}: ${key} must be between 0 and 10`)
    }
    if (!observed.length) continue
    const provenance = record.provenance
    if (!provenance || Array.isArray(provenance) || typeof provenance !== 'object') {
      errors.push(`${id}: observed demand signals require provenance`)
      continue
    }
    if (!String(provenance.source || '').trim()) errors.push(`${id}: provenance.source is required`)
    if (!validIsoDate(provenance.observedThrough)) {
      errors.push(`${id}: provenance.observedThrough must be a real YYYY-MM-DD date`)
    } else {
      const ageDays = observationAgeDays(provenance.observedThrough, current)
      if (ageDays < 0) errors.push(`${id}: provenance.observedThrough cannot be in the future`)
      if (ageDays > MAX_OBSERVATION_AGE_DAYS) errors.push(`${id}: provenance.observedThrough is stale; observed demand must be verified within ${MAX_OBSERVATION_AGE_DAYS} days`)
    }
    if (!Number.isInteger(provenance.denominator) || provenance.denominator <= 0) errors.push(`${id}: provenance.denominator must be a positive integer for observed demand`)
    if (!String(provenance.method || '').trim()) errors.push(`${id}: provenance.method is required`)
    if (!Array.isArray(provenance.fields) || !observed.every((key) => provenance.fields.includes(key))) {
      errors.push(`${id}: provenance.fields must enumerate every observed demand signal`)
    }
  }

  return { valid: errors.length === 0, errors }
}

export { DEMAND_SIGNAL_KEYS, MAX_OBSERVATION_AGE_DAYS }
