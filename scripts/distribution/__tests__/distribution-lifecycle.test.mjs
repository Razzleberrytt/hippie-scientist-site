import { describe, expect, it } from 'vitest'

import {
  assertPublishableLifecycle,
  buildDistributionIdentity,
  createDistributionLifecycle,
  reconcileDistributionLifecycleIdentity,
  transitionDistributionLifecycle,
} from '../distribution-lifecycle.mjs'

const identity = {
  researchObjectId: 'ashwagandha-stress-evidence',
  researchObjectHash: 'obj_hash_v1',
  packId: 'pack_ashwagandha',
  packContentHash: 'pack_hash_v1',
  creativeSpecHash: 'creative_hash_v1',
  assetManifestHash: 'asset_hash_v1',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  taggedDestination: 'https://thehippiescientist.net/herbs/ashwagandha/?utm_source=instagram&utm_medium=social&utm_campaign=evidence_distribution&utm_content=ashwagandha_test',
  platform: 'instagram',
  format: 'vertical-video',
  campaignId: 'evidence_distribution',
}

function advanceToReady(record) {
  record = transitionDistributionLifecycle(record, 'validated', { currentIdentity: identity })
  return transitionDistributionLifecycle(record, 'ready', { currentIdentity: identity })
}

function advanceToPublished(record) {
  record = advanceToReady(record)
  record = transitionDistributionLifecycle(record, 'scheduled', { currentIdentity: identity })
  return transitionDistributionLifecycle(record, 'published', {
    currentIdentity: identity,
    externalId: 'dry-run-post',
  })
}

