import crypto from 'node:crypto'

const STATES = ['generated', 'validated', 'ready', 'scheduled', 'published', 'measured', 'paused', 'withdrawn', 'invalid']
const NEXT = {
  generated: new Set(['validated', 'paused']),
  validated: new Set(['ready', 'paused']),
  ready: new Set(['scheduled', 'paused']),
  scheduled: new Set(['published', 'paused']),
  published: new Set(['measured', 'withdrawn', 'paused']),
  measured: new Set(['withdrawn', 'paused']),
  paused: new Set(['ready', 'scheduled', 'published', 'withdrawn']),
  withdrawn: new Set(),
  invalid: new Set(),
}

const RESERVED_MEASUREMENT_FIELDS = new Set([
  'at',
  'identityFingerprint',
  'observationOnly',
  'scientificAuthority',
  'state',
  'provider',
  'externalId',
  'requestId',
  'idempotencyKey',
  'dryRun',
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

export function buildDistributionIdentity(input) {
  const required = [
    'researchObjectId',
    'researchObjectHash',
    'packId',
    'packContentHash',
    'creativeSpecHash',
    'assetManifestHash',
    'sourceUrl',
    'taggedDestination',
    'platform',
    'format',
    'campaignId',
  ]
  const missing = required.filter((field) => !clean(input?.[field]))
  if (missing.length) throw new Error(`distribution lifecycle identity missing: ${missing.join(', ')}`)

  const identity = Object.fromEntries(required.map((field) => [field, clean(input[field])]))
  const fingerprint = sha256(stableJson(identity))
  return {
    ...identity,
    fingerprint,
    idempotencyKey: `dist_${fingerprint.slice(0, 24)}`,
  }
}

export function createDistributionLifecycle(input, { now = new Date().toISOString() } = {}) {
  const identity = buildDistributionIdentity(input)
  return {
    schemaVersion: 'distribution-lifecycle-v1',
    lifecycleId: identity.idempotencyKey,
    state: 'generated',
    identity,
    createdAt: now,
    updatedAt: now,
    dryRun: true,
    paused: false,
    provider: null,
    receipts: [],
    measurements: [],
    invalidation: null,
  }
}

function assertLifecycleRecord(record) {
  if (!record || record.schemaVersion !== 'distribution-lifecycle-v1') {
    throw new Error('invalid distribution lifecycle record')
  }
}

export function reconcileDistributionLifecycleIdentity(record, currentIdentity, {
  now = new Date().toISOString(),
} = {}) {
  assertLifecycleRecord(record)
  const current = buildDistributionIdentity(currentIdentity)
  if (record.state === 'invalid') return structuredClone(record)
  if (current.fingerprint === record?.identity?.fingerprint) return structuredClone(record)

  const invalid = structuredClone(record)
  invalid.state = 'invalid'
  invalid.updatedAt = now
  invalid.paused = true
  invalid.invalidation = {
    reason: 'upstream_identity_changed',
    at: now,
    supersededIdentityFingerprint: record?.identity?.fingerprint ?? null,
    currentIdentityFingerprint: current.fingerprint,
    replacementIdempotencyKey: current.idempotencyKey,
  }
  return invalid
}

function assertTransition(record, nextState) {
  if (!STATES.includes(nextState)) throw new Error(`unknown distribution lifecycle state: ${nextState}`)
  if (!NEXT[record.state]?.has(nextState)) {
    throw new Error(`illegal distribution lifecycle transition: ${record.state} -> ${nextState}`)
  }
}

function sanitizeMeasurement(measurement) {
  if (!measurement || typeof measurement !== 'object' || Array.isArray(measurement)) {
    throw new Error('measured transition requires an observation payload')
  }
  const reserved = Object.keys(measurement).filter((field) => RESERVED_MEASUREMENT_FIELDS.has(field))
  if (reserved.length) {
    throw new Error(`measurement payload cannot set reserved lifecycle fields: ${reserved.sort().join(', ')}`)
  }
  return structuredClone(measurement)
}

export function transitionDistributionLifecycle(record, nextState, {
  currentIdentity,
  now = new Date().toISOString(),
  provider = null,
  externalId = null,
  requestId = null,
  measurement = null,
  dryRun = true,
} = {}) {
  assertLifecycleRecord(record)
  const reconciled = reconcileDistributionLifecycleIdentity(record, currentIdentity, { now })
  if (reconciled.state === 'invalid') return reconciled
  assertTransition(reconciled, nextState)

  const next = structuredClone(reconciled)
  next.updatedAt = now
  next.state = nextState
  next.dryRun = Boolean(dryRun)

  if (nextState === 'paused') next.paused = true
  if (nextState !== 'paused') next.paused = false

  if (['scheduled', 'published', 'withdrawn'].includes(nextState)) {
    const receipt = {
      state: nextState,
      idempotencyKey: record.identity.idempotencyKey,
      provider: clean(provider) || (dryRun ? 'dry-run' : ''),
      externalId: clean(externalId) || null,
      requestId: clean(requestId) || null,
      at: now,
      dryRun: Boolean(dryRun),
      identityFingerprint: record.identity.fingerprint,
    }
    if (!receipt.provider) throw new Error(`${nextState} transition requires provider identity or dry-run mode`)
    if (!dryRun && nextState === 'published' && !receipt.externalId) {
      throw new Error('published transition requires confirmed externalId; request dispatch alone is not success')
    }
    const duplicate = next.receipts.find((item) => item.state === nextState && item.idempotencyKey === receipt.idempotencyKey)
    if (duplicate) return next
    next.receipts.push(receipt)
    next.provider = receipt.provider
  }

  if (nextState === 'measured') {
    const observation = sanitizeMeasurement(measurement)
    next.measurements.push({
      ...observation,
      at: now,
      identityFingerprint: record.identity.fingerprint,
      observationOnly: true,
    })
  }

  return next
}

export function promoteDryRunScheduleToLive(record, {
  currentIdentity,
  now = new Date().toISOString(),
  provider,
  externalId,
  requestId = null,
} = {}) {
  assertLifecycleRecord(record)
  const reconciled = reconcileDistributionLifecycleIdentity(record, currentIdentity, { now })
  if (reconciled.state === 'invalid') return reconciled
  if (reconciled.state !== 'scheduled') throw new Error(`live schedule promotion requires scheduled state, got ${reconciled.state}`)
  if (reconciled.paused) throw new Error('distribution lifecycle is paused')

  const providerId = clean(provider)
  const providerExternalId = clean(externalId)
  if (!providerId) throw new Error('live schedule promotion requires provider identity')
  if (!providerExternalId) throw new Error('live schedule promotion requires confirmed provider externalId')

  const existingLive = reconciled.receipts.find((item) => item.state === 'scheduled' && item.dryRun === false)
  if (existingLive) {
    if (existingLive.provider === providerId && existingLive.externalId === providerExternalId) return structuredClone(reconciled)
    throw new Error('distribution lifecycle already has a different live scheduled receipt')
  }

  const dryRunReceipt = [...reconciled.receipts].reverse().find((item) => item.state === 'scheduled' && item.dryRun === true)
  if (!reconciled.dryRun || !dryRunReceipt) {
    throw new Error('live schedule promotion requires an existing dry-run scheduled receipt')
  }

  const next = structuredClone(reconciled)
  next.updatedAt = now
  next.dryRun = false
  next.provider = providerId
  next.paused = false
  next.receipts.push({
    state: 'scheduled',
    idempotencyKey: record.identity.idempotencyKey,
    provider: providerId,
    externalId: providerExternalId,
    requestId: clean(requestId) || null,
    at: now,
    dryRun: false,
    identityFingerprint: record.identity.fingerprint,
    promotedFromDryRunAt: dryRunReceipt.at,
  })
  return next
}

export function assertPublishableLifecycle(record, currentIdentity) {
  const reconciled = reconcileDistributionLifecycleIdentity(record, currentIdentity)
  if (reconciled.state === 'invalid') {
    throw new Error('distribution lifecycle is invalid: upstream identity changed; regenerate before publishing')
  }
  if (reconciled.paused) throw new Error('distribution lifecycle is paused')
  if (!['ready', 'scheduled'].includes(reconciled.state)) throw new Error(`distribution lifecycle is not publishable from state ${reconciled.state}`)
  return true
}
