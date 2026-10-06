import { describe, expect, it } from 'vitest'
import { createDistributionLifecycle, transitionDistributionLifecycle } from '../distribution-lifecycle.mjs'
import {
  assertGovernedTikTokDraftUrl,
  getGovernedTikTokDraftStatus,
  uploadGovernedTikTokDraft,
} from '../tiktok-upload-provider.mjs'

const identity = {
  researchObjectId: 'mitragynine-evidence',
  researchObjectHash: 'research-hash',
  packId: 'pack-1',
  packContentHash: 'pack-hash',
  creativeSpecHash: 'creative-hash',
  assetManifestHash: 'asset-hash',
  sourceUrl: 'https://thehippiescientist.net/compounds/mitragynine/',
  taggedDestination: 'https://thehippiescientist.net/compounds/mitragynine/?utm_source=tiktok',
  platform: 'tiktok',
  format: 'short-video',
  campaignId: 'mitragynine-evidence',
}

function readyLifecycle() {
  let lifecycle = createDistributionLifecycle(identity, { now: '2026-10-06T12:00:00.000Z' })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'validated', { currentIdentity: identity, now: '2026-10-06T12:01:00.000Z' })
  return transitionDistributionLifecycle(lifecycle, 'ready', { currentIdentity: identity, now: '2026-10-06T12:02:00.000Z' })
}

describe('TikTok draft upload provider', () => {
  it('accepts only canonical governed MP4 URLs', () => {
    expect(assertGovernedTikTokDraftUrl('https://thehippiescientist.net/media/distribution/tiktok/abc/video.mp4'))
      .toBe('https://thehippiescientist.net/media/distribution/tiktok/abc/video.mp4')
    expect(() => assertGovernedTikTokDraftUrl('http://thehippiescientist.net/media/distribution/video.mp4')).toThrow(/governed/i)
    expect(() => assertGovernedTikTokDraftUrl('https://example.com/media/distribution/video.mp4')).toThrow(/governed/i)
    expect(() => assertGovernedTikTokDraftUrl('https://thehippiescientist.net/video.mp4')).toThrow(/governed/i)
    expect(() => assertGovernedTikTokDraftUrl('https://thehippiescientist.net/media/distribution/video.png')).toThrow(/governed/i)
  })

  it('records provider acceptance as scheduled, never as published', async () => {
    const fetchImpl = async (url, options) => {
      expect(url).toBe('https://thehippiescientist.net/api/tiktok/upload')
      expect(options.headers.Authorization).toBe('Bearer admin-secret')
      return new Response(JSON.stringify({
        ok: true,
        provider: 'tiktok',
        mode: 'draft-upload',
        publishId: 'v_inbox_url~v2.123',
        logId: 'log-123',
      }), { status: 200 })
    }
    const result = await uploadGovernedTikTokDraft({
      lifecycle: readyLifecycle(),
      currentIdentity: identity,
      videoUrl: 'https://thehippiescientist.net/media/distribution/tiktok/abc/video.mp4',
      adminToken: 'admin-secret',
      fetchImpl,
      now: '2026-10-06T12:05:00.000Z',
    })
    expect(result.publishId).toBe('v_inbox_url~v2.123')
    expect(result.lifecycle.state).toBe('scheduled')
    expect(result.lifecycle.provider).toBe('tiktok-draft-upload')
    expect(result.lifecycle.dryRun).toBe(false)
    expect(result.lifecycle.receipts.at(-1)).toMatchObject({
      state: 'scheduled',
      provider: 'tiktok-draft-upload',
      externalId: 'v_inbox_url~v2.123',
      requestId: 'log-123',
      dryRun: false,
    })
    expect(result.lifecycle.receipts.some((receipt) => receipt.state === 'published')).toBe(false)
  })

  it('rejects stale lifecycle identity before dispatch', async () => {
    let called = false
    const currentIdentity = { ...identity, assetManifestHash: 'changed' }
    await expect(uploadGovernedTikTokDraft({
      lifecycle: readyLifecycle(),
      currentIdentity,
      videoUrl: 'https://thehippiescientist.net/media/distribution/tiktok/abc/video.mp4',
      adminToken: 'admin-secret',
      fetchImpl: async () => { called = true; throw new Error('should not call') },
    })).rejects.toThrow(/upstream identity changed/i)
    expect(called).toBe(false)
  })

  it('refuses to send the publisher admin token to a non-canonical bridge host', async () => {
    let called = false
    await expect(uploadGovernedTikTokDraft({
      lifecycle: readyLifecycle(),
      currentIdentity: identity,
      videoUrl: 'https://thehippiescientist.net/media/distribution/tiktok/abc/video.mp4',
      adminToken: 'admin-secret',
      bridgeBase: 'https://evil.example',
      fetchImpl: async () => { called = true; throw new Error('should not call') },
    })).rejects.toThrow(/canonical HTTPS publisher host/i)
    expect(called).toBe(false)
  })

  it('normalizes inbox and publish-complete status without promoting lifecycle itself', async () => {
    const fetchImpl = async () => new Response(JSON.stringify({
      ok: true,
      publishId: 'v_inbox_url~v2.123',
      status: 'SEND_TO_USER_INBOX',
      inboxDelivered: true,
      publishComplete: false,
      failed: false,
      failReason: null,
      publicPostIds: [],
      downloadedBytes: 123456,
      logId: 'status-log',
    }), { status: 200 })
    const status = await getGovernedTikTokDraftStatus({
      publishId: 'v_inbox_url~v2.123',
      adminToken: 'admin-secret',
      fetchImpl,
    })
    expect(status).toMatchObject({
      status: 'SEND_TO_USER_INBOX',
      inboxDelivered: true,
      publishComplete: false,
      downloadedBytes: 123456,
    })
  })
})
