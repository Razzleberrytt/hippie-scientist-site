import { describe, expect, it } from 'vitest'
import { createDistributionLifecycle, transitionDistributionLifecycle } from '../distribution-lifecycle.mjs'
import { recordMetricoolConnectorMeasuredObservation } from '../metricool-connector-measurement.mjs'

const identity = {
  researchObjectId: 'ashwagandha-stress-evidence',
  researchObjectHash: 'research-hash',
  packId: 'pack-1',
  packContentHash: 'pack-hash',
  creativeSpecHash: 'creative-hash',
  assetManifestHash: 'asset-hash',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  taggedDestination: 'https://thehippiescientist.net/herbs/ashwagandha/?utm_source=youtube&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=ashwagandha-short',
  platform: 'youtube',
  format: 'short-video',
  campaignId: 'evidence-to-distribution',
}

const candidate = {
  id: identity.researchObjectId,
  platform: identity.platform,
  angleKey: 'ashwagandha-stress-evidence:youtube:short-video',
}

function publishedLifecycle() {
  let lifecycle = createDistributionLifecycle(identity, { now: '2026-08-20T12:00:00.000Z' })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'validated', { currentIdentity: identity, now: '2026-08-20T12:01:00.000Z' })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'ready', { currentIdentity: identity, now: '2026-08-20T12:02:00.000Z' })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'scheduled', {
    currentIdentity: identity,
    provider: 'metricool',
    externalId: 'post-123',
    requestId: 'schedule-1',
    dryRun: false,
    now: '2026-08-20T12:03:00.000Z',
  })
  return transitionDistributionLifecycle(lifecycle, 'published', {
    currentIdentity: identity,
    provider: 'metricool',
    externalId: 'post-123',
    requestId: 'publish-1',
    dryRun: false,
    now: '2026-08-20T12:04:00.000Z',
  })
}

function publicationEvidence(lifecycle = publishedLifecycle()) {
  return {
    schemaVersion: 'metricool-connector-publication-ingestion-v1',
    status: 'accepted',
    dispatchSha: 'deadbeef',
    lifecycleId: lifecycle.lifecycleId,
    identityFingerprint: lifecycle.identity.fingerprint,
    idempotencyKey: lifecycle.identity.idempotencyKey,
    provider: 'metricool',
    externalId: 'post-123',
    lifecycle,
  }
}

const observation = {
  observedFrom: '2026-08-20T12:04:00.000Z',
  observedTo: '2026-08-27T12:04:00.000Z',
  capturedAt: '2026-08-27T13:00:00.000Z',
  assetViews: 1000,
  qualifiedVisits: 60,
  completionRate: 0.8,
  saveRate: 0.08,
}

const now = '2026-08-28T13:00:00.000Z'

describe('Metricool connector measurement ingestion', () => {
  it('advances exact published evidence to measured with one attributable observation', () => {
    const publication = publicationEvidence()
    const result = recordMetricoolConnectorMeasuredObservation({
      publicationEvidence: publication,
      currentIdentity: publication.lifecycle.identity,
      candidate,
      observation,
      now,
    })
    expect(result.status).toBe('accepted')
    expect(result.lifecycle.state).toBe('measured')
    expect(result.history.counts).toEqual({ accepted: 1, rejected: 0 })
    expect(result.lifecycle.measurements).toHaveLength(1)
    expect(result.lifecycle.measurements[0]).toMatchObject({
      observationId: result.observationId,
      platform: 'youtube',
      publicationExternalId: 'post-123',
      assetViews: 1000,
      qualifiedVisits: 60,
      observationOnly: true,
    })
  })

  it('rejects missing metrics instead of fabricating zero performance', () => {
    const publication = publicationEvidence()
    expect(() => recordMetricoolConnectorMeasuredObservation({
      publicationEvidence: publication,
      currentIdentity: publication.lifecycle.identity,
      candidate,
      observation: { ...observation, assetViews: undefined },
      now,
    })).toThrow(/explicit assetViews.*not zero performance/i)
  })

  it('rejects platform or candidate drift rather than pooling observations', () => {
    const publication = publicationEvidence()
    expect(() => recordMetricoolConnectorMeasuredObservation({
      publicationEvidence: publication,
      currentIdentity: publication.lifecycle.identity,
      candidate: { ...candidate, platform: 'tiktok' },
      observation,
      now,
    })).toThrow(/candidate does not match published lifecycle/i)
  })

  it('rejects stale governed identity and cross-post publication evidence', () => {
    const publication = publicationEvidence()
    expect(() => recordMetricoolConnectorMeasuredObservation({
      publicationEvidence: publication,
      currentIdentity: { ...publication.lifecycle.identity, fingerprint: 'stale' },
      candidate,
      observation,
      now,
    })).toThrow(/current governed identity does not match/i)

    const mismatched = { ...publication, externalId: 'different-post' }
    expect(() => recordMetricoolConnectorMeasuredObservation({
      publicationEvidence: mismatched,
      currentIdentity: publication.lifecycle.identity,
      candidate,
      observation,
      now,
    })).toThrow(/externalId mismatch/i)
  })
})
