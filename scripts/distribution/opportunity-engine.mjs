const PLATFORM_WEIGHTS = Object.freeze({
  'short-video': { socialSuitability: 3, informationUniqueness: 2, evidenceStrength: 2, productionCost: -1 },
  carousel: { informationUniqueness: 3, evidenceStrength: 3, socialSuitability: 2, productionCost: -1 },
  infographic: { informationUniqueness: 3, evidenceStrength: 3, searchOpportunity: 2, productionCost: -2 },
  pinterest: { evergreenValue: 3, informationUniqueness: 2, socialSuitability: 2, productionCost: -1 },
  newsletter: { evidenceStrength: 3, commercialValue: 2, freshness: 2, productionCost: -1 },
})

const GRADE_SCORE = Object.freeze({ A: 10, B: 8, C: 5, D: 2, 'Avoid/Insufficient': 0 })
const HUMAN_CONTEXT = /human|randomi[sz]ed|clinical|trial/i
const PRECLINICAL_CONTEXT = /animal|mouse|mice|rat|preclinical|in vitro|cell/i

function clamp(value, min = 0, max = 10) {
  const number = Number(value)
  if (!Number.isFinite(number)) return min
  return Math.max(min, Math.min(max, number))
}

function signal(signals, id, key, fallback = 0) {
  return clamp(signals?.[id]?.[key] ?? fallback)
}

function daysSince(date, now = new Date()) {
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return Infinity
  return Math.max(0, Math.floor((now.getTime() - parsed.getTime()) / 86400000))
}

function stableToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildDestination(object, platform) {
  const canonicalUrl = String(object.sourceUrl)
  const tagged = new URL(canonicalUrl)
  tagged.searchParams.set('utm_source', 'distribution-engine')
  tagged.searchParams.set('utm_medium', 'organic')
  tagged.searchParams.set('utm_campaign', 'evidence-to-distribution')
  tagged.searchParams.set('utm_content', `${stableToken(object.id)}-${stableToken(platform)}`)
  return {
    canonicalUrl,
    taggedUrl: tagged.toString(),
    attribution: {
      source: 'distribution-engine',
      medium: 'organic',
      campaign: 'evidence-to-distribution',
      content: `${stableToken(object.id)}-${stableToken(platform)}`,
    },
  }
}

function buildDiscoverability(object, platform) {
  const title = `${object.title} | Evidence snapshot`
  const description = `${object.finding} Key limitation: ${object.limitation}`
  const caption = `${object.finding}\n\nKey limitation: ${object.limitation}\n\nSource: ${object.sourceUrl}`
  return {
    title,
    description,
    caption,
    assetFormat: platform,
    canonicalSource: object.sourceUrl,
    policy: 'Lossless governed copy only; distribution metadata must not strengthen, shorten away, or reinterpret scientific claims.',
  }
}

export function assessEligibility(object, { now = new Date() } = {}) {
  const reasons = []
  if (!object || typeof object !== 'object') reasons.push('candidate must be an object')
  if (!String(object?.id || '').trim()) reasons.push('missing governed research-object id')
  if (!String(object?.sourceUrl || '').startsWith('https://thehippiescientist.net/')) reasons.push('sourceUrl must be a first-party evidence page')
  if (!String(object?.finding || '').trim()) reasons.push('missing governed finding')
  if (!String(object?.limitation || '').trim()) reasons.push('missing governed limitation')
  if (!(object?.evidenceGrade in GRADE_SCORE)) reasons.push('unsupported evidence grade')
  const staleDays = daysSince(object?.lastVerified, now)
  if (!Number.isFinite(staleDays)) reasons.push('invalid verification date')
  if (staleDays > 550) reasons.push('evidence verification is too stale for autonomous distribution selection')
  const context = `${object?.evidenceType || ''} ${object?.finding || ''}`
  const claimRisk = PRECLINICAL_CONTEXT.test(context) ? 9 : HUMAN_CONTEXT.test(context) ? 3 : 6
  if (claimRisk >= 9) reasons.push('preclinical-only candidate is not eligible for the first autonomous distribution MVP')
  return { eligible: reasons.length === 0, reasons, staleDays, claimRisk }
}

function choosePlatform(metrics) {
  const scored = Object.entries(PLATFORM_WEIGHTS).map(([platform, weights]) => {
    const score = Object.entries(weights).reduce((total, [key, weight]) => total + clamp(metrics[key]) * weight, 0)
    return { platform, score }
  })
  scored.sort((a, b) => b.score - a.score || a.platform.localeCompare(b.platform))
  return scored[0]
}