describe('governed distribution lifecycle', () => {
  it('derives stable campaign/asset identity and starts dry-run only', () => {
    expect(buildDistributionIdentity(identity)).toEqual(buildDistributionIdentity({ ...identity }))
    const record = createDistributionLifecycle(identity, { now: '2026-08-28T05:00:00.000Z' })
    expect(record).toMatchObject({ state: 'generated', dryRun: true, paused: false, invalidation: null })
    expect(record.lifecycleId).toBe(record.identity.idempotencyKey)
  })

  it('automatically invalidates when any upstream content/render identity becomes stale', () => {
    const record = createDistributionLifecycle(identity)
    const changedIdentity = { ...identity, packContentHash: 'changed' }
    const invalid = transitionDistributionLifecycle(record, 'validated', {
      currentIdentity: changedIdentity,
      now: '2026-08-30T11:00:00.000Z',
    })
    expect(invalid).toMatchObject({
      state: 'invalid',
      paused: true,
      invalidation: {
        reason: 'upstream_identity_changed',
        at: '2026-08-30T11:00:00.000Z',
        supersededIdentityFingerprint: record.identity.fingerprint,
        currentIdentityFingerprint: buildDistributionIdentity(changedIdentity).fingerprint,
        replacementIdempotencyKey: buildDistributionIdentity(changedIdentity).idempotencyKey,
      },
    })
  })

  it('invalidates persisted ready assets during identity reconciliation and blocks publication', () => {
    const ready = advanceToReady(createDistributionLifecycle(identity))
    const changedIdentity = { ...identity, researchObjectHash: 'obj_hash_v2' }
    const invalid = reconcileDistributionLifecycleIdentity(ready, changedIdentity, {
      now: '2026-08-30T11:05:00.000Z',
    })
    expect(invalid.state).toBe('invalid')
    expect(invalid.identity.fingerprint).toBe(ready.identity.fingerprint)
    expect(() => assertPublishableLifecycle(ready, changedIdentity)).toThrow(/invalid: upstream identity changed/i)
  })

  it('keeps invalid lifecycle lineage terminal until regeneration creates a new identity', () => {
    const changedIdentity = { ...identity, assetManifestHash: 'asset_hash_v2' }
    const invalid = reconcileDistributionLifecycleIdentity(advanceToReady(createDistributionLifecycle(identity)), changedIdentity)
    const attempted = transitionDistributionLifecycle(invalid, 'scheduled', { currentIdentity: changedIdentity })
    expect(attempted.state).toBe('invalid')
    expect(attempted.invalidation).toEqual(invalid.invalidation)

    const regenerated = createDistributionLifecycle(changedIdentity)
    expect(regenerated.state).toBe('generated')
    expect(regenerated.identity.fingerprint).not.toBe(invalid.identity.fingerprint)
    expect(regenerated.lifecycleId).toBe(buildDistributionIdentity(changedIdentity).idempotencyKey)
  })

  it('requires ordered generated -> validated -> ready transitions', () => {
    const record = createDistributionLifecycle(identity)
    expect(() => transitionDistributionLifecycle(record, 'scheduled', { currentIdentity: identity }))
      .toThrow(/illegal.*generated -> scheduled/i)
    expect(advanceToReady(record).state).toBe('ready')
  })

  it('keeps scheduling dry-run by default and binds the receipt to one idempotency key', () => {
    const ready = advanceToReady(createDistributionLifecycle(identity))
    const scheduled = transitionDistributionLifecycle(ready, 'scheduled', {
      currentIdentity: identity,
      now: '2026-08-28T05:01:00.000Z',
    })
    expect(scheduled.receipts).toHaveLength(1)
    expect(scheduled.receipts[0]).toMatchObject({
      state: 'scheduled',
      provider: 'dry-run',
      dryRun: true,
      idempotencyKey: ready.identity.idempotencyKey,
    })
  })

  it('never treats a real publish request as success without confirmed provider externalId', () => {
    const ready = advanceToReady(createDistributionLifecycle(identity))
    const scheduled = transitionDistributionLifecycle(ready, 'scheduled', {
      currentIdentity: identity,
      provider: 'test-provider',
      requestId: 'req-1',
      dryRun: false,
    })
    expect(() => transitionDistributionLifecycle(scheduled, 'published', {
      currentIdentity: identity,
      provider: 'test-provider',
      requestId: 'req-2',
      dryRun: false,
    })).toThrow(/requires confirmed externalId/i)
  })

  it('records measured outcomes as observation-only and never changes scientific identity', () => {
    let record = advanceToPublished(createDistributionLifecycle(identity))
    record = transitionDistributionLifecycle(record, 'measured', {
      currentIdentity: identity,
      measurement: { views: 1200, qualifiedClicks: 18, windowDays: 7 },
    })
    expect(record.measurements[0]).toMatchObject({ observationOnly: true, views: 1200, qualifiedClicks: 18 })
    expect(record.identity).toEqual(buildDistributionIdentity(identity))
  })

  it('fails closed when a measurement payload tries to overwrite lifecycle authority metadata', () => {
    const published = advanceToPublished(createDistributionLifecycle(identity))
    for (const field of ['observationOnly', 'identityFingerprint', 'at', 'state', 'provider', 'idempotencyKey']) {
      expect(() => transitionDistributionLifecycle(published, 'measured', {
        currentIdentity: identity,
        measurement: { views: 1200, [field]: 'attacker-controlled' },
      })).toThrow(/reserved lifecycle fields/i)
    }
  })

  it('rejects null, scalar, and array measurement payloads', () => {
    const published = advanceToPublished(createDistributionLifecycle(identity))
    for (const measurement of [null, 'views=1200', 1200, ['views', 1200]]) {
      expect(() => transitionDistributionLifecycle(published, 'measured', {
        currentIdentity: identity,
        measurement,
      })).toThrow(/requires an observation payload/i)
    }
  })

  it('supports explicit pause and withdrawal while blocking ordinary publishability', () => {
    const ready = advanceToReady(createDistributionLifecycle(identity))
    expect(assertPublishableLifecycle(ready, identity)).toBe(true)
    const paused = transitionDistributionLifecycle(ready, 'paused', { currentIdentity: identity })
    expect(() => assertPublishableLifecycle(paused, identity)).toThrow(/paused/i)
    const withdrawn = transitionDistributionLifecycle(paused, 'withdrawn', { currentIdentity: identity })
    expect(withdrawn.state).toBe('withdrawn')
  })
})
