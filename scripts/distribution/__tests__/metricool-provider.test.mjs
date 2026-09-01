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
  packId: 'pack-1',
  packContentHash: 'pack-hash',
  creativeSpecHash: 'creative-hash',
  assetManifestHash: 'asset-hash',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  taggedDestination: 'https://thehippiescientist.net/herbs/ashwagandha/?utm_source=distribution-engine&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=pilot',
  platform: 'carousel',
  format: 'carousel',
  campaignId: 'evidence-to-distribution',
}

function dryRunScheduledLifecycle(now = '2026-08-30T12:00:00.000Z') {
  let lifecycle = createDistributionLifecycle(identity, { now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'validated', { currentIdentity: identity, now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'ready', { currentIdentity: identity, now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'scheduled', { currentIdentity: identity, now })
  return lifecycle
}

function carouselRequest() {
  return buildMetricoolSchedulerRequest({
    format: 'carousel',
    networks: 'facebook',
    text: 'Governed evidence caption.',
    mediaUrls: ['https://thehippiescientist.net/media/distribution/metricool/example/abc/carousel-01.png'],
    publicationAt: '2026-08-31T14:00:00-04:00',
    now: new Date('2026-08-30T12:00:00Z'),
    availableNetworks: ['facebook'],
  })
}

describe('Metricool scheduler request contract', () => {
  it('builds a bounded carousel request for explicitly available networks', () => {
    const request = buildMetricoolSchedulerRequest({
      format: 'carousel',
      networks: 'facebook,tiktok',
      text: 'Governed evidence caption.',
      mediaUrls: [
        'https://thehippiescientist.net/media/distribution/metricool/example/abc/carousel-01.png',
        'https://thehippiescientist.net/media/distribution/metricool/example/abc/carousel-02.png',
      ],
      publicationAt: '2026-08-31T14:00:00-04:00',
      timezone: 'America/New_York',
      title: 'Ashwagandha evidence',
      now: new Date('2026-08-30T12:00:00Z'),
      availableNetworks: ['facebook', 'tiktok', 'youtube'],
    })

    expect(request.providers).toEqual([{ network: 'facebook' }, { network: 'tiktok' }])
    expect(request.publicationDate).toEqual({ dateTime: '2026-08-31T14:00:00', timezone: 'America/New_York' })
    expect(request.autoPublish).toBe(true)
    expect(request.saveExternalMediaFiles).toBe(true)
    expect(request.facebookData.type).toBe('POST')
    expect(request.tiktokData.privacyOption).toBe('PUBLIC_TO_EVERYONE')
  })

  it('fails closed on a past time, offset-less time, date-only time, off-host media, or unsupported carousel target', () => {
    const base = {
      format: 'carousel',
      networks: 'facebook',
      text: 'Governed evidence caption.',
      mediaUrls: ['https://thehippiescientist.net/media/distribution/metricool/example/abc/carousel-01.png'],
      publicationAt: '2026-08-31T14:00:00-04:00',
      now: new Date('2026-08-30T12:00:00Z'),
      availableNetworks: ['facebook', 'tiktok', 'youtube'],
    }
    expect(() => buildMetricoolSchedulerRequest({ ...base, publicationAt: '2026-08-29T14:00:00-04:00' })).toThrow(/future/i)
    expect(() => buildMetricoolSchedulerRequest({ ...base, publicationAt: '2026-09-01T14:00:00' })).toThrow(/offset-aware/i)
    expect(() => buildMetricoolSchedulerRequest({ ...base, publicationAt: '2026-09-01' })).toThrow(/offset-aware/i)
    expect(() => buildMetricoolSchedulerRequest({ ...base, mediaUrls: ['https://example.com/carousel-01.png'] })).toThrow(/canonical publication host/i)
    expect(() => buildMetricoolSchedulerRequest({ ...base, networks: 'youtube' })).toThrow(/cannot publish/i)
  })
})

describe('Metricool live lifecycle promotion', () => {
  it('normalizes public media before scheduling and records real scheduled only after Metricool returns a provider id', async () => {
    const lifecycle = dryRunScheduledLifecycle()
    const request = carouselRequest()
    let seenToken = null
    let schedulerBody = null
    const calls = []
    const fetchImpl = async (url, options) => {
      calls.push({ url, options })
      seenToken = options.headers['X-Mc-Auth']
      if (url.includes('/actions/normalize/image/url')) {
        return {
          ok: true,
          status: 200,
          text: async () => 'https://metricool-storage.example/media/carousel-01.png',
          headers: { get: () => null },
        }
      }
      schedulerBody = JSON.parse(options.body)
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: 'metricool-post-123' }),
        headers: { get: (name) => name === 'x-request-id' ? 'req-456' : null },
      }
    }

    const result = await scheduleMetricoolPublication({
      lifecycle,
      currentIdentity: identity,
      request,
      userToken: 'super-secret-token',
      userId: '5228072',
      blogId: '6794242',
      fetchImpl,
      now: '2026-08-30T12:05:00.000Z',
    })

    expect(calls).toHaveLength(2)
    expect(calls[0].url).toContain('/actions/normalize/image/url')
    expect(calls[0].url).toContain('blogId=6794242')
    expect(calls[0].url).toContain('userId=5228072')
    expect(calls[1].url).toContain('/v2/scheduler/posts')
    expect(seenToken).toBe('super-secret-token')
    expect(schedulerBody.media).toEqual(['https://metricool-storage.example/media/carousel-01.png'])
    expect(schedulerBody.saveExternalMediaFiles).toBe(true)
    expect(result.externalId).toBe('metricool-post-123')
    expect(result.lifecycle.state).toBe('scheduled')
    expect(result.lifecycle.dryRun).toBe(false)
    expect(result.lifecycle.provider).toBe('metricool')
    expect(result.lifecycle.receipts).toHaveLength(2)
    expect(result.lifecycle.receipts[1]).toMatchObject({
      state: 'scheduled',
      provider: 'metricool',
      externalId: 'metricool-post-123',
      requestId: 'req-456',
      dryRun: false,
    })
    expect(JSON.stringify(result.lifecycle)).not.toContain('super-secret-token')
  })

  it('fails closed before scheduler dispatch when Metricool cannot normalize media', async () => {
    const lifecycle = dryRunScheduledLifecycle()
    const request = carouselRequest()
    let calls = 0
    const fetchImpl = async () => {
      calls += 1
      return {
        ok: false,
        status: 422,
        text: async () => 'media unavailable',
        headers: { get: () => null },
      }
    }

    await expect(scheduleMetricoolPublication({
      lifecycle,
      currentIdentity: identity,
      request,
      userToken: 'secret',
      userId: '5228072',
      blogId: '6794242',
      fetchImpl,
    })).rejects.toThrow(/media normalization failed/i)
    expect(calls).toBe(1)
    expect(lifecycle.dryRun).toBe(true)
    expect(lifecycle.receipts).toHaveLength(1)
  })

  it('never dispatches when the governed identity is stale', async () => {
    const lifecycle = dryRunScheduledLifecycle()
    let called = false
    const fetchImpl = async () => {
      called = true
      throw new Error('should not dispatch')
    }
    await expect(scheduleMetricoolPublication({
      lifecycle,
      currentIdentity: { ...identity, assetManifestHash: 'changed-asset-hash' },
      request: {},
      userToken: 'secret',
      userId: '5228072',
      blogId: '6794242',
      fetchImpl,
    })).rejects.toThrow(/upstream identity changed/i)
    expect(called).toBe(false)
  })

  it('fails closed for live video until a governed Metricool video-normalization boundary is implemented', async () => {
    const lifecycle = dryRunScheduledLifecycle()
    let called = false
    await expect(scheduleMetricoolPublication({
      lifecycle,
      currentIdentity: identity,
      request: carouselRequest(),
      mediaType: 'video',
      userToken: 'secret',
      userId: '5228072',
      blogId: '6794242',
      fetchImpl: async () => { called = true },
    })).rejects.toThrow(/image\/carousel assets only/i)
    expect(called).toBe(false)
  })
})

