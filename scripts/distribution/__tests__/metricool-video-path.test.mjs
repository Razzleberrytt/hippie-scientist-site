import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createDistributionLifecycle, transitionDistributionLifecycle } from '../distribution-lifecycle.mjs'
import { buildMetricoolSchedulerRequest, scheduleMetricoolPublication } from '../metricool-provider.mjs'
import { stageMetricoolPublicationMedia } from '../stage-metricool-publication-media.mjs'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

const identity = {
  researchObjectId: 'ashwagandha-stress-evidence',
  researchObjectHash: 'research-hash',
  packId: 'pack-video-1',
  packContentHash: 'pack-content-hash',
  creativeSpecHash: 'creative-hash',
  assetManifestHash: 'asset-hash',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  taggedDestination: 'https://thehippiescientist.net/herbs/ashwagandha/?utm_source=distribution-engine&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=video-pilot',
  platform: 'short-video',
  format: 'short-video',
  campaignId: 'evidence-to-distribution',
}

function dryRunScheduledLifecycle(now = '2026-08-30T12:00:00.000Z') {
  let lifecycle = createDistributionLifecycle(identity, { now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'validated', { currentIdentity: identity, now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'ready', { currentIdentity: identity, now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'scheduled', { currentIdentity: identity, now })
  return lifecycle
}

function videoRequest(networks = 'tiktok') {
  return buildMetricoolSchedulerRequest({
    format: 'vertical-video',
    networks,
    text: 'Governed evidence caption.',
    mediaUrls: ['https://thehippiescientist.net/media/distribution/metricool/example/abc/short-video.mp4'],
    publicationAt: '2026-08-31T14:00:00-04:00',
    title: 'Ashwagandha evidence',
    youtubePrivacy: networks.includes('youtube') ? 'private' : undefined,
    youtubeMadeForKids: networks.includes('youtube') ? false : undefined,
    youtubeAiGeneratedContent: networks.includes('youtube') ? true : undefined,
    now: new Date('2026-08-30T12:00:00Z'),
    availableNetworks: ['facebook', 'tiktok', 'youtube'],
  })
}

function writeVideoFixture(temp, { staleParentHash = false } = {}) {
  const sourceDir = path.join(temp, 'pilot')
  const publicRoot = path.join(temp, 'public-media')
  fs.mkdirSync(sourceDir, { recursive: true })
  const lifecycle = dryRunScheduledLifecycle()
  const assetManifest = {
    schemaVersion: '1.0.0',
    renderer: 'vertical-video-package-v1',
    packId: identity.packId,
    sourceUrl: identity.sourceUrl,
    sourceContentHash: identity.researchObjectHash,
    durationSeconds: 30,
    assets: [],
  }
  const manifestBytes = Buffer.from(`${JSON.stringify(assetManifest, null, 2)}\n`)
  const mp4Bytes = Buffer.from('deterministic-governed-mp4-fixture')
  fs.writeFileSync(path.join(sourceDir, 'video-asset-manifest.json'), manifestBytes)
  fs.writeFileSync(path.join(sourceDir, 'short-video.mp4'), mp4Bytes)
  fs.writeFileSync(path.join(sourceDir, 'short-video.mp4.receipt.json'), `${JSON.stringify({
    schemaVersion: '1.0.0',
    renderer: 'vertical-video-mp4-v1',
    parentRenderer: 'vertical-video-package-v1',
    packId: identity.packId,
    sourceUrl: identity.sourceUrl,
    sourceContentHash: identity.researchObjectHash,
    parentManifestSha256: staleParentHash ? '0'.repeat(64) : sha256(manifestBytes),
    ffmpegVersion: 'ffmpeg test fixture',
    renderKey: 'render-key-fixture',
    profile: { width: 1080, height: 1920, fps: 30, durationSeconds: 30, codec: 'libx264', pixelFormat: 'yuv420p', audio: false },
    output: { file: 'short-video.mp4', sha256: sha256(mp4Bytes), bytes: mp4Bytes.length },
  }, null, 2)}\n`)
  return {
    sourceDir,
    publicRoot,
    lifecycle,
    pilot: {
      schemaVersion: 'bounded-distribution-pilot-v1',
      status: 'dry-run-scheduled',
      selectedOpportunity: { id: identity.researchObjectId, platform: 'short-video' },
      lifecycle,
      assets: assetManifest,
    },
    packageData: {
      mediaPack: { status: 'validated', packId: identity.packId },
      sharedFacts: { title: 'Ashwagandha evidence' },
      instagram: `Governed evidence caption. Read the evidence page: ${identity.sourceUrl}`,
    },
    mp4Bytes,
  }
}

describe('Metricool governed vertical-video staging', () => {
  it('stages one receipt-bound MP4 with provider/network metadata', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-metricool-video-stage-'))
    try {
      const fixture = writeVideoFixture(temp)
      const manifest = stageMetricoolPublicationMedia({
        pilot: fixture.pilot,
        packageData: fixture.packageData,
        sourceDir: fixture.sourceDir,
        publicRoot: fixture.publicRoot,
        now: '2026-08-30T12:00:00.000Z',
      })
      expect(manifest).toMatchObject({
        status: 'ready-for-provider',
        format: 'vertical-video',
        mediaType: 'video',
        allowedNetworks: ['facebook', 'tiktok', 'youtube'],
      })
      expect(manifest.media).toHaveLength(1)
      expect(manifest.media[0]).toMatchObject({
        file: 'short-video.mp4',
        contentType: 'video/mp4',
        width: 1080,
        height: 1920,
        durationSeconds: 30,
        sha256: sha256(fixture.mp4Bytes),
      })
      expect(fs.readFileSync(path.join(fixture.publicRoot, identity.researchObjectId, fixture.lifecycle.identity.fingerprint.slice(0, 20), 'short-video.mp4'))).toEqual(fixture.mp4Bytes)
    } finally {
      fs.rmSync(temp, { recursive: true, force: true })
    }
  })

  it('rejects an MP4 whose receipt is stale relative to the governed parent manifest', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-metricool-video-stale-'))
    try {
      const fixture = writeVideoFixture(temp, { staleParentHash: true })
      expect(() => stageMetricoolPublicationMedia({
        pilot: fixture.pilot,
        packageData: fixture.packageData,
        sourceDir: fixture.sourceDir,
        publicRoot: fixture.publicRoot,
      })).toThrow(/parent manifest hash mismatch/i)
    } finally {
      fs.rmSync(temp, { recursive: true, force: true })
    }
  })
})

describe('Metricool governed video normalization', () => {
  it('normalizes one public MP4 before a live vertical-video scheduler dispatch', async () => {
    const lifecycle = dryRunScheduledLifecycle()
    const request = videoRequest('tiktok,youtube')
    const calls = []
    let schedulerBody = null
    const fetchImpl = async (url, options) => {
      calls.push({ url, options })
      if (url.includes('/actions/normalize/image/url')) {
        return {
          ok: true,
          status: 200,
          text: async () => 'https://metricool-storage.example/media/short-video.mp4',
          headers: { get: () => null },
        }
      }
      schedulerBody = JSON.parse(options.body)
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: 'metricool-video-123' }),
        headers: { get: (name) => name === 'x-request-id' ? 'req-video-456' : null },
      }
    }

    const result = await scheduleMetricoolPublication({
      lifecycle,
      currentIdentity: identity,
      request,
      mediaType: 'video',
      format: 'vertical-video',
      userToken: 'super-secret-token',
      userId: '5228072',
      blogId: '6794242',
      fetchImpl,
      now: '2026-08-30T12:05:00.000Z',
    })

    expect(calls).toHaveLength(2)
    expect(calls[0].url).toContain('/actions/normalize/image/url')
    expect(schedulerBody.media).toEqual(['https://metricool-storage.example/media/short-video.mp4'])
    expect(schedulerBody.youtubeData).toMatchObject({ type: 'short', privacy: 'private', madeForKids: false, isAiGeneratedContent: true })
    expect(result.externalId).toBe('metricool-video-123')
    expect(result.lifecycle.dryRun).toBe(false)
    expect(result.lifecycle.provider).toBe('metricool')
  })

  it('fails closed before scheduler dispatch when governed video normalization fails', async () => {
    const lifecycle = dryRunScheduledLifecycle()
    let calls = 0
    await expect(scheduleMetricoolPublication({
      lifecycle,
      currentIdentity: identity,
      request: videoRequest(),
      mediaType: 'video',
      format: 'vertical-video',
      userToken: 'secret',
      userId: '5228072',
      blogId: '6794242',
      fetchImpl: async () => {
        calls += 1
        return { ok: false, status: 422, text: async () => 'video unavailable', headers: { get: () => null } }
      },
    })).rejects.toThrow(/media normalization failed/i)
    expect(calls).toBe(1)
    expect(lifecycle.dryRun).toBe(true)
  })
})

describe('video deployment governance', () => {
  it('provisions ffmpeg and verifies format-specific static media before deployment', () => {
    const workflow = fs.readFileSync(path.resolve('.github/workflows/deploy.yml'), 'utf8')
    expect(workflow).toContain('Provision and verify ffmpeg for governed video rendering')
    expect(workflow).toContain('sudo apt-get install -y ffmpeg')
    expect(workflow).toContain("manifest.format === 'vertical-video'")
    expect(workflow).toContain("manifest.mediaType !== 'video'")
    expect(workflow).toContain('governed media hash mismatch in static output')
  })

  it('uses the deployed governed manifest for dispatch and never revives the image placeholder', () => {
    const workflow = fs.readFileSync(path.resolve('.github/workflows/metricool-publication.yml'), 'utf8')
    expect(workflow).toContain('Validate deployed governed publication boundary')
    expect(workflow).toContain('METRICOOL_YOUTUBE_MADE_FOR_KIDS')
    expect(workflow).toContain('METRICOOL_YOUTUBE_AI_GENERATED_CONTENT')
    expect(workflow).not.toContain('pre-dispatch/example.png')
  })
})
