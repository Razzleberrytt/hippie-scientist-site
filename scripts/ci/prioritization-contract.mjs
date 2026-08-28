const CONFIDENCE_LEVELS = [0.5, 0.75, 1]
const MS_PER_DAY = 86_400_000

export const PRIORITIZATION_FORMULA = 'Score = (Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence) / Effort'
export const EXTERNAL_CONTINGENCIES = new Set(['external-demand', 'production-state', 'analytics', 'platform-behavior', 'technical-assumption'])

const assertScale = (name, value) => {
  if (!Number.isInteger(value) || value < 1 || value > 5) throw new Error(`${name} must be an integer from 1 to 5`)
}

const parseDay = (value, name) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${name} must be YYYY-MM-DD`)
  const time = Date.parse(`${value}T00:00:00Z`)
  if (!Number.isFinite(time)) throw new Error(`${name} is invalid`)
  return time
}

export function score(item) {
  for (const [name, value] of [
    ['businessImpact', item.businessImpact], ['userValue', item.userValue], ['trafficPotential', item.trafficPotential],
    ['strategicLeverage', item.strategicLeverage], ['effort', item.effort],
  ]) assertScale(name, value)
  if (!CONFIDENCE_LEVELS.includes(item.confidence)) throw new Error('confidence must be 0.5, 0.75, or 1')
  return (item.businessImpact * item.userValue * item.trafficPotential * item.strategicLeverage * item.confidence) / item.effort
}

export function evaluateFreshness(item, { now }) {
  const contingencies = [...new Set(item.contingencies || [])].sort()
  const external = contingencies.some((entry) => EXTERNAL_CONTINGENCIES.has(entry))
  if (!external) return { external: false, status: 'NOT_REQUIRED', confidenceCap: 1, promotable: true, ageDays: null }
  if (!item.lastVerified || !item.verificationScope) {
    return { external: true, status: 'MISSING', confidenceCap: 0.5, promotable: false, ageDays: null }
  }
  const verified = parseDay(item.lastVerified, 'lastVerified')
  const clock = parseDay(now, 'now')
  const ageDays = Math.floor((clock - verified) / MS_PER_DAY)
  if (ageDays < 0) throw new Error('lastVerified may not be in the future')
  if (ageDays <= 30) return { external: true, status: 'CURRENT', confidenceCap: 1, promotable: true, ageDays }
  if (ageDays <= 60) return { external: true, status: 'AGING', confidenceCap: 0.75, promotable: true, ageDays }
  return { external: true, status: 'STALE', confidenceCap: 0.5, promotable: false, ageDays }
}

export function normalizeItem(item, options) {
  const freshness = evaluateFreshness(item, options)
  const confidence = Math.min(item.confidence, freshness.confidenceCap)
  const normalized = { ...item, confidence, freshness }
  normalized.score = score(normalized)
  normalized.promotable = freshness.promotable
  return normalized
}

export function rank(items, options) {
  const normalized = items.map((item) => normalizeItem(item, options))
  return normalized.sort((a, b) => {
    // Safety/reliability/scientific-provenance incidents are hard overrides, never age-discounted scoring bonuses.
    const aOverride = a.override === true ? 1 : 0
    const bOverride = b.override === true ? 1 : 0
    if (aOverride !== bOverride) return bOverride - aOverride
    if (a.promotable !== b.promotable) return Number(b.promotable) - Number(a.promotable)
    if (a.score !== b.score) return b.score - a.score
    return String(a.id).localeCompare(String(b.id))
  })
}

export function validateStrategicLeverageEvidence(item) {
  assertScale('strategicLeverage', item.strategicLeverage)
  if (!Array.isArray(item.leverageEvidence) || item.leverageEvidence.length === 0) throw new Error(`${item.id}: leverageEvidence is required`)
  const permitted = new Set(['dependency-unlock', 'shared-infrastructure', 'recurring-throughput', 'isolated'])
  for (const evidence of item.leverageEvidence) {
    if (!permitted.has(evidence.type)) throw new Error(`${item.id}: unsupported leverage evidence ${evidence.type}`)
    if (typeof evidence.detail !== 'string' || !evidence.detail.trim()) throw new Error(`${item.id}: leverage evidence detail is required`)
  }
  return true
}

export function validatePromotedItem(item, options) {
  validateStrategicLeverageEvidence(item)
  const normalized = normalizeItem(item, options)
  if (!normalized.promotable) throw new Error(`${item.id}: ${normalized.freshness.status} external evidence requires revalidation before promotion`)
  if (item.override === true && !item.overrideReason) throw new Error(`${item.id}: overrideReason is required for a hard-gate override`)
  return normalized
}
