import crypto from 'node:crypto'

const DAY_MS = 86400000
const DEFAULT_MAX_CAPTURE_AGE_DAYS = 35

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

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function publishedReceipt(lifecycle) {
  const receipts = Array.isArray(lifecycle?.receipts) ? lifecycle.receipts : []
  return receipts.find((receipt) => receipt?.state === 'published' && clean(receipt.externalId)) || null
}

function canonicalCandidateKey(candidate) {
  return `${clean(candidate?.id)}|${clean(candidate?.platform)}`
}

function normalizeObservation(raw, lifecycle, candidate, now, maxCaptureAgeDays) {
  const reasons = []
  const receipt = publishedReceipt(lifecycle)
  if (!lifecycle || lifecycle.schemaVersion !== 'distribution-lifecycle-v1') reasons.push('missing or invalid lifecycle record')
  if (!receipt) reasons.push('lifecycle has no confirmed published receipt')

  const identity = lifecycle?.identity || {}
  if (clean(raw?.lifecycleId) !== clean(lifecycle?.lifecycleId)) reasons.push('lifecycleId mismatch')
  if (clean(raw?.identityFingerprint) !== clean(identity?.fingerprint)) reasons.push('identity fingerprint mismatch')
  if (clean(raw?.provider) !== clean(receipt?.provider)) reasons.push('provider mismatch')
  if (clean(raw?.publicationExternalId) !== clean(receipt?.externalId)) reasons.push('publication externalId mismatch')
  if (clean(raw?.candidateId) !== clean(identity?.researchObjectId)) reasons.push('candidateId mismatch')
  if (clean(raw?.platform) !== clean(identity?.platform)) reasons.push('platform mismatch')
  if (clean(raw?.format) !== clean(identity?.format)) reasons.push('format mismatch')
  if (clean(raw?.sourceUrl) !== clean(identity?.sourceUrl)) reasons.push('canonical source URL mismatch')
  if (clean(raw?.contentHash) !== clean(identity?.researchObjectHash)) reasons.push('research object content hash mismatch')
  if (clean(raw?.taggedDestination) !== clean(identity?.taggedDestination)) reasons.push('tagged destination mismatch')
  if (clean(candidate?.id) !== clean(identity?.researchObjectId) || clean(candidate?.platform) !== clean(identity?.platform)) reasons.push('candidate binding mismatch')
  if (clean(raw?.angleKey) !== clean(candidate?.angleKey)) reasons.push('angleKey mismatch')

  const observedFrom = parseDate(raw?.observedFrom)
  const observedTo = parseDate(raw?.observedTo)
  const capturedAt = parseDate(raw?.capturedAt)
  const publishedAt = parseDate(receipt?.at)
  if (!observedFrom || !observedTo || !capturedAt || !publishedAt) reasons.push('invalid observation or publication timestamp')
  if (observedFrom && observedTo && observedFrom > observedTo) reasons.push('observation window is reversed')
  if (publishedAt && observedFrom && observedFrom < publishedAt) reasons.push('observation window starts before publication')
  if (observedTo && capturedAt && capturedAt < observedTo) reasons.push('capture timestamp predates observation window end')
  if (capturedAt && capturedAt > now) reasons.push('capture timestamp is in the future')
  if (capturedAt && (now.getTime() - capturedAt.getTime()) / DAY_MS > maxCaptureAgeDays) reasons.push('observation capture is stale')

  const assetViews = finiteNonNegative(raw?.assetViews)
  const qualifiedVisits = finiteNonNegative(raw?.qualifiedVisits)
  const completionRate = finiteRate(raw?.completionRate)
  const saveRate = finiteRate(raw?.saveRate)
  if (assetViews === null) reasons.push('assetViews must be a non-negative finite number')
  if (qualifiedVisits === null) reasons.push('qualifiedVisits must be a non-negative finite number')
  if (completionRate === null) reasons.push('completionRate must be between 0 and 1')
  if (saveRate === null) reasons.push('saveRate must be between 0 and 1')
  if (assetViews !== null && qualifiedVisits !== null && qualifiedVisits > assetViews) reasons.push('qualifiedVisits cannot exceed assetViews')

  const normalized = {
    candidateId: clean(identity?.researchObjectId),
    platform: clean(identity?.platform),
    format: clean(identity?.format),
    angleKey: clean(candidate?.angleKey),
    lifecycleId: clean(lifecycle?.lifecycleId),
    identityFingerprint: clean(identity?.fingerprint),
    sourceUrl: clean(identity?.sourceUrl),
    contentHash: clean(identity?.researchObjectHash),
    taggedDestination: clean(identity?.taggedDestination),
    provider: clean(receipt?.provider),
    publicationExternalId: clean(receipt?.externalId),
    publishedAt: clean(receipt?.at),
    observedFrom: observedFrom?.toISOString() || null,
    observedTo: observedTo?.toISOString() || null,
    capturedAt: capturedAt?.toISOString() || null,
    assetViews,
    qualifiedVisits,
    completionRate,
    saveRate,
    attributionRisk: clean(raw?.attributionRisk) || 'platform distribution and audience mix may confound performance; cross-platform observations are never pooled',
    observationOnly: true,
  }
  const observationId = sha256(stableJson(normalized))
  return { valid: reasons.length === 0, reasons, normalized: { observationId, ...normalized } }
}