function buildAngle(object, platform) {
  const grade = String(object.evidenceGrade)
  if (platform === 'short-video') return `What the evidence actually shows about ${object.title} — finding first, limitation on screen, grade ${grade}`
  if (platform === 'carousel') return `${object.title}: finding → evidence grade → key limitation → source trail`
  if (platform === 'infographic') return `${object.title}: one-page evidence snapshot with finding, grade ${grade}, limitation, and source trail`
  if (platform === 'pinterest') return `${object.title}: evergreen evidence snapshot with limitation and canonical source`
  return `${object.title}: evidence update with finding, limitation, grade ${grade}, and source trail`
}

export function scoreDistributionCandidate(object, signals = {}, options = {}) {
  const eligibility = assessEligibility(object, options)
  const evidenceStrength = clamp(GRADE_SCORE[object?.evidenceGrade] ?? 0)
  const freshness = clamp(10 - Math.floor((eligibility.staleDays || 0) / 45))
  const metrics = {
    impact: signal(signals, object?.id, 'impact', 7),
    urgency: signal(signals, object?.id, 'urgency', 5),
    breadth: signal(signals, object?.id, 'breadth', 6),
    confidence: signal(signals, object?.id, 'confidence', evidenceStrength),
    compoundingLeverage: signal(signals, object?.id, 'compoundingLeverage', 8),
    opportunityAge: signal(signals, object?.id, 'opportunityAge', 3),
    reversibility: signal(signals, object?.id, 'reversibility', 10),
    technicalDebtInterest: signal(signals, object?.id, 'technicalDebtInterest', 4),
    effort: signal(signals, object?.id, 'effort', 3),
    regressionRisk: signal(signals, object?.id, 'regressionRisk', 2),
    blastRadius: signal(signals, object?.id, 'blastRadius', 2),
    searchOpportunity: signal(signals, object?.id, 'searchOpportunity', 5),
    aiCitationOpportunity: signal(signals, object?.id, 'aiCitationOpportunity', 5),
    socialSuitability: signal(signals, object?.id, 'socialSuitability', 6),
    commercialValue: signal(signals, object?.id, 'commercialValue', 4),
    informationUniqueness: signal(signals, object?.id, 'informationUniqueness', 6),
    existingAssetSaturation: signal(signals, object?.id, 'existingAssetSaturation', 0),
    cannibalizationRisk: signal(signals, object?.id, 'cannibalizationRisk', 1),
    productionCost: signal(signals, object?.id, 'productionCost', 3),
    evergreenValue: signal(signals, object?.id, 'evergreenValue', 7),
    freshness,
    evidenceStrength,
  }
  const score = 3 * metrics.impact + 2 * metrics.urgency + 2 * metrics.breadth + 2 * metrics.confidence + 2 * metrics.compoundingLeverage + metrics.opportunityAge + metrics.reversibility + metrics.technicalDebtInterest - metrics.effort - 2 * metrics.regressionRisk - metrics.blastRadius - metrics.existingAssetSaturation - metrics.cannibalizationRisk - eligibility.claimRisk
  const platform = choosePlatform(metrics)
  return {
    id: object?.id || null,
    eligible: eligibility.eligible,
    ineligibleReasons: eligibility.reasons,
    score,
    sourceUrl: object?.sourceUrl || null,
    platform: platform.platform,
    platformScore: platform.score,
    angle: object ? buildAngle(object, platform.platform) : null,
    destination: object ? buildDestination(object, platform.platform) : null,
    discoverability: object ? buildDiscoverability(object, platform.platform) : null,
    metrics,
    guardrails: [
      'Use only the governed finding/public-safe claim from the validated media pack.',
      'Preserve the governed limitation in every complete caption/script and on-screen where factual interpretation depends on it.',
      'Do not convert study dose/form context into consumer dosing instructions.',
      'Do not strengthen preclinical evidence into human benefit language.',
      'Canonical destination must remain the governed sourceUrl.',
    ],
    successCriteria: {
      primaryMetric: 'qualified visits to canonical evidence page from tagged distribution links',
      secondaryMetrics: ['asset completion/save rate', 'search impressions/clicks for destination page', 'AI citation/mention visibility'],
      measurementWindowDays: 28,
      attributionRisk: 'medium',
    },
  }
}

export function selectDistributionOpportunity(objects, signals = {}, options = {}) {
  const candidates = (Array.isArray(objects) ? objects : []).map((object) => scoreDistributionCandidate(object, signals, options))
  const eligible = candidates.filter((candidate) => candidate.eligible)
  eligible.sort((a, b) => b.score - a.score || b.platformScore - a.platformScore || String(a.id).localeCompare(String(b.id)))
  return {
    schemaVersion: '1.0.0',
    status: eligible.length ? 'selected' : 'waiting-for-governed-object',
    selected: eligible[0] || null,
    candidates,
  }
}
