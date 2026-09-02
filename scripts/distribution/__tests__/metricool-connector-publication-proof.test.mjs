import { describe, expect, it } from 'vitest'
import { createDistributionLifecycle, transitionDistributionLifecycle } from '../distribution-lifecycle.mjs'
import { recordMetricoolConnectorPublishedReceipt } from '../metricool-connector-publication-proof.mjs'

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

function scheduledLifecycle() {
  let lifecycle = createDistributionLifecycle(identity, { now: '2026-09-02T02:00:00.000Z' })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'validated', { currentIdentity: identity, now: '2026-09-02T02:01:00.000Z' })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'ready', { currentIdentity: identity, now: '2026-09-02T02:02:00.000Z' })
  return transitionDistributionLifecycle(lifecycle, 'scheduled', {
    currentIdentity: identity,
    now: '2026-09-02T02:03:00.000Z',
    provider: 'metricool',
    externalId: 'metricool-post-123',
    requestId: 'request-123',
    dryRun: false,
  })
}

function proofFor(lifecycle) {
  return {
    schemaVersion: 'metricool-connector-publication-proof-v1',
    provider: 'metricool',
    status: 'published',
    lifecycleId: lifecycle.lifecycleId,
    identityFingerprint: lifecycle.identity.fingerprint,
    idempotencyKey: lifecycle.identity.idempotencyKey,
    externalId: 'metricool-post-123',
    requestId: 'publication-check-123',
  }
}

describe('Metricool connector publication proof', () => {
  it('advances an exact live scheduled lifecycle to published', () => {
    const lifecycle = scheduledLifecycle()
    const next = recordMetricoolConnectorPublishedReceipt({
      lifecycle,
      currentIdentity: identity,
      proof: proofFor(lifecycle),
      now: '2026-09-02T02:10:00.000Z',
    })

    expect(next.state).toBe('published')
    expect(next.dryRun).toBe(false)
    expect(next.receipts.at(-1)).toMatchObject({
      state: 'published',
      provider: 'metricool',
      externalId: 'metricool-post-123',
      requestId: 'publication-check-123',
      dryRun: false,
      identityFingerprint: lifecycle.identity.fingerprint,
    })
  })

  it('rejects a different external post instead of cross-binding publication evidence', () => {
    const lifecycle = scheduledLifecycle()
    expect(() => recordMetricoolConnectorPublishedReceipt({
      lifecycle,
      currentIdentity: identity,
      proof: { ...proofFor(lifecycle), externalId: 'different-post' },
    })).toThrow(/externalId does not match/)
  })

  it('rejects stale identity and idempotency proof', () => {
    const lifecycle = scheduledLifecycle()
    expect(() => recordMetricoolConnectorPublishedReceipt({
      lifecycle,
      currentIdentity: identity,
      proof: { ...proofFor(lifecycle), identityFingerprint: 'stale' },
    })).toThrow(/identity does not match/)

    expect(() => recordMetricoolConnectorPublishedReceipt({
      lifecycle,
      currentIdentity: identity,
      proof: { ...proofFor(lifecycle), idempotencyKey: 'wrong' },
    })).toThrow(/idempotency key does not match/)
  })

  it('requires a confirmed live scheduled receipt and published provider state', () => {
    const lifecycle = scheduledLifecycle()
    const withoutLiveSchedule = { ...lifecycle, receipts: lifecycle.receipts.filter((receipt) => receipt.state !== 'scheduled') }
    expect(() => recordMetricoolConnectorPublishedReceipt({
      lifecycle: withoutLiveSchedule,
      currentIdentity: identity,
      proof: proofFor(lifecycle),
    })).toThrow(/live scheduled receipt/)

    expect(() => recordMetricoolConnectorPublishedReceipt({
      lifecycle,
      currentIdentity: identity,
      proof: { ...proofFor(lifecycle), status: 'processing' },
    })).toThrow(/confirm published state/)
  })
})
