import { promoteDryRunScheduleToLive, transitionDistributionLifecycle } from './distribution-lifecycle.mjs'

function clean(value) {
  return String(value ?? '').trim()
}

function assertEnvelope(envelope) {
  if (!envelope || envelope.schemaVersion !== 'metricool-connector-dispatch-v1') {
    throw new Error('invalid Metricool connector dispatch envelope')
  }
  if (envelope.status !== 'reserved-awaiting-connector') {
    throw new Error('Metricool connector receipt requires a reserved dispatch envelope')
  }
  if (envelope.transport !== 'chatgpt-metricool-connector') {
    throw new Error('unsupported Metricool connector transport')
  }
}

function assertReceipt(receipt) {
  if (!receipt || receipt.schemaVersion !== 'metricool-connector-provider-receipt-v1') {
    throw new Error('invalid Metricool connector provider receipt')
  }
  if (receipt.provider !== 'metricool') throw new Error('connector receipt provider must be metricool')
  if (receipt.status !== 'scheduled') throw new Error('connector provider receipt must confirm scheduled state')
  if (!clean(receipt.externalId)) throw new Error('connector provider receipt requires confirmed externalId')
}

export function recordMetricoolConnectorScheduledReceipt({
  lifecycle,
  currentIdentity,
  envelope,
  receipt,
  now = new Date().toISOString(),
} = {}) {
  assertEnvelope(envelope)
  assertReceipt(receipt)

  const fingerprint = clean(lifecycle?.identity?.fingerprint)
  const idempotencyKey = clean(lifecycle?.identity?.idempotencyKey)
  if (!fingerprint || !idempotencyKey) throw new Error('connector receipt requires a valid distribution lifecycle identity')

  if (clean(envelope.identityFingerprint) !== fingerprint) {
    throw new Error('connector dispatch envelope identity does not match lifecycle fingerprint')
  }
  if (clean(envelope.idempotencyKey) !== idempotencyKey) {
    throw new Error('connector dispatch envelope idempotency key does not match lifecycle')
  }
  if (clean(envelope.lifecycleId) !== clean(lifecycle.lifecycleId)) {
    throw new Error('connector dispatch envelope lifecycleId does not match lifecycle')
  }
  if (clean(receipt.identityFingerprint) !== fingerprint) {
    throw new Error('connector provider receipt identity does not match lifecycle fingerprint')
  }
  if (clean(receipt.idempotencyKey) !== idempotencyKey) {
    throw new Error('connector provider receipt idempotency key does not match lifecycle')
  }
  if (clean(receipt.dispatchSha) !== clean(envelope.dispatchSha)) {
    throw new Error('connector provider receipt dispatch SHA does not match reserved envelope')
  }
  if (clean(receipt.workflowRunId) !== clean(envelope.workflowRunId)) {
    throw new Error('connector provider receipt workflow run does not match reserved envelope')
  }

  const providerExternalId = clean(receipt.externalId)
  const requestId = clean(receipt.requestId) || null

  if (lifecycle.state === 'ready') {
    return transitionDistributionLifecycle(lifecycle, 'scheduled', {
      currentIdentity,
      now,
      provider: 'metricool',
      externalId: providerExternalId,
      requestId,
      dryRun: false,
    })
  }

  if (lifecycle.state === 'scheduled') {
    return promoteDryRunScheduleToLive(lifecycle, {
      currentIdentity,
      now,
      provider: 'metricool',
      externalId: providerExternalId,
      requestId,
    })
  }

  throw new Error(`connector scheduled receipt requires ready or scheduled lifecycle state, got ${clean(lifecycle?.state) || '<missing>'}`)
}
