import { describe, expect, it } from 'vitest'

import { createDistributionLifecycle, transitionDistributionLifecycle } from '../distribution-lifecycle.mjs'
import { ingestDistributionObservations } from '../distribution-observation-ingestion.mjs'
import { applyDistributionFeedback } from '../opportunity-feedback.mjs'

const NOW = new Date('2026-08-28T13:00:00Z')
const identity = {
  researchObjectId: 'ashwagandha-stress-evidence',
  researchObjectHash: 'obj_hash_v1',
  packId: 'pack_ashwagandha',
  packContentHash: 'pack_hash_v1',
  creativeSpecHash: 'creative_hash_v1',
  assetManifestHash: 'asset_hash_v1',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  taggedDestination: 'https://thehippiescientist.net/herbs/ashwagandha/?utm_source=distribution-engine&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=ashwagandha-carousel-test',
  platform: 'instagram',
  format: 'carousel',
  campaignId: 'evidence-to-distribution',
}
const candidate = {
  id: identity.researchObjectId,
  eligible: true,
  score: 104,
  platform: identity.platform,
  angle: 'Ashwagandha: finding → evidence grade → key limitation → source trail',
  angleKey: 'ashwagandha-stress-evidence:instagram:ashwagandha-finding-evidence-grade-key-limitation-source-trail',
}

function publishedLifecycle(overrides = {}) {
  const source = { ...identity, ...overrides }
  let record = createDistributionLifecycle(source, { now: '2026-08-20T12:00:00.000Z' })
  record = transitionDistributionLifecycle(record, 'validated', { currentIdentity: source, now: '2026-08-20T12:01:00.000Z' })
  record = transitionDistributionLifecycle(record, 'ready', { currentIdentity: source, now: '2026-08-20T12:02:00.000Z' })
  record = transitionDistributionLifecycle(record, 'scheduled', { currentIdentity: source, provider: 'instagram', requestId: 'req-1', dryRun: false, now: '2026-08-20T12:03:00.000Z' })
  return transitionDistributionLifecycle(record, 'published', { currentIdentity: source, provider: 'instagram', externalId: 'post-123', requestId: 'req-2', dryRun: false, now: '2026-08-20T12:04:00.000Z' })
}

function observation(lifecycle, overrides = {}) {
  return {
    lifecycleId: lifecycle.lifecycleId,
    identityFingerprint: lifecycle.identity.fingerprint,
    provider: 'instagram',
    publicationExternalId: 'post-123',
    candidateId: identity.researchObjectId,
    platform: identity.platform,
    format: identity.format,
    sourceUrl: identity.sourceUrl,
    contentHash: identity.researchObjectHash,
    taggedDestination: identity.taggedDestination,
    angleKey: candidate.angleKey,
    observedFrom: '2026-08-20T12:04:00.000Z',
    observedTo: '2026-08-27T12:04:00.000Z',
    capturedAt: '2026-08-27T13:00:00.000Z',
    assetViews: 1000,
    qualifiedVisits: 60,
    completionRate: 0.8,
    saveRate: 0.08,
    ...overrides,
  }
}

