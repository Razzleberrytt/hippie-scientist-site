import { describe, expect, it, vi } from 'vitest'
import { createDistributionLifecycle, transitionDistributionLifecycle } from '../distribution-lifecycle.mjs'
import { createPublicationJob } from '../social-publisher-core.mjs'
import { dispatchTikTokPublication, observeTikTokPublication } from '../tiktok-publisher-adapter.mjs'

const identity = {
  researchObjectId: 'mitragynine-evidence',
  researchObjectHash: 'research-hash',
  packId: 'pack-1',
  packContentHash: 'pack-hash',
  creativeSpecHash: 'creative-hash',
  assetManifestHash: 'asset-hash',
  sourceUrl: 'https://thehippiescientist.net/compounds/mitragynine/',
  taggedDestination: 'https://thehippiescientist.net/compounds/mitragynine/?utm_source=tiktok&utm_medium=organic&utm_campaign=ths_social_2026q4&utm_content=exp014',
  platform: 'short-video',
  format: 'short-video',
  campaignId: 'ths_social_2026q4',
}

function readyLifecycle() {
  let lifecycle = createDistributionLifecycle(identity, { now: '2026-10-06T12:00:00Z' })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'validated', { currentIdentity: identity, now: '2026-10-06T12:01:00Z' })
  return transitionDistributionLifecycle(lifecycle, 'ready', { currentIdentity: identity, now: '2026-10-06T12:02:00Z' })
}

function job() {
  return createPublicationJob({
    experimentId: 'exp014',
    artifactSha256: 'a'.repeat(64),
    platform: 'tiktok',
    intendedTime: '2026-10-06T10:00:00-04:00',
    lifecycleId: 'dist-example',
    identityFingerprint: 'b'.repeat(64),
    artifactUrls: ['https://thehippiescientist.net/media/distribution/publisher/mitragynine/video.mp4'],
    format: 'vertical-video',
    now: '2026-10-06T13:00:00Z',
  })
}

describe('TikTok THS Publisher adapter', () => {
  it('binds TikTok publish_id beneath canonical publication_id', async () => {
    const publication = job()
    const uploadImpl = vi.fn(async ({ lifecycle }) => ({
      publishId: 'v_inbox_url~v2.123',
      requestId: 'log-123',
      videoUrl: publication.artifacts[0],
      lifecycle: transitionDistributionLifecycle(lifecycle, 'scheduled', {
        currentIdentity: identity,
        provider: 'tiktok-draft-upload',
        externalId: 'v_inbox_url~v2.123',
        requestId: 'log-123',
        dryRun: false,
        now: '2026-10-06T14:00:00Z',
      }),
    }))

    const result = await dispatchTikTokPublication({
      job: publication,
      lifecycle: readyLifecycle(),
      currentIdentity: identity,
      uploadImpl,
      now: '2026-10-06T14:00:00Z',
    })

    expect(uploadImpl).toHaveBeenCalledTimes(1)
    expect(result.status).toBe('awaiting-user-post')
    expect(result.job.publicationId).toBe(publication.publicationId)
    expect(result.job.state).toBe('AWAITING_USER_POST')
    expect(result.job.providerReceipt).toMatchObject({
      provider: 'tiktok',
      providerOperationId: 'v_inbox_url~v2.123',
      publicationId: publication.publicationId,
    })
    expect(result.lifecycle.state).toBe('scheduled')
  })

  it('does not dispatch a second TikTok upload after provider acceptance', async () => {
    const uploadImpl = vi.fn(async ({ lifecycle }) => ({
      publishId: 'v_inbox_url~v2.123',
      requestId: 'log-123',
      videoUrl: job().artifacts[0],
      lifecycle: transitionDistributionLifecycle(lifecycle, 'scheduled', {
        currentIdentity: identity,
        provider: 'tiktok-draft-upload',
        externalId: 'v_inbox_url~v2.123',
        dryRun: false,
      }),
    }))
    const first = await dispatchTikTokPublication({
      job: job(),
      lifecycle: readyLifecycle(),
      currentIdentity: identity,
      uploadImpl,
    })
    const second = await dispatchTikTokPublication({
      job: first.job,
      lifecycle: first.lifecycle,
      currentIdentity: identity,
      uploadImpl,
    })
    expect(second.status).toBe('already-dispatched')
    expect(uploadImpl).toHaveBeenCalledTimes(1)
  })

  it('observer promotes to PUBLISHED only after TikTok returns public post identity', async () => {
    const uploadImpl = vi.fn(async ({ lifecycle }) => ({
      publishId: 'v_inbox_url~v2.123',
      requestId: 'log-123',
      videoUrl: job().artifacts[0],
      lifecycle: transitionDistributionLifecycle(lifecycle, 'scheduled', {
        currentIdentity: identity,
        provider: 'tiktok-draft-upload',
        externalId: 'v_inbox_url~v2.123',
        dryRun: false,
      }),
    }))
    const dispatched = await dispatchTikTokPublication({
      job: job(),
      lifecycle: readyLifecycle(),
      currentIdentity: identity,
      uploadImpl,
    })
    const statusImpl = vi.fn(async () => ({
      publishId: 'v_inbox_url~v2.123',
      status: 'PUBLISH_COMPLETE',
      inboxDelivered: true,
      publishComplete: true,
      failed: false,
      failReason: null,
      publicPostIds: ['746123456789'],
      downloadedBytes: 100,
      logId: 'observer-log',
    }))
    const observed = await observeTikTokPublication({
      job: dispatched.job,
      lifecycle: dispatched.lifecycle,
      currentIdentity: identity,
      statusImpl,
      now: '2026-10-06T14:10:00Z',
    })
    expect(observed.status).toBe('published')
    expect(observed.job.state).toBe('PUBLISHED')
    expect(observed.job.providerReceipt.externalId).toBe('746123456789')
    expect(observed.lifecycle.state).toBe('published')
    expect(observed.lifecycle.receipts.at(-1)).toMatchObject({
      provider: 'tiktok',
      externalId: '746123456789',
      dryRun: false,
    })
  })

  it('keeps inbox delivery distinct from public publication', async () => {
    const publication = job()
    let dispatching = publication
    const uploadImpl = vi.fn(async ({ lifecycle }) => ({
      publishId: 'v_inbox_url~v2.123',
      requestId: 'log-123',
      videoUrl: publication.artifacts[0],
      lifecycle: transitionDistributionLifecycle(lifecycle, 'scheduled', {
        currentIdentity: identity,
        provider: 'tiktok-draft-upload',
        externalId: 'v_inbox_url~v2.123',
        dryRun: false,
      }),
    }))
    const dispatched = await dispatchTikTokPublication({
      job: dispatching,
      lifecycle: readyLifecycle(),
      currentIdentity: identity,
      uploadImpl,
    })
    const observed = await observeTikTokPublication({
      job: dispatched.job,
      lifecycle: dispatched.lifecycle,
      currentIdentity: identity,
      statusImpl: async () => ({
        publishId: 'v_inbox_url~v2.123',
        status: 'SEND_TO_USER_INBOX',
        inboxDelivered: true,
        publishComplete: false,
        failed: false,
        failReason: null,
        publicPostIds: [],
        downloadedBytes: 100,
        logId: 'observer-log',
      }),
    })
    expect(observed.status).toBe('awaiting-user-post')
    expect(observed.job.state).toBe('AWAITING_USER_POST')
    expect(observed.lifecycle.state).toBe('scheduled')
  })
})
