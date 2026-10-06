#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { uploadGovernedTikTokDraft } from './tiktok-upload-provider.mjs'

const clean = (value) => String(value ?? '').trim()
const DEFAULT_MANIFEST_URL = 'https://thehippiescientist.net/media/distribution/metricool/latest.json'

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('failed to fetch governed publication manifest (' + response.status + ')')
  return response.json()
}

export async function uploadTikTokDraftFromArtifacts({
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  manifestUrl = process.env.TIKTOK_PUBLICATION_MANIFEST_URL || process.env.METRICOOL_PUBLICATION_MANIFEST_URL || DEFAULT_MANIFEST_URL,
  adminToken = process.env.TIKTOK_PUBLISHER_ADMIN_TOKEN,
  bridgeBase = process.env.TIKTOK_PUBLISHER_BRIDGE_BASE || 'https://thehippiescientist.net',
  fetchImpl = globalThis.fetch,
  now = new Date().toISOString(),
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('TikTok draft upload requires fetch')

  const liveManifest = await fetchJson(manifestUrl, fetchImpl)
  if (liveManifest?.schemaVersion !== 'metricool-publication-media-v1' || liveManifest?.status !== 'ready-for-provider') {
    throw new Error('live publication media manifest is invalid or not provider-ready')
  }
  if (clean(liveManifest.mediaType).toLowerCase() !== 'video' || clean(liveManifest.format).toLowerCase() !== 'vertical-video') {
    throw new Error('TikTok draft upload requires the governed vertical-video publication manifest')
  }
  const allowedNetworks = new Set(
    Array.isArray(liveManifest.allowedNetworks)
      ? liveManifest.allowedNetworks.map((item) => clean(item).toLowerCase())
      : [],
  )
  if (!allowedNetworks.has('tiktok')) throw new Error('live governed media is not authorized for TikTok')
  if (!Array.isArray(liveManifest.media) || liveManifest.media.length !== 1) {
    throw new Error('TikTok draft upload requires exactly one governed video asset')
  }

  const selection = readJson(path.join(distributionDir, 'opportunity-selection.json'))
  const objectId = clean(selection?.selected?.id)
  if (!objectId) throw new Error('TikTok draft upload requires a selected governed opportunity')
  const packageData = readJson(path.join(distributionDir, objectId + '.json'))
  const pilot = readJson(path.join(distributionDir, 'pilots', objectId, 'bounded-pilot.json'))

  if (liveManifest.researchObjectId !== objectId || liveManifest.lifecycleId !== pilot?.lifecycle?.lifecycleId) {
    throw new Error('live TikTok media does not match the current bounded pilot')
  }
  if (pilot?.lifecycle?.identity?.fingerprint !== liveManifest.identityFingerprint) {
    throw new Error('live TikTok media identity is stale relative to the current governed pilot')
  }
  if (packageData?.mediaPack?.status !== 'validated' || packageData.mediaPack.packId !== liveManifest.packId) {
    throw new Error('TikTok draft upload requires the validated distribution package matching the live media manifest')
  }

  const result = await uploadGovernedTikTokDraft({
    lifecycle: pilot.lifecycle,
    currentIdentity: pilot.lifecycle.identity,
    videoUrl: liveManifest.media[0].url,
    adminToken,
    bridgeBase,
    fetchImpl,
    now,
  })

  const receipt = {
    schemaVersion: 'tiktok-draft-upload-receipt-v1',
    provider: result.provider,
    mode: 'draft-upload',
    publishId: result.publishId,
    requestId: result.requestId,
    uploadedAt: now,
    researchObjectId: objectId,
    lifecycleId: result.lifecycle.lifecycleId,
    identityFingerprint: result.lifecycle.identity.fingerprint,
    idempotencyKey: result.lifecycle.identity.idempotencyKey,
    mediaManifestUrl: manifestUrl,
    videoUrl: result.videoUrl,
    lifecycle: result.lifecycle,
    publicationState: 'not-publication-proof',
    nextAction: 'Open the TikTok inbox notification, review/edit the draft, and explicitly post it in TikTok.',
  }

  const receiptDir = path.join(distributionDir, 'tiktok')
  fs.mkdirSync(receiptDir, { recursive: true })
  fs.writeFileSync(
    path.join(receiptDir, result.lifecycle.identity.idempotencyKey + '.draft-upload.json'),
    JSON.stringify(receipt, null, 2) + '\n',
  )
  return receipt
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const receipt = await uploadTikTokDraftFromArtifacts()
  console.log('[distribution] TikTok draft delivered for ' + receipt.researchObjectId + ' (' + receipt.publishId + ')')
}