describe('distribution outcome observation ingestion', () => {
  it('emits an explicit zero-data waiting state without fabricating zero performance', () => {
    const result = ingestDistributionObservations([], [], [], { now: NOW })
    expect(result.status).toBe('waiting-for-qualified-observations')
    expect(result.accepted).toEqual([])
    expect(result.history).toEqual([])
    expect(result.counts).toEqual({ accepted: 0, rejected: 0 })
  })

  it('normalizes a bounded pilot observation and feeds existing underpowered-safe feedback', () => {
    const lifecycle = publishedLifecycle()
    const result = ingestDistributionObservations([lifecycle], [observation(lifecycle)], [candidate], { now: NOW })
    expect(result.status).toBe('observed')
    expect(result.counts).toEqual({ accepted: 1, rejected: 0 })
    expect(result.accepted[0]).toMatchObject({
      observationOnly: true,
      candidateId: candidate.id,
      platform: 'instagram',
      assetViews: 1000,
      qualifiedVisits: 60,
      sourceUrl: identity.sourceUrl,
      contentHash: identity.researchObjectHash,
    })
    const feedback = applyDistributionFeedback(candidate, result.history, { now: NOW })
    expect(feedback.feedback.measured.rewardSampleSufficient).toBe(true)
    expect(feedback.feedback.performanceReward).toBeGreaterThan(0)
  })

  it('rejects duplicate, stale, and receipt-mismatched observations instead of inferring outcomes', () => {
    const lifecycle = publishedLifecycle()
    const valid = observation(lifecycle)
    const stale = observation(lifecycle, { capturedAt: '2026-06-01T13:00:00.000Z', observedTo: '2026-06-01T12:00:00.000Z' })
    const mismatched = observation(lifecycle, { publicationExternalId: 'wrong-post' })
    const result = ingestDistributionObservations([lifecycle], [valid, valid, stale, mismatched], [candidate], { now: NOW })
    expect(result.counts).toEqual({ accepted: 1, rejected: 3 })
    expect(result.rejected.flatMap((entry) => entry.reasons).join('\n')).toMatch(/duplicate normalized observation/i)
    expect(result.rejected.flatMap((entry) => entry.reasons).join('\n')).toMatch(/stale/i)
    expect(result.rejected.flatMap((entry) => entry.reasons).join('\n')).toMatch(/externalId mismatch/i)
  })

  it('fails closed on content, destination, angle, or identity drift', () => {
    const lifecycle = publishedLifecycle()
    const result = ingestDistributionObservations([lifecycle], [
      observation(lifecycle, { contentHash: 'wrong-hash' }),
      observation(lifecycle, { taggedDestination: 'https://thehippiescientist.net/wrong/' }),
      observation(lifecycle, { angleKey: 'wrong-angle' }),
      observation(lifecycle, { identityFingerprint: 'wrong-fingerprint' }),
    ], [candidate], { now: NOW })
    expect(result.accepted).toEqual([])
    const reasons = result.rejected.flatMap((entry) => entry.reasons).join('\n')
    expect(reasons).toMatch(/content hash mismatch/i)
    expect(reasons).toMatch(/tagged destination mismatch/i)
    expect(reasons).toMatch(/angleKey mismatch/i)
    expect(reasons).toMatch(/identity fingerprint mismatch/i)
  })

  it('keeps cross-platform observations isolated rather than silently pooling them', () => {
    const instagramLifecycle = publishedLifecycle()
    const youtubeIdentity = { ...identity, platform: 'youtube', format: 'short-video', taggedDestination: `${identity.sourceUrl}?utm_source=youtube&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=yt-test` }
    const youtubeLifecycle = publishedLifecycle(youtubeIdentity)
    const youtubeCandidate = { ...candidate, platform: 'youtube', angleKey: 'ashwagandha-stress-evidence:youtube:short-video-angle' }
    const youtubeObservation = {
      ...observation(youtubeLifecycle),
      provider: 'instagram',
      candidateId: youtubeIdentity.researchObjectId,
      platform: 'youtube',
      format: 'short-video',
      taggedDestination: youtubeIdentity.taggedDestination,
      angleKey: youtubeCandidate.angleKey,
    }
    const result = ingestDistributionObservations(
      [instagramLifecycle, youtubeLifecycle],
      [observation(instagramLifecycle), youtubeObservation],
      [candidate, youtubeCandidate],
      { now: NOW },
    )
    expect(result.accepted.map((entry) => entry.platform).sort()).toEqual(['instagram', 'youtube'])
    const instagramFeedback = applyDistributionFeedback(candidate, result.history, { now: NOW })
    expect(instagramFeedback.feedback.measured.assets).toBe(1)
    expect(instagramFeedback.feedback.measured.assetViews).toBe(1000)
  })
})
