import { describe, it, expect, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import {
  linkPublishedFlywheelVideo, appendLinkedFlywheelObservation, videoIdFromPublicUrl,
} from '../observatory-publisher-bridge.mjs'
import { registerFlywheelVideo, getFlywheelVideo } from '../evidencemotion-flywheel.mjs'
import {
  createPublicationJob, beginPublicationAttempt, acceptProviderReceipt, markPublicationPublished,
} from '../social-publisher-core.mjs'

let dirs = []
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const root = () => { const value = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-observatory-')); dirs.push(value); return value }
afterEach(() => { for (const d of dirs) fs.rmSync(d, { recursive: true, force: true }); dirs = [] })

function fixture(directory, videoId = 'ao-video-one') {
  const master = path.join(directory, 'master-' + videoId + '.mp4')
  const manifest = path.join(directory, 'manifest-' + videoId + '.json')
  const pubFile = path.join(directory, 'publisher-' + videoId + '.json')
  const masterBytes = Buffer.from('synthetic mp4 hash-bound fixture; never a real video')
  const manifestBytes = Buffer.from('{"schemaVersion":"fixture-only"}\n')
  fs.writeFileSync(master, masterBytes)
  fs.writeFileSync(manifest, manifestBytes)
  const artifactSha256 = sha(masterBytes)
  registerFlywheelVideo(directory, {
    videoId, platform: 'tiktok', topic: 'Science communication fixture',
    hookTextFirst3Seconds: 'What does research say?', beatTemplateVersion: 'R8.10',
    publishedAt: '2026-10-01T12:00:00Z',
    publishedUrl: 'https://www.tiktok.com/@hippiescientist/video/7691823286157708557',
    publicationEvidence: 'manual-owner-attested',
    artifactSha256, productionManifestSha256: sha(manifestBytes),
  })
  let job = createPublicationJob({
    experimentId: 'ao-hook-fixture', artifactSha256, platform: 'tiktok',
    intendedTime: '2026-10-01T12:00:00Z',
    artifactUrls: ['https://example.org/approved-video.mp4'],
    now: '2026-10-01T11:00:00Z',
  })
  job = beginPublicationAttempt(job, { provider: 'tiktok', now: '2026-10-01T11:50:00Z' })
  job = acceptProviderReceipt(job, {
    provider: 'tiktok', nextState: 'AWAITING_USER_POST',
    receipt: { publishId: 'example-inbox-id' }, now: '2026-10-01T11:55:00Z',
  })
  job = markPublicationPublished(job, {
    provider: 'tiktok', externalId: '7691823286157708557', now: '2026-10-01T12:30:00Z',
  })
  const save = (value) => fs.writeFileSync(pubFile, JSON.stringify(value, null, 2) + '\n')
  save(job)
  return { videoId, directory, master, manifest, pubFile, job, save, args: {
    videoId, publisherJobFile: pubFile, masterFile: master, productionManifestFile: manifest,
  }}
}
function observation(videoId) {
  return {
    videoId, observedAt: '2026-10-08T12:00:00Z', metricsThroughAt: '2026-10-08T12:00:00Z',
    metricWindow: 'first-7d', source: 'manual-owner-entry',
    metrics: { views: 150, likes: 4, followsAttributed: null,
      watchThroughPercent: null, averageRetentionPercent: null, threeSecondHoldPercent: null },
    note: 'Fixture only; no provider or user performance validation',
  }
}
describe('AO #6810 Publisher PUBLISHED → existing immutable flywheel bridge', () => {
  it('links a canonical PUBLISHED job, actual master bytes and source-manifest bytes; repeat is idempotent', () => {
    const dir = root(); const f = fixture(dir)
    const result = linkPublishedFlywheelVideo(dir, f.args)
    expect(result.idempotent).toBe(false)
    expect(result.publicationId).toBe(f.job.publicationId)
    expect(result.platformPostId).toBe('7691823286157708557')
    expect(result.artifactSha256).toBe(sha(fs.readFileSync(f.master)))
    expect(result.publishingAuthority).toBe(false)
    expect(linkPublishedFlywheelVideo(dir, f.args).idempotent).toBe(true)
    expect(getFlywheelVideo(dir, f.videoId).publicationEvidence).toBe('manual-owner-attested')
    expect(fs.existsSync(path.join(dir, 'videos', f.videoId, 'PUBLISHER_LINK.json'))).toBe(true)
  })
  it('accepts canonical manual PUBLISHED URL receipts without dispatch attempts', () => {
    const dir = root(); const f = fixture(dir)
    const url = 'https://www.tiktok.com/@hippiescientist/video/7691823286157708557'
    const receipt = {
      provider: 'manual', providerOperationId: url, externalId: url, publicUrl: url,
      verifiedPublishedAt: '2026-10-01T12:00:00Z', publicationId: f.job.publicationId,
    }
    f.save({
      ...f.job, state: 'PUBLISHED', attempts: [], providerReceipt: receipt,
      providerReceipts: [receipt], publicUrl: url, publishedAt: '2026-10-01T12:00:00Z',
    })
    const result = linkPublishedFlywheelVideo(dir, f.args)
    expect(result.platformPostId).toBe('7691823286157708557')
    expect(result.idempotent).toBe(false)
    expect(linkPublishedFlywheelVideo(dir, f.args).idempotent).toBe(true)
  })
  it('accepts canonical manual reconciliation with published evidence and no new dispatch', () => {
    const dir = root(); const f = fixture(dir)
    const url = 'https://www.tiktok.com/@hippiescientist/video/7691823286157708557'
    const receipt = {
      provider: 'manual-reconciliation', providerOperationId: url, externalId: url, publicUrl: url,
      verifiedPublishedAt: '2026-10-01T12:00:00Z', publicationId: f.job.publicationId,
    }
    const base = {
      ...f.job, state: 'PUBLISHED', attempts: [], providerReceipt: receipt,
      providerReceipts: [receipt], publicUrl: url, publishedAt: '2026-10-01T12:00:00Z',
      reconciliationReceipts: [{ outcome: 'published', publicUrl: url, evidence: 'independently observed public post' }],
    }
    f.save(base)
    expect(linkPublishedFlywheelVideo(dir, f.args).platformPostId).toBe('7691823286157708557')
  })
  it('rejects a fabricated or contradictory canonical manual publication URL receipt', () => {
    const dir = root(); const f = fixture(dir)
    const url = 'https://www.tiktok.com/@hippiescientist/video/7691823286157708557'
    const receipt = {
      provider: 'manual', providerOperationId: url, externalId: url, publicUrl: url,
      verifiedPublishedAt: '2026-10-01T12:00:00Z', publicationId: f.job.publicationId,
    }
    const base = { ...f.job, state: 'PUBLISHED', attempts: [], providerReceipt: receipt,
      providerReceipts: [receipt], publicUrl: url, publishedAt: '2026-10-01T12:00:00Z' }
    f.save({ ...base, publicUrl: 'https://www.tiktok.com/@hippiescientist/video/7691823286157708558' })
    expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/public URL/)
    f.save({ ...base, publishedAt: '2026-10-01T13:00:00Z' })
    expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/manual publication receipt/)
    f.save({ ...base, providerReceipt: { ...receipt, publicationId: 'wrong' },
      providerReceipts: [{ ...receipt, publicationId: 'wrong' }] })
    expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/publicationId mismatch/)
  })
  it('accepts a reconciled provider receipt whose external ID is a canonical public URL', () => {
    const dir = root(); const f = fixture(dir)
    const url = 'https://www.tiktok.com/@hippiescientist/video/7691823286157708557'
    const receipt = {
      provider: 'tiktok', providerOperationId: 'remote-operation', externalId: url, publicUrl: url,
      verifiedPublishedAt: '2026-10-01T12:00:00Z', publicationId: f.job.publicationId,
    }
    f.save({ ...f.job, providerReceipt: receipt, providerReceipts: [receipt],
      publicUrl: url, publishedAt: '2026-10-01T12:00:00Z' })
    expect(linkPublishedFlywheelVideo(dir, f.args).platformPostId).toBe('7691823286157708557')
  })
  it('rejects every draft/ambiguous/non-published Publisher state', () => {
    for (const state of ['QUEUED', 'DISPATCHING', 'PROVIDER_ACCEPTED',
      'AWAITING_USER_POST', 'FAILED', 'NEEDS_RECONCILIATION', 'CANCELLED']) {
      const dir = root(); const f = fixture(dir)
      f.save({ ...f.job, state })
      expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/PUBLISHED/)
    }
  })
  it('rejects tampered Publisher identity, missing provider receipt or invalid verification history', () => {
    const dir = root(); const f = fixture(dir)
    f.save({ ...f.job, publicationId: 'pub_' + '0'.repeat(24) })
    expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/identity mismatch/)
    f.save({ ...f.job, providerReceipt: null })
    expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/verified external/)
    f.save({ ...f.job, providerReceipts: [] })
    expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/verification history/)
    f.save({ ...f.job, attempts: [] })
    expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/attempt history/)
  })
  it('rejects an unrelated or tampered media file, source manifest and publication URL/ID', () => {
    const dir = root(); const f = fixture(dir)
    fs.writeFileSync(f.master, Buffer.from('not the original encoded master'))
    expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/master hash mismatch/)
    fs.writeFileSync(f.master, Buffer.from('synthetic mp4 hash-bound fixture; never a real video'))
    fs.writeFileSync(f.manifest, Buffer.from('changed source'))
    expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/manifest hash mismatch/)
    fs.writeFileSync(f.manifest, Buffer.from('{"schemaVersion":"fixture-only"}\n'))
    const changed = structuredClone(f.job)
    changed.providerReceipt.externalId = '7691823286157708558'
    changed.providerReceipts[changed.providerReceipts.length - 1].externalId = '7691823286157708558'
    f.save(changed)
    expect(() => linkPublishedFlywheelVideo(dir, f.args)).toThrow(/external video ID/)
  })
  it('rejects two Flywheel videos adopting one canonical publication and immutable link revisions', () => {
    const dir = root(); const first = fixture(dir, 'ao-video-one')
    linkPublishedFlywheelVideo(dir, first.args)
    const second = fixture(dir, 'ao-video-two')
    expect(() => linkPublishedFlywheelVideo(dir, second.args)).toThrow(/duplicate/)
    const tamper = structuredClone(first.job)
    tamper.governance = { replaced: true }
    first.save(tamper)
    expect(() => linkPublishedFlywheelVideo(dir, first.args)).toThrow(/immutable/)
  })
  it('accepts only matched owner-entered observations and preserves null metrics', () => {
    const dir = root(); const f = fixture(dir)
    const link = linkPublishedFlywheelVideo(dir, f.args)
    const input = {
      publicationId: link.publicationId, platform: 'tiktok',
      platformPostId: link.platformPostId, observation: observation(f.videoId),
    }
    expect(() => appendLinkedFlywheelObservation(dir, { ...input, platformPostId: 'wrong' }))
      .toThrow(/identity mismatch/)
    expect(() => appendLinkedFlywheelObservation(dir, {
      ...input, observation: { ...input.observation, source: 'verified-provider-export' },
    })).toThrow(/manual-owner-entry/)
    const result = appendLinkedFlywheelObservation(dir, input)
    expect(result.existing).toBe(false)
    expect(appendLinkedFlywheelObservation(dir, input).idempotent).toBe(true)
    const record = getFlywheelVideo(dir, f.videoId)
    expect(record.observations).toHaveLength(1)
    expect(record.observations[0].metrics.watchThroughPercent).toBeNull()
    expect(record.observations[0].metrics.views).toBe(150)
    expect(() => appendLinkedFlywheelObservation(dir, {
      ...input, observation: { ...input.observation, metrics: { ...input.observation.metrics, views: 999 } },
    })).toThrow(/immutable observation/)
  })
  it('refuses wrong public domains and IDs, while parsing TikTok and YouTube natively', () => {
    expect(videoIdFromPublicUrl('tiktok', 'https://www.tiktok.com/@hippiescientist/video/7691823286157708557'))
      .toBe('7691823286157708557')
    expect(videoIdFromPublicUrl('youtube', 'https://www.youtube.com/shorts/AbCdEfG1234'))
      .toBe('AbCdEfG1234')
    expect(videoIdFromPublicUrl('youtube', 'https://youtu.be/AbCdEfG1234'))
      .toBe('AbCdEfG1234')
    expect(() => videoIdFromPublicUrl('tiktok',
      'https://phishing.example/@hippiescientist/video/7691823286157708557')).toThrow(/host/)
    expect(() => videoIdFromPublicUrl('youtube', 'http://youtube.com/shorts/AbCdEfG1234')).toThrow(/HTTPS/)
    expect(() => videoIdFromPublicUrl('youtube', 'https://www.youtube.com/shorts/not-valid'))
      .toThrow(/video ID/)
  })
})
