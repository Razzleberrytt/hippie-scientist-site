import crypto from 'node:crypto'

const STATES = new Set([
  'QUEUED',
  'DISPATCHING',
  'PROVIDER_ACCEPTED',
  'AWAITING_USER_POST',
  'PUBLISHED',
  'FAILED',
  'NEEDS_RECONCILIATION',
  'CANCELLED',
])

function clean(value) {
  return String(value ?? '').trim()
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

function iso(value, label) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error(`${label} must be a valid timestamp`)
  return date.toISOString()
}

function assertSha(value, label) {
  const normalized = clean(value).toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(normalized)) throw new Error(`${label} must be a SHA-256 hex digest`)
  return normalized
}

function assertPlatform(value) {
  const platform = clean(value).toLowerCase()
  if (!/^[a-z0-9][a-z0-9._-]{1,31}$/.test(platform)) throw new Error('publication platform is invalid')
  return platform
}

function assertJob(job) {
  if (!job || job.schemaVersion !== 'ths-publication-job-v1') throw new Error('invalid THS publication job')
  if (!STATES.has(job.state)) throw new Error('THS publication job has invalid state')
  if (!clean(job.publicationId) || clean(job.publicationId) !== clean(job.identity?.publicationId)) {
    throw new Error('THS publication job identity mismatch')
  }
  if (!Array.isArray(job.attempts)) throw new Error('THS publication job attempts must be an array')
  if (job.providerReceipts !== undefined && !Array.isArray(job.providerReceipts)) throw new Error('THS publication providerReceipts must be an array')
  if (job.observerReceipts !== undefined && !Array.isArray(job.observerReceipts)) throw new Error('THS publication observerReceipts must be an array')
}

export function deriveExperimentId({ experimentId, taggedDestination } = {}) {
  const explicit = clean(experimentId)
  if (explicit) return explicit
  const tagged = clean(taggedDestination)
  if (!tagged) throw new Error('publication identity requires experimentId or taggedDestination')
  let url
  try { url = new URL(tagged) } catch { throw new Error('publication taggedDestination is invalid') }
  const derived = clean(url.searchParams.get('utm_content'))
  if (!derived) throw new Error('publication taggedDestination is missing utm_content experiment identity')
  return derived
}

export function artifactBundleSha256(media = []) {
  if (!Array.isArray(media) || media.length === 0) throw new Error('publication artifact identity requires media')
  const normalized = media.map((item) => ({
    file: clean(item?.file),
    sha256: assertSha(item?.sha256, 'publication media sha256'),
  }))
  if (normalized.some((item) => !item.file)) throw new Error('publication artifact identity requires media filenames')
  normalized.sort((a, b) => a.file.localeCompare(b.file))
  if (normalized.length === 1) return normalized[0].sha256
  return sha256(stableJson(normalized))
}

export function buildPublicationIdentity({
  experimentId,
  artifactSha256,
  platform,
  intendedTime,
} = {}) {
  const normalized = {
    experimentId: clean(experimentId),
    artifactSha256: assertSha(artifactSha256, 'publication artifactSha256'),
    platform: assertPlatform(platform),
    intendedTime: iso(intendedTime, 'publication intendedTime'),
  }
  if (!normalized.experimentId) throw new Error('publication identity requires experimentId')
  const publicationId = `pub_${sha256(stableJson(normalized)).slice(0, 24)}`
  return { publicationId, ...normalized }
}

export function createPublicationJob({
  experimentId,
  artifactSha256,
  platform,
  intendedTime,
  lifecycleId,
  identityFingerprint,
  artifactUrls = [],
  format = null,
  now = new Date().toISOString(),
} = {}) {
  const identity = buildPublicationIdentity({ experimentId, artifactSha256, platform, intendedTime })
  const createdAt = iso(now, 'publication createdAt')
  const urls = [...new Set((Array.isArray(artifactUrls) ? artifactUrls : []).map(clean).filter(Boolean))]
  if (!urls.length) throw new Error('publication job requires at least one artifact URL')
  return {
    schemaVersion: 'ths-publication-job-v1',
    publicationId: identity.publicationId,
    state: 'QUEUED',
    identity,
    governance: {
      lifecycleId: clean(lifecycleId) || null,
      identityFingerprint: clean(identityFingerprint) || null,
      format: clean(format) || null,
    },
    artifacts: urls,
    attempts: [],
    providerReceipt: null,
    providerReceipts: [],
    observerReceipts: [],
    failure: null,
    createdAt,
    updatedAt: createdAt,
  }
}