describe('Metricool public media staging', () => {
  it('copies hash-verified WebP assets and swaps only the destination URL for its governed attribution variant', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-metricool-stage-'))
    try {
      const sourceDir = path.join(temp, 'pilot')
      const publicRoot = path.join(temp, 'public-media')
      fs.mkdirSync(sourceDir, { recursive: true })
      const bytes = Buffer.from('deterministic-webp-fixture')
      fs.writeFileSync(path.join(sourceDir, 'carousel-01.webp'), bytes)
      const lifecycle = dryRunScheduledLifecycle()
      const pilot = {
        schemaVersion: 'bounded-distribution-pilot-v1',
        status: 'dry-run-scheduled',
        selectedOpportunity: { id: 'ashwagandha-stress-evidence' },
        lifecycle,
        assets: {
          exporter: 'carousel-raster-v1',
          packId: 'pack-1',
          sourceUrl: identity.sourceUrl,
          sourceContentHash: identity.researchObjectHash,
          assets: [{
            type: 'carousel-slide-raster',
            format: 'webp',
            file: 'carousel-01.webp',
            sha256: sha256(bytes),
            width: 1080,
            height: 1350,
          }],
        },
      }
      const packageData = {
        mediaPack: { status: 'validated', packId: 'pack-1' },
        sharedFacts: { title: 'Ashwagandha evidence' },
        instagram: `Governed evidence caption. Read the evidence page: ${identity.sourceUrl}`,
      }

      const manifest = stageMetricoolPublicationMedia({
        pilot,
        packageData,
        sourceDir,
        publicRoot,
        now: '2026-08-30T12:00:00.000Z',
      })
      expect(manifest.status).toBe('ready-for-provider')
      expect(manifest.identityFingerprint).toBe(lifecycle.identity.fingerprint)
      expect(manifest.allowedNetworks).toEqual(['facebook', 'tiktok'])
      expect(manifest.taggedDestination).toBe(identity.taggedDestination)
      expect(manifest.text).toContain(identity.taggedDestination)
      const trailing = manifest.text.split(identity.sourceUrl).slice(1)
      expect(trailing.length).toBeGreaterThan(0)
      expect(trailing.every((rest) => rest.startsWith('?'))).toBe(true)
      expect(manifest.media).toHaveLength(1)
      expect(manifest.media[0].url).toContain('/media/distribution/metricool/ashwagandha-stress-evidence/')
      expect(fs.existsSync(path.join(publicRoot, 'latest.json'))).toBe(true)
      expect(fs.existsSync(path.join(publicRoot, 'ashwagandha-stress-evidence', lifecycle.identity.fingerprint.slice(0, 20), 'carousel-01.webp'))).toBe(true)
    } finally {
      fs.rmSync(temp, { recursive: true, force: true })
    }
  })
})

describe('Metricool workflow retry safety', () => {
  it('persists a durable governed-identity reservation before provider dispatch', () => {
    const workflow = fs.readFileSync(path.resolve('.github/workflows/metricool-publication.yml'), 'utf8')
    const check = workflow.indexOf('Check durable dispatch reservation')
    const reserve = workflow.indexOf('Reserve exact governed identity before provider dispatch')
    const dispatch = workflow.indexOf('Schedule governed publication in Metricool')
    expect(workflow).toContain('/actions/artifacts')
    expect(workflow).toContain('metricool-dispatch-reservation-${IDEMPOTENCY_KEY}')
    expect(workflow).toContain('A durable Metricool dispatch reservation already exists')
    expect(check).toBeGreaterThan(-1)
    expect(reserve).toBeGreaterThan(check)
    expect(dispatch).toBeGreaterThan(reserve)
  })
})
