import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { stageMetricoolPublicationMedia } from '../stage-metricool-publication-media.mjs'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

function fixture(temp) {
  const sourceDir = path.join(temp, 'pilot')
  const publicRoot = path.join(temp, 'public-media')
  fs.mkdirSync(sourceDir, { recursive: true })

  const webpBytes = Buffer.from('governed-webp-fixture')
  const pngBytes = Buffer.from('governed-png-fixture')
  fs.writeFileSync(path.join(sourceDir, 'carousel-01.webp'), webpBytes)
  fs.writeFileSync(path.join(sourceDir, 'carousel-01.png'), pngBytes)

  const sourceUrl = 'https://thehippiescientist.net/herbs/ashwagandha/'
  const fingerprint = 'a'.repeat(64)
  const packId = 'pack-carousel-1'
  const pilot = {
    schemaVersion: 'bounded-distribution-pilot-v1',
    status: 'dry-run-scheduled',
    selectedOpportunity: { id: 'ashwagandha-stress-evidence', platform: 'carousel' },
    lifecycle: {
      state: 'scheduled',
      dryRun: true,
      lifecycleId: 'lifecycle-carousel-1',
      identity: {
        fingerprint,
        idempotencyKey: 'idempotency-carousel-1',
        format: 'carousel',
        sourceUrl,
        taggedDestination: `${sourceUrl}?utm_source=distribution-engine&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=carousel-test`,
      },
    },
    assets: {
      exporter: 'carousel-raster-v1',
      packId,
      sourceUrl,
      sourceContentHash: 'source-hash',
      assets: [
        { type: 'carousel-slide-raster', format: 'png', file: 'carousel-01.png', sha256: sha256(pngBytes), width: 1080, height: 1350, deliveryProfile: 'canonical' },
        { type: 'carousel-slide-raster', format: 'webp', file: 'carousel-01.webp', sha256: sha256(webpBytes), width: 864, height: 1080, deliveryProfile: 'metricool-tiktok-photo-v1' },
      ],
    },
  }
  const packageData = {
    mediaPack: { status: 'validated', packId },
    sharedFacts: { title: 'Ashwagandha evidence' },
    instagram: `Governed evidence caption. Read the evidence page: ${sourceUrl}`,
  }
  return { sourceDir, publicRoot, pilot, packageData, webpBytes }
}

describe('Metricool governed carousel media compatibility', () => {
  it('stages provider-safe WebP rather than PNG for TikTok-compatible carousel publication', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-metricool-carousel-webp-'))
    try {
      const data = fixture(temp)
      const manifest = stageMetricoolPublicationMedia({
        pilot: data.pilot,
        packageData: data.packageData,
        sourceDir: data.sourceDir,
        publicRoot: data.publicRoot,
        now: '2026-08-31T22:50:00.000Z',
      })
      expect(manifest.allowedNetworks).toEqual(['facebook', 'tiktok'])
      expect(manifest.media).toHaveLength(1)
      expect(manifest.media[0]).toMatchObject({
        file: 'carousel-01.webp',
        contentType: 'image/webp',
        sha256: sha256(data.webpBytes),
        width: 864,
        height: 1080,
      })
      expect(Math.max(manifest.media[0].width, manifest.media[0].height)).toBeLessThanOrEqual(1080)
      expect(fs.existsSync(path.join(data.publicRoot, 'ashwagandha-stress-evidence', 'a'.repeat(20), 'carousel-01.webp'))).toBe(true)
      expect(fs.existsSync(path.join(data.publicRoot, 'ashwagandha-stress-evidence', 'a'.repeat(20), 'carousel-01.png'))).toBe(false)
    } finally {
      fs.rmSync(temp, { recursive: true, force: true })
    }
  })

  it('fails closed when a governed carousel has no TikTok-compatible WebP derivative', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-metricool-carousel-no-webp-'))
    try {
      const data = fixture(temp)
      data.pilot.assets.assets = data.pilot.assets.assets.filter((asset) => asset.format === 'png')
      expect(() => stageMetricoolPublicationMedia({
        pilot: data.pilot,
        packageData: data.packageData,
        sourceDir: data.sourceDir,
        publicRoot: data.publicRoot,
      })).toThrow(/requires at least one WebP carousel asset/i)
    } finally {
      fs.rmSync(temp, { recursive: true, force: true })
    }
  })
})
