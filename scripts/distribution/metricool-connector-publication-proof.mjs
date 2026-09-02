import { transitionDistributionLifecycle } from './distribution-lifecycle.mjs'

function clean(value) {
  return String(value ?? '').trim()
}

function latestLiveScheduledReceipt(lifecycle) {
  const receipts = Array.isArray(lifecycle?.receipts) ? lifecycle.receipts : []
  return [...receipts].reverse().find((receipt) => receipt?.state === 'scheduled' && receipt?.dryRun === false) || null
}

export function recordMetricoolConnectorPublishedReceipt({
  lifecycle,
  currentIdentity,
  proof,
  now = new Date().toISOString(),
} = {}) {
  if (!lifecycle || lifecycle.schemaVersion !== 'distribution-lifecycle-v1') {
    throw new Error('Metricool publication proof requires a valid distribution lifecycle')
  }
  if (!proof || proof.schemaVersion !== 'metricool-connector-publication-proof-v1') {
    throw new Error('Metricool publication proof has an invalid schema')
  }
  if (clean(proof.provider) !== 'metricool') {
    throw new Error('Metricool publication proof must identify metricool as provider')
  }
  if (clean(proof.status) !== 'published') {
    throw new Error('Metricool publication proof must confirm published state')
  }

  const scheduled = latestLiveScheduledReceipt(lifecycle)
  if (!scheduled) {
    throw new Error('Metricool publication proof requires an existing live scheduled receipt')
  }

  if (clean(proof.lifecycleId) !== clean(lifecycle.lifecycleId)) {
    throw new Error('Metricool publication proof lifecycle does not match')
  }
  if (clean(proof.identityFingerprint) !== clean(lifecycle?.identity?.fingerprint)) {
    throw new Error('Metricool publication proof identity does not match')
  }
  if (clean(proof.idempotencyKey) !== clean(lifecycle?.identity?.idempotencyKey)) {
    throw new Error('Metricool publication proof idempotency key does not match')
  }
  if (clean(proof.externalId) !== clean(scheduled.externalId)) {
    throw new Error('Metricool publication proof externalId does not match scheduled receipt')
  }

  return transitionDistributionLifecycle(lifecycle, 'published', {
    currentIdentity,
    now,
    provider: 'metricool',
    externalId: clean(proof.externalId),
    requestId: clean(proof.requestId) || clean(scheduled.requestId) || null,
    dryRun: false,
  })
}
