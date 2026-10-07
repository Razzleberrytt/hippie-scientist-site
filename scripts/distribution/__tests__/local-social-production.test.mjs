import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildManualUploadPacket, nextActionMessage } from '../local-social-production.mjs'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const cleanup = []
afterEach(() => {
  while (cleanup.length) fs.rmSync(cleanup.pop(), { recursive: true, force: true })
})

function fixture() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-local-social-'))
  cleanup.push(temp)
  const stagedRoot = path.join(temp, 'stage')
  const releaseRoot = path.join(temp, 'release')
  const objectId = 'ashwagandha-stress-evidence'
  const fingerprint = 'a'.repeat(64)
  const bundleId = fingerprint.slice(0, 20)
  const bundle = path.join(stagedRoot, objectId, bundleId)
  fs.mkdirSync(bundle, { recursive: true })
  const mp4 = Buffer.from('governed-audible-video')
  fs.writeFileSync(path.join(bundle, 'short-video.mp4'), mp4)
  const manifest = {
    schemaVersion: 'ths-publication-media-v1',
    status: 'ready-for-provider',
    researchObjectId: objectId,
    lifecycleId: 'life-1',
    identityFingerprint: fingerprint,
    idempotencyKey: 'idem-1',
    packId: 'pack-1',
    sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
    taggedDestination: 'https://thehippiescientist.net/herbs/ashwagandha/?utm_campaign=test',
    sourceContentHash: 'b'.repeat(64),
    format: 'vertical-video',
    mediaType: 'video',
    text: 'Governed caption with qualifier. https://thehippiescientist.net/herbs/ashwagandha/?utm_campaign=test',
    media: [{
      file: 'short-video.mp4',
      sha256: sha256(mp4),
      bytes: mp4.length,
      contentType: 'video/mp4',
      width: 1080,
      height: 1920,
      durationSeconds: 30,
      audio: {
        codec: 'aac',
        localEngine: 'kokoro',
        naturalPresence: 'pass',
        pronunciation: 'pass',
        meteredCreditsRequired: false,
      },
    }],
  }
  return { stagedRoot, releaseRoot, manifest, mp4, objectId, bundleId }
}

describe('R8.04 local social production handoff', () => {
  it('creates an exact zero-credit manual-upload packet', () => {
    const { stagedRoot, releaseRoot, manifest, mp4, objectId, bundleId } = fixture()
    const result = buildManualUploadPacket({
      stagedManifest: manifest,
      stagedRoot,
      releaseRoot,
      generatedAt: '2026-10-07T16:00:00.000Z',
    })

    expect(result.destination).toBe(path.join(releaseRoot, objectId, bundleId))
    expect(fs.readFileSync(path.join(result.destination, 'short-video.mp4'))).toEqual(mp4)
    expect(fs.readFileSync(path.join(result.destination, 'caption.txt'), 'utf8')).toContain('Governed caption with qualifier.')
    expect(fs.readFileSync(path.join(result.destination, 'UPLOAD.txt'), 'utf8')).toContain('Do not regenerate the media in a premium editor')

    const release = JSON.parse(fs.readFileSync(path.join(result.destination, 'release-manifest.json'), 'utf8'))
    expect(release).toMatchObject({
      schemaVersion: 'ths-manual-upload-packet-v1',
      release: 'R8.04',
      transport: 'manual_native_upload',
      paidMembershipRequired: false,
      meteredGenerationCreditsRequired: false,
      thirdPartySchedulerRequired: false,
      researchObjectId: objectId,
      format: 'vertical-video',
    })
    expect(release.media[0]).toMatchObject({
      file: 'short-video.mp4',
      sha256: sha256(mp4),
      audio: {
        localEngine: 'kokoro',
        naturalPresence: 'pass',
        pronunciation: 'pass',
        meteredCreditsRequired: false,
      },
    })
  })

  it('rejects staged-media tampering before building the packet', () => {
    const { stagedRoot, releaseRoot, manifest, objectId, bundleId } = fixture()
    fs.writeFileSync(path.join(stagedRoot, objectId, bundleId, 'short-video.mp4'), 'tampered')
    expect(() => buildManualUploadPacket({ stagedManifest: manifest, stagedRoot, releaseRoot }))
      .toThrow(/integrity mismatch/i)
  })

  it('makes exact voice review the next action for short-video', () => {
    const message = nextActionMessage({
      platform: 'short-video',
      pilotDir: '/tmp/pilot',
      distributionDir: '/tmp/distribution',
    })
    expect(message).toContain('Listen to:')
    expect(message).toContain('Natural Presence')
    expect(message).toContain('social:local:finalize')
    expect(message).toContain('--natural-presence pass')
  })
})