export function createPublicationJobFromGovernedMedia({
  manifest,
  selection,
  platform,
  intendedTime,
  now = new Date().toISOString(),
} = {}) {
  if (!manifest || manifest.status !== 'ready-for-provider') {
    throw new Error('THS Publisher requires a governed provider-ready media manifest')
  }
  const selected = selection?.selected
  if (!selected?.id) throw new Error('THS Publisher requires the selected governed opportunity')
  if (clean(manifest.researchObjectId) !== clean(selected.id)) {
    throw new Error('THS Publisher media does not match the selected governed opportunity')
  }
  const experimentId = deriveExperimentId({
    experimentId: selected?.experimentId,
    taggedDestination: manifest.taggedDestination || selected?.destination?.taggedUrl,
  })
  return createPublicationJob({
    experimentId,
    artifactSha256: artifactBundleSha256(manifest.media),
    platform,
    intendedTime,
    lifecycleId: manifest.lifecycleId,
    identityFingerprint: manifest.identityFingerprint,
    artifactUrls: manifest.media.map((item) => item.url),
    format: manifest.format,
    now,
  })
}

export function beginPublicationAttempt(job, {
  provider,
  now = new Date().toISOString(),
} = {}) {
  assertJob(job)
  const providerId = clean(provider).toLowerCase()
  if (!providerId) throw new Error('publication attempt requires provider')
  if (['PROVIDER_ACCEPTED', 'AWAITING_USER_POST', 'PUBLISHED'].includes(job.state)) {
    return structuredClone(job)
  }
  if (job.state === 'CANCELLED') throw new Error('cancelled publication cannot be dispatched')
  if (job.state === 'NEEDS_RECONCILIATION') throw new Error('publication requires reconciliation before retry')
  if (job.state === 'DISPATCHING') throw new Error('publication already has an active dispatch attempt')
  if (!['QUEUED', 'FAILED'].includes(job.state)) throw new Error(`publication cannot dispatch from ${job.state}`)

  const next = structuredClone(job)
  const at = iso(now, 'publication attempt time')
  const attemptNumber = next.attempts.length + 1
  next.state = 'DISPATCHING'
  next.failure = null
  next.updatedAt = at
  next.attempts.push({
    attemptId: `${next.publicationId}:attempt:${attemptNumber}`,
    attemptNumber,
    provider: providerId,
    state: 'DISPATCHING',
    startedAt: at,
    completedAt: null,
    providerReceipt: null,
    error: null,
  })
  return next
}

export function acceptProviderReceipt(job, {
  provider,
  receipt,
  nextState = 'PROVIDER_ACCEPTED',
  now = new Date().toISOString(),
} = {}) {
  assertJob(job)
  if (!['PROVIDER_ACCEPTED', 'AWAITING_USER_POST'].includes(nextState)) {
    throw new Error('provider acceptance must use PROVIDER_ACCEPTED or AWAITING_USER_POST')
  }
  if (job.state === nextState && job.providerReceipt) return structuredClone(job)
  if (job.state !== 'DISPATCHING') throw new Error('provider receipt requires an active dispatch attempt')
  const providerId = clean(provider).toLowerCase()
  const active = job.attempts.at(-1)
  if (!active || active.state !== 'DISPATCHING' || active.provider !== providerId) {
    throw new Error('provider receipt does not match active dispatch attempt')
  }
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) throw new Error('provider receipt must be an object')
  const operationId = clean(receipt.providerOperationId || receipt.publishId || receipt.externalId)
  if (!operationId) throw new Error('provider receipt requires a durable provider operation identity')

  const at = iso(now, 'provider receipt time')
  const normalizedReceipt = {
    ...structuredClone(receipt),
    provider: providerId,
    providerOperationId: operationId,
    acceptedAt: at,
  }
  const next = structuredClone(job)
  next.state = nextState
  next.providerReceipt = normalizedReceipt
  next.providerReceipts = [...(next.providerReceipts || []), normalizedReceipt]
  next.updatedAt = at
  next.attempts[next.attempts.length - 1] = {
    ...next.attempts[next.attempts.length - 1],
    state: nextState,
    completedAt: at,
    providerReceipt: normalizedReceipt,
  }
  return next
}

