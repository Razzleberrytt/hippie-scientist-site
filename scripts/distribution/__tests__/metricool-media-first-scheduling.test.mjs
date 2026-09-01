import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createDistributionLifecycle, transitionDistributionLifecycle } from '../distribution-lifecycle.mjs'
import { scheduleMetricoolPublicationFromArtifacts } from '../schedule-metricool-publication.mjs'

const identity = {
  researchObjectId: 'ashwagandha-stress-evidence',
  researchObjectHash: 'research-hash',
  packId: 'pack-carousel-1',
  packContentHash: 'pack-content-hash',
  creativeSpecHash: 'creative-hash',
  assetManifestHash: 'asset-hash',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  taggedDestination: 'https://thehippiescientist.net/herbs/ashwagandha/?utm_source=distribution-engine&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=carousel-pilot',
  platform: 'carousel',
  format: 'carousel',
  campaignId: 'evidence-to-distribution',
}

function scheduledLifecycle() {
  const now = '2026-08-31T12:00:00.000Z'
  let lifecycle = createDistributionLifecycle(identity, { now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'validated', { currentIdentity: identity, now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'ready', { currentIdentity: identity, now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'scheduled', { currentIdentity: identity, now })
  return lifecycle
}

describe('Metricool media-first live scheduling', () => {
  it('sends concise creative framing while retaining the attributed destination and native media', async () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-media-first-schedule-'))
    try {
      const lifecycle = scheduledLifecycle()
      const distributionDir = path.join(temp, 'distribution')
      const pilotDir = path.join(distributionDir, 'pilots', identity.researchObjectId)
      fs.mkdirSync(pilotDir, { recursive: true })
      fs.writeFileSync(path.join(distributionDir, 'opportunity-selection.json'), JSON.stringify({ selected: { id: identity.researchObjectId } }))
      fs.writeFileSync(path.join(distributionDir, `${identity.researchObjectId}.json`), JSON.stringify({
        mediaPack: { status: 'validated', packId: identity.packId },
        sharedFacts: { sourceUrl: identity.sourceUrl },
        socialPost: {
          hook: 'Does Ashwagandha hold up when you look at the human studies? 🌿',
          hashtags: ['#Ashwagandha', '#SupplementScience', '#StressResearch'],
        },
      }))
      fs.writeFileSync(path.join(pilotDir, 'bounded-pilot.json'), JSON.stringify({ lifecycle }))

      const mediaUrl = 'https://thehippiescientist.net/media/distribution/metricool/example/abc/carousel-01.png'
      const manifest = {
        schemaVersion: 'metricool-publication-media-v1',
        status: 'ready-for-provider',
        researchObjectId: identity.researchObjectId,
        lifecycleId: lifecycle.lifecycleId,
        identityFingerprint: lifecycle.identity.fingerprint,
        packId: identity.packId,
        format: 'carousel',
        mediaType: 'image',
        allowedNetworks: ['facebook'],
        title: 'Ashwagandha evidence',
        text: 'Legacy dense caption that should not be dispatched.',
        media: [{ url: mediaUrl }],
      }

      let schedulerBody = null
      const fetchImpl = async (url, options = {}) => {
        if (url === 'https://example.test/latest.json') {
          return { ok: true, status: 200, json: async () => manifest, headers: { get: () => 'application/json' } }
        }
        if (url === mediaUrl && options.method === 'HEAD') {
          return { ok: true, status: 200, headers: { get: (name) => name.toLowerCase() === 'content-type' ? 'image/png' : null } }
        }
        if (url.includes('/actions/normalize/image/url')) {
          return { ok: true, status: 200, text: async () => 'https://metricool-storage.example/carousel-01.png', headers: { get: () => null } }
        }
        if (url.includes('/v2/scheduler/posts')) {
          schedulerBody = JSON.parse(options.body)
          return { ok: true, status: 200, text: async () => JSON.stringify({ id: 'metricool-media-first-1' }), headers: { get: () => null } }
        }
        throw new Error(`unexpected fetch: ${url}`)
      }

      const receipt = await scheduleMetricoolPublicationFromArtifacts({
        distributionDir,
        manifestUrl: 'https://example.test/latest.json',
        publicationAt: '2026-09-01T14:00:00-04:00',
        networks: 'facebook',
        userToken: 'secret',
        userId: '5228072',
        blogId: '6794242',
        fetchImpl,
        now: new Date('2026-08-31T12:05:00.000Z'),
      })

      expect(schedulerBody.text).toContain('Swipe for what the studies found, the key limitation, and the source trail.')
      expect(schedulerBody.text).toContain('utm_campaign=evidence-to-distribution')
      expect(schedulerBody.text).not.toContain('Legacy dense caption')
      expect(schedulerBody.shortener).toBe(true)
      expect(schedulerBody.media).toEqual(['https://metricool-storage.example/carousel-01.png'])
      expect(receipt.captionSchemaVersion).toBe('media-first-caption-v1')
    } finally {
      fs.rmSync(temp, { recursive: true, force: true })
    }
  })
})
