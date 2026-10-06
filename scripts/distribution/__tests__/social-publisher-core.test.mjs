import { describe, expect, it } from 'vitest'
import {
  acceptProviderReceipt,
  artifactBundleSha256,
  beginPublicationAttempt,
  buildPublicationIdentity,
  createPublicationJobFromGovernedMedia,
  markPublicationPublished,
  publicationIsDispatchable,
  recordPublicationFailure,
} from '../social-publisher-core.mjs'

const singleHash = 'a'.repeat(64)

function fixture() {
  const manifest = {
    status: 'ready-for-provider',
    researchObjectId: 'mitragynine-evidence',
    lifecycleId: 'dist_lifecycle',
    identityFingerprint: 'b'.repeat(64),
    taggedDestination: 'https://thehippiescientist.net/compounds/mitragynine/?utm_source=distribution-engine&utm_medium=organic&utm_campaign=ths_social_2026q4&utm_content=exp014_mitragynine',
    format: 'vertical-video',
    media: [{
      file: 'short-video.mp4',
      sha256: singleHash,
      url: 'https://thehippiescientist.net/media/distribution/publisher/mitragynine/video.mp4',
    }],
  }
  const selection = {
    selected: {
      id: 'mitragynine-evidence',
      destination: { taggedUrl: manifest.taggedDestination },
    },
  }
  return { manifest, selection }
}

describe('THS Publisher canonical publication jobs', () => {
  it('derives stable provider-neutral publication identity', () => {
    const input = {
      experimentId: 'exp014_mitragynine',
      artifactSha256: singleHash,
      platform: 'TikTok',
      intendedTime: '2026-10-06T15:00:00-04:00',
    }
    const a = buildPublicationIdentity(input)
    const b = buildPublicationIdentity({ ...input })
    expect(a).toEqual(b)
    expect(a.publicationId).toMatch(/^pub_[0-9a-f]{24}$/)
    expect(a.platform).toBe('tiktok')
    expect(a.intendedTime).toBe('2026-10-06T19:00:00.000Z')
    expect(a).not.toHaveProperty('provider')
  })

  it('uses the exact shipped artifact hash and utm_content experiment identity', () => {
    const { manifest, selection } = fixture()
    const job = createPublicationJobFromGovernedMedia({
      manifest,
      selection,
      platform: 'tiktok',
      intendedTime: '2026-10-06T15:00:00-04:00',
      now: '2026-10-06T14:00:00Z',
    })
    expect(job.identity).toMatchObject({
      experimentId: 'exp014_mitragynine',
      artifactSha256: singleHash,
      platform: 'tiktok',
    })
    expect(job.governance).toMatchObject({
      lifecycleId: 'dist_lifecycle',
      identityFingerprint: 'b'.repeat(64),
      format: 'vertical-video',
    })
    expect(job.state).toBe('QUEUED')
    expect(job.providerReceipt).toBeNull()
  })

  it('creates one bundle hash for multi-asset posts without provider IDs', () => {
    const first = artifactBundleSha256([
      { file: 'b.webp', sha256: '2'.repeat(64) },
      { file: 'a.webp', sha256: '1'.repeat(64) },
    ])
    const second = artifactBundleSha256([
      { file: 'a.webp', sha256: '1'.repeat(64) },
      { file: 'b.webp', sha256: '2'.repeat(64) },
    ])
    expect(first).toBe(second)
    expect(first).toMatch(/^[0-9a-f]{64}$/)
  })

  it('keeps retries under one publication_id and appends attempts', () => {
    const { manifest, selection } = fixture()
    let job = createPublicationJobFromGovernedMedia({
      manifest,
      selection,
      platform: 'tiktok',
      intendedTime: '2026-10-06T15:00:00-04:00',
    })
    const publicationId = job.publicationId
    job = beginPublicationAttempt(job, { provider: 'tiktok', now: '2026-10-06T18:59:00Z' })
    job = recordPublicationFailure(job, { provider: 'tiktok', error: new Error('provider unavailable'), now: '2026-10-06T18:59:10Z' })
    expect(publicationIsDispatchable(job)).toBe(true)
    job = beginPublicationAttempt(job, { provider: 'tiktok', now: '2026-10-06T19:00:00Z' })
    expect(job.publicationId).toBe(publicationId)
    expect(job.attempts).toHaveLength(2)
    expect(job.attempts.map((attempt) => attempt.attemptNumber)).toEqual([1, 2])
  })

  it('prevents duplicate provider dispatch after acceptance', () => {
    const { manifest, selection } = fixture()
    let job = createPublicationJobFromGovernedMedia({
      manifest,
      selection,
      platform: 'tiktok',
      intendedTime: '2026-10-06T15:00:00-04:00',
    })
    job = beginPublicationAttempt(job, { provider: 'tiktok' })
    job = acceptProviderReceipt(job, {
      provider: 'tiktok',
      nextState: 'AWAITING_USER_POST',
      receipt: { publishId: 'v_inbox_url~v2.123' },
    })
    const again = beginPublicationAttempt(job, { provider: 'tiktok' })
    expect(again).toEqual(job)
    expect(again.attempts).toHaveLength(1)
    expect(publicationIsDispatchable(again)).toBe(false)
  })

  it('requires independently verified public identity before PUBLISHED', () => {
    const { manifest, selection } = fixture()
    let job = createPublicationJobFromGovernedMedia({
      manifest,
      selection,
      platform: 'tiktok',
      intendedTime: '2026-10-06T15:00:00-04:00',
    })
    job = beginPublicationAttempt(job, { provider: 'tiktok' })
    job = acceptProviderReceipt(job, {
      provider: 'tiktok',
      nextState: 'AWAITING_USER_POST',
      receipt: { publishId: 'v_inbox_url~v2.123' },
    })
    expect(() => markPublicationPublished(job, { provider: 'tiktok', externalId: '' })).toThrow(/verified externalId/i)
    job = markPublicationPublished(job, {
      provider: 'tiktok',
      externalId: '746123456789',
      receipt: { publishId: 'v_inbox_url~v2.123' },
    })
    expect(job.state).toBe('PUBLISHED')
    expect(job.providerReceipt).toMatchObject({
      provider: 'tiktok',
      externalId: '746123456789',
      publishId: 'v_inbox_url~v2.123',
    })
  })
})