export function recordPublicationFailure(job, {
  provider,
  error,
  now = new Date().toISOString(),
  providerReceipt = null,
  retryable = true,
} = {}) {
  assertJob(job)
  if (!['DISPATCHING', 'PROVIDER_ACCEPTED', 'AWAITING_USER_POST'].includes(job.state)) {
    throw new Error(`publication failure cannot be recorded from ${job.state}`)
  }
  const providerId = clean(provider).toLowerCase()
  const message = clean(error?.message || error)
  if (!providerId || !message) throw new Error('publication failure requires provider and error')
  const at = iso(now, 'publication failure time')
  const next = structuredClone(job)
  next.state = 'FAILED'
  next.updatedAt = at
  next.failure = {
    provider: providerId,
    message,
    at,
    retryable: Boolean(retryable),
  }
  const active = next.attempts.at(-1)
  if (active && active.provider === providerId && active.state !== 'FAILED') {
    next.attempts[next.attempts.length - 1] = {
      ...active,
      state: 'FAILED',
      completedAt: at,
      error: message,
      providerReceipt: providerReceipt || active.providerReceipt || null,
    }
  }
  return next
}

export function recordPublicationReconciliationRequired(job, {
  provider,
  error,
  now = new Date().toISOString(),
} = {}) {
  assertJob(job)
  if (job.state !== 'DISPATCHING') {
    throw new Error(`publication reconciliation can only be required from DISPATCHING, got ${job.state}`)
  }
  const providerId = clean(provider).toLowerCase()
  const message = clean(error?.message || error) || 'provider dispatch outcome is unknown'
  if (!providerId) throw new Error('publication reconciliation requires provider')
  const at = iso(now, 'publication reconciliation time')
  const next = structuredClone(job)
  next.state = 'NEEDS_RECONCILIATION'
  next.updatedAt = at
  next.failure = {
    provider: providerId,
    message,
    at,
    retryable: false,
    ambiguousDispatch: true,
  }
  const active = next.attempts.at(-1)
  if (active && active.provider === providerId) {
    next.attempts[next.attempts.length - 1] = {
      ...active,
      state: 'NEEDS_RECONCILIATION',
      completedAt: at,
      error: message,
    }
  }
  return next
}

export function recordPublicationObservation(job, {
  provider,
  status,
  receipt = null,
  nextState = null,
  now = new Date().toISOString(),
} = {}) {
  assertJob(job)
  const providerId = clean(provider).toLowerCase()
  const observedStatus = clean(status)
  if (!providerId || !observedStatus) throw new Error('publication observation requires provider and status')
  const at = iso(now, 'publication observation time')
  if (nextState !== null && !['PROVIDER_ACCEPTED', 'AWAITING_USER_POST'].includes(nextState)) {
    throw new Error('publication observation nextState must be PROVIDER_ACCEPTED or AWAITING_USER_POST')
  }
  const next = structuredClone(job)
  if (nextState) next.state = nextState
  next.observerReceipts = [
    ...(next.observerReceipts || []),
    {
      provider: providerId,
      status: observedStatus,
      receipt: receipt && typeof receipt === 'object' && !Array.isArray(receipt) ? structuredClone(receipt) : null,
      observedAt: at,
    },
  ]
  next.updatedAt = at
  return next
}

export function markPublicationPublished(job, {
  provider,
  externalId,
  receipt = null,
  now = new Date().toISOString(),
} = {}) {
  assertJob(job)
  if (job.state === 'PUBLISHED') return structuredClone(job)
  if (!['PROVIDER_ACCEPTED', 'AWAITING_USER_POST'].includes(job.state)) {
    throw new Error(`publication cannot become PUBLISHED from ${job.state}`)
  }
  const providerId = clean(provider).toLowerCase()
  const publicId = clean(externalId)
  if (!providerId || !publicId) throw new Error('PUBLISHED requires provider and verified externalId')
  const at = iso(now, 'publication verification time')
  const next = structuredClone(job)
  next.state = 'PUBLISHED'
  next.updatedAt = at
  next.failure = null
  next.providerReceipt = {
    ...(next.providerReceipt || {}),
    ...(receipt && typeof receipt === 'object' && !Array.isArray(receipt) ? structuredClone(receipt) : {}),
    provider: providerId,
    externalId: publicId,
    verifiedPublishedAt: at,
  }
  next.providerReceipts = [...(next.providerReceipts || []), structuredClone(next.providerReceipt)]
  return next
}

export function cancelPublication(job, {
  reason,
  now = new Date().toISOString(),
} = {}) {
  assertJob(job)
  if (job.state === 'PUBLISHED') throw new Error('published publication cannot be cancelled')
  const at = iso(now, 'publication cancellation time')
  const next = structuredClone(job)
  next.state = 'CANCELLED'
  next.updatedAt = at
  next.failure = clean(reason) ? { provider: null, message: clean(reason), at, retryable: false } : null
  return next
}

export function publicationIsDispatchable(job) {
  assertJob(job)
  return job.state === 'QUEUED' || (job.state === 'FAILED' && job.failure?.retryable !== false)
}
