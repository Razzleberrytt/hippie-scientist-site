import { describe, expect, it } from 'vitest'

import {
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

function advanceToLivePublished() {
  let record = createDistributionLifecycle(identity)
  record = transitionDistributionLifecycle(record, 'validated', { currentIdentity: identity })
  record = transitionDistributionLifecycle(record, 'ready', { currentIdentity: identity })
  record = transitionDistributionLifecycle(record, 'scheduled', {
    currentIdentity: identity,
    provider: 'metricool',
    externalId: 'schedule-1',
    dryRun: false,
  })
  return transitionDistributionLifecycle(record, 'published', {
    currentIdentity: identity,
    provider: 'metricool',
    externalId: 'post-1',
    dryRun: false,
  })
}

describe('stale live distribution rollback', () => {
  it('allows a stale live publication to record withdrawal while preserving invalidation lineage', () => {
    const published = advanceToLivePublished()
    const changedIdentity = { ...identity, packContentHash: 'pack_hash_v2' }

    const withdrawn = transitionDistributionLifecycle(published, 'withdrawn', {
      currentIdentity: changedIdentity,
      provider: 'metricool',
      externalId: 'post-1',
      requestId: 'withdraw-1',
      dryRun: false,
      now: '2026-08-30T16:05:00.000Z',
    })

    expect(withdrawn.state).toBe('withdrawn')
    expect(withdrawn.invalidation).toMatchObject({
      reason: 'upstream_identity_changed',
      supersededIdentityFingerprint: published.identity.fingerprint,
    })
    expect(withdrawn.receipts.at(-1)).toMatchObject({
      state: 'withdrawn',
      provider: 'metricool',
      externalId: 'post-1',
      dryRun: false,
      identityFingerprint: published.identity.fingerprint,
    })
  })

  it('allows a paused-but-live stale publication to be withdrawn', () => {
    const published = advanceToLivePublished()
    const paused = transitionDistributionLifecycle(published, 'paused', { currentIdentity: identity })
    const changedIdentity = { ...identity, assetManifestHash: 'asset_hash_v2' }

    const withdrawn = transitionDistributionLifecycle(paused, 'withdrawn', {
      currentIdentity: changedIdentity,
      provider: 'metricool',
      externalId: 'post-1',
      dryRun: false,
    })

    expect(withdrawn.state).toBe('withdrawn')
    expect(withdrawn.invalidation?.reason).toBe('upstream_identity_changed')
  })

  it('keeps stale non-live assets terminal invalid instead of opening a withdrawal bypass', () => {
    let ready = createDistributionLifecycle(identity)
    ready = transitionDistributionLifecycle(ready, 'validated', { currentIdentity: identity })
    ready = transitionDistributionLifecycle(ready, 'ready', { currentIdentity: identity })
    const changedIdentity = { ...identity, researchObjectHash: 'obj_hash_v2' }

    const attempted = transitionDistributionLifecycle(ready, 'withdrawn', {
      currentIdentity: changedIdentity,
      provider: 'metricool',
      dryRun: false,
    })

    expect(attempted.state).toBe('invalid')
    expect(attempted.receipts.some((receipt) => receipt.state === 'withdrawn')).toBe(false)
  })

  it('keeps an already-invalid live record withdrawable during a later rollback attempt', () => {
    const published = advanceToLivePublished()
    const changedIdentity = { ...identity, creativeSpecHash: 'creative_hash_v2' }
    const invalid = reconcileDistributionLifecycleIdentity(published, changedIdentity)

    const withdrawn = transitionDistributionLifecycle(invalid, 'withdrawn', {
      currentIdentity: changedIdentity,
      provider: 'metricool',
      externalId: 'post-1',
      dryRun: false,
    })

    expect(withdrawn.state).toBe('withdrawn')
    expect(withdrawn.invalidation).toEqual(invalid.invalidation)
  })
})
