import { describe, expect, it } from 'vitest'
import { createDistributionLifecycle, transitionDistributionLifecycle } from '../distribution-lifecycle.mjs'
import { recordMetricoolConnectorScheduledReceipt } from '../metricool-connector-receipt.mjs'

const identity = {
  researchObjectId: 'ashwagandha-stress-evidence',
  researchObjectHash: 'research-hash',
  packId: 'pack-1',
  packContentHash: 'pack-hash',
  creativeSpecHash: 'creative-hash',
  assetManifestHash: 'asset-hash',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  taggedDestination: 'https://thehippiescientist.net/herbs/ashwagandha/?utm_campaign=test',
  platform: 'short-video',
  format: 'vertical-video',
  campaignId: 'campaign-1',
}

function readyLifecycle() {
  let lifecycle = createDistributionLifecycle(identity, { now: '2026-09-02T02:00:00.000Z' })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'validated', { currentIdentity: identity, now: '2026-09-02T02:01:00.000Z' })
  return transitionDistributionLifecycle(lifecycle, 'ready', { currentIdentity: identity, now: '2026-09-02T02:02:00.000Z' })
}

function envelopeFor(lifecycle) {
  return {
    schemaVersion: 'metricool-connector-dispatch-v1',
    status: 'reserved-awaiting-connector',
    transport: 'chatgpt-metricool-connector',
    dispatchSha: 'abc123',
    workflowRunId: '456',
    lifecycleId: lifecycle.lifecycleId,
    identityFingerprint: lifecycle.identity.fingerprint,
    idempotencyKey: lifecycle.identity.idempotencyKey,
  }
}

function receiptFor(lifecycle) {
  return {
    schemaVersion: 'metricool-connector-provider-receipt-v1',
    provider: 'metricool',
    status: 'scheduled',
    externalId: 'metricool-post-123',
    requestId: 'request-123',
    dispatchSha: 'abc123',
    workflowRunId: '456',
    identityFingerprint: lifecycle.identity.fingerprint,
    idempotencyKey: lifecycle.identity.idempotencyKey,
  }
}

describe('Metricool connector receipt', () => {
  it('promotes an exact reserved connector handoff into a live scheduled receipt', () => {
    const lifecycle = readyLifecycle()
    const next = recordMetricoolConnectorScheduledReceipt({
      lifecycle,
      currentIdentity: identity,
      envelope: envelopeFor(lifecycle),
      receipt: receiptFor(lifecycle),
      now: '2026-09-02T02:10:00.000Z',
    })

    expect(next.state).toBe('scheduled')
    expect(next.dryRun).toBe(false)
    expect(next.provider).toBe('metricool')
    expect(next.receipts.at(-1)).toMatchObject({
      state: 'scheduled',
      provider: 'metricool',
      externalId: 'metricool-post-123',
      requestId: 'request-123',
      dryRun: false,
      identityFingerprint: lifecycle.identity.fingerprint,
    })
  })

  it('promotes the canonical dry-run schedule instead of creating a second lifecycle authority', () => {
    const ready = readyLifecycle()
    const scheduled = transitionDistributionLifecycle(ready, 'scheduled', {
      currentIdentity: identity,
      now: '2026-09-02T02:03:00.000Z',
      dryRun: true,
    })
    const next = recordMetricoolConnectorScheduledReceipt({
      lifecycle: scheduled,
      currentIdentity: identity,
      envelope: envelopeFor(scheduled),
      receipt: receiptFor(scheduled),
      now: '2026-09-02T02:10:00.000Z',
    })

    expect(next.lifecycleId).toBe(scheduled.lifecycleId)
    expect(next.receipts.filter((item) => item.state === 'scheduled')).toHaveLength(2)
    expect(next.receipts.at(-1).dryRun).toBe(false)
  })

  it('rejects stale or cross-run provider receipts before lifecycle mutation', () => {
    const lifecycle = readyLifecycle()
    const envelope = envelopeFor(lifecycle)
    const receipt = receiptFor(lifecycle)

    expect(() => recordMetricoolConnectorScheduledReceipt({
      lifecycle,
      currentIdentity: identity,
      envelope,
      receipt: { ...receipt, identityFingerprint: 'stale' },
    })).toThrow(/identity does not match/)

    expect(() => recordMetricoolConnectorScheduledReceipt({
      lifecycle,
      currentIdentity: identity,
      envelope,
      receipt: { ...receipt, workflowRunId: 'different-run' },
    })).toThrow(/workflow run does not match/)
  })

  it('requires confirmed provider success rather than treating dispatch as publication evidence', () => {
    const lifecycle = readyLifecycle()
    const receipt = receiptFor(lifecycle)

    expect(() => recordMetricoolConnectorScheduledReceipt({
      lifecycle,
      currentIdentity: identity,
      envelope: envelopeFor(lifecycle),
      receipt: { ...receipt, status: 'dispatched', externalId: '' },
    })).toThrow(/must confirm scheduled state/)
  })
})