export function ingestDistributionObservations(lifecycles = [], rawObservations = [], candidates = [], {
  now = new Date(),
  maxCaptureAgeDays = DEFAULT_MAX_CAPTURE_AGE_DAYS,
} = {}) {
  const lifecycleById = new Map((Array.isArray(lifecycles) ? lifecycles : []).map((record) => [clean(record?.lifecycleId), record]))
  const candidateByKey = new Map((Array.isArray(candidates) ? candidates : []).map((candidate) => [canonicalCandidateKey(candidate), candidate]))
  const accepted = []
  const rejected = []
  const seen = new Set()

  for (const raw of Array.isArray(rawObservations) ? rawObservations : []) {
    const lifecycle = lifecycleById.get(clean(raw?.lifecycleId))
    const candidate = candidateByKey.get(`${clean(raw?.candidateId)}|${clean(raw?.platform)}`)
    const result = normalizeObservation(raw, lifecycle, candidate, now, maxCaptureAgeDays)
    if (!result.valid) {
      rejected.push({ input: structuredClone(raw), reasons: result.reasons.sort() })
      continue
    }
    if (seen.has(result.normalized.observationId)) {
      rejected.push({ input: structuredClone(raw), reasons: ['duplicate normalized observation'] })
      continue
    }
    seen.add(result.normalized.observationId)
    accepted.push(result.normalized)
  }

  accepted.sort((a, b) => a.capturedAt.localeCompare(b.capturedAt) || a.observationId.localeCompare(b.observationId))
  const history = accepted.map((entry) => ({
    candidateId: entry.candidateId,
    platform: entry.platform,
    angleKey: entry.angleKey,
    publishedAt: entry.publishedAt,
    assetViews: entry.assetViews,
    qualifiedVisits: entry.qualifiedVisits,
    completionRate: entry.completionRate,
    saveRate: entry.saveRate,
    observationId: entry.observationId,
    lifecycleId: entry.lifecycleId,
    identityFingerprint: entry.identityFingerprint,
    observedFrom: entry.observedFrom,
    observedTo: entry.observedTo,
    capturedAt: entry.capturedAt,
    attributionRisk: entry.attributionRisk,
  }))

  return {
    schemaVersion: 'distribution-observation-history-v1',
    status: accepted.length ? 'observed' : 'waiting-for-qualified-observations',
    generatedAt: now.toISOString(),
    policy: 'Observations may re-rank already-eligible distribution opportunities only; they cannot alter scientific evidence, claims, limitations, grades, safety conclusions, canonical content, or cross-platform attribution boundaries.',
    accepted,
    rejected,
    history,
    counts: { accepted: accepted.length, rejected: rejected.length },
  }
}
