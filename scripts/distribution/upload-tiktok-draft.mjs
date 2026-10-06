#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createPublicationJobFromGovernedMedia } from './social-publisher-core.mjs'
import { dispatchTikTokPublication } from './tiktok-publisher-adapter.mjs'

const clean = (value) => String(value ?? '').trim()
const DEFAULT_MANIFEST_URL = 'https://thehippiescientist.net/media/distribution/publisher/latest.json'
const DEFAULT_BRIDGE_BASE = 'https://thehippiescientist.net'
const CANONICAL_HOST = 'thehippiescientist.net'

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('failed to fetch governed publication manifest (' + response.status + ')')
  return response.json()
}

function bridgeUrl(pathname, baseValue) {
  const base = new URL(baseValue || DEFAULT_BRIDGE_BASE)
  const local = ['localhost', '127.0.0.1'].includes(base.hostname)
  if (local) {
    if (!['http:', 'https:'].includes(base.protocol)) throw new Error('local THS Publisher bridge must use HTTP(S)')
  } else if (base.protocol !== 'https:' || base.hostname !== CANONICAL_HOST || base.port) {
    throw new Error('THS Publisher bridge must use the canonical HTTPS host')
  }
  if (base.username || base.password) throw new Error('THS Publisher bridge URL cannot contain credentials')
  return new URL(pathname, base).toString()
}

async function publisherRequest(pathname, {
  adminToken,
  bridgeBase,
  body,
  fetchImpl,
} = {}) {
  const token = clean(adminToken)
  if (!token) throw new Error('missing THS_PUBLISHER_ADMIN_TOKEN')
  const response = await fetchImpl(bridgeUrl(pathname, bridgeBase), {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const raw = await response.text()
  let payload
  try { payload = raw ? JSON.parse(raw) : {} } catch { throw new Error('THS Publisher bridge returned invalid JSON') }
  if (!response.ok || payload?.ok !== true) {
    throw new Error('THS Publisher bridge failed (' + response.status + '): ' + clean(payload?.error || 'unknown_error'))
  }
  return payload
}

export async function uploadTikTokDraftFromArtifacts({
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  manifestUrl = process.env.THS_PUBLICATION_MANIFEST_URL || process.env.TIKTOK_PUBLICATION_MANIFEST_URL || DEFAULT_MANIFEST_URL,
  experimentId = process.env.THS_EXPERIMENT_ID,
  intendedTime = process.env.THS_PUBLICATION_AT,
  publisherAdminToken = process.env.THS_PUBLISHER_ADMIN_TOKEN,
  publisherBridgeBase = process.env.THS_PUBLISHER_BRIDGE_BASE || DEFAULT_BRIDGE_BASE,
  tiktokAdminToken = process.env.TIKTOK_PUBLISHER_ADMIN_TOKEN,
  tiktokBridgeBase = process.env.TIKTOK_PUBLISHER_BRIDGE_BASE || DEFAULT_BRIDGE_BASE,
  fetchImpl = globalThis.fetch,
  now = new Date().toISOString(),
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('TikTok draft upload requires fetch')
  if (!clean(experimentId)) throw new Error('missing THS_EXPERIMENT_ID')
  if (!clean(intendedTime)) throw new Error('missing THS_PUBLICATION_AT')

  const liveManifest = await fetchJson(manifestUrl, fetchImpl)
  if (liveManifest?.schemaVersion !== 'ths-publication-media-v1' || liveManifest?.status !== 'ready-for-provider') {
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

  const selectionWithExperiment = {
    ...selection,
    selected: {
      ...selection.selected,
      experimentId: clean(experimentId),
    },
  }
  const proposedJob = createPublicationJobFromGovernedMedia({
    manifest: liveManifest,
    selection: selectionWithExperiment,
    platform: 'tiktok',
    intendedTime,
    now,
  })

  const enqueue = await publisherRequest('/api/publisher/enqueue', {
    adminToken: publisherAdminToken,
    bridgeBase: publisherBridgeBase,
    body: { job: proposedJob },
    fetchImpl,
  })
  const storedJob = enqueue.job
  if (!storedJob || storedJob.publicationId !== proposedJob.publicationId) {
    throw new Error('THS Publisher queue returned the wrong canonical publication')
  }

  const lifecycle = storedJob?.governance?.lifecycleSnapshot || pilot.lifecycle
  const currentIdentity = lifecycle?.identity || pilot.lifecycle.identity
  const dispatched = await dispatchTikTokPublication({
    job: storedJob,
    lifecycle,
    currentIdentity,
    adminToken: tiktokAdminToken,
    bridgeBase: tiktokBridgeBase,
    fetchImpl,
  })

  let persistedJob = dispatched.job
  if (dispatched.status !== 'already-dispatched') {
    const update = await publisherRequest('/api/publisher/update', {
      adminToken: publisherAdminToken,
      bridgeBase: publisherBridgeBase,
      body: {
        job: dispatched.job,
        expectedUpdatedAt: storedJob.updatedAt,
      },
      fetchImpl,
    })
    persistedJob = update.job
  }

  const receipt = {
    schemaVersion: 'ths-tiktok-publisher-receipt-v1',
    publicationId: persistedJob.publicationId,
    experimentId: persistedJob.identity.experimentId,
    artifactSha256: persistedJob.identity.artifactSha256,
    platform: persistedJob.identity.platform,
    intendedTime: persistedJob.identity.intendedTime,
    state: persistedJob.state,
    attempts: persistedJob.attempts.length,
    providerReceipt: persistedJob.providerReceipt || null,
    dispatchStatus: dispatched.status,
    dispatchedAt: new Date().toISOString(),
    researchObjectId: objectId,
    lifecycleId: dispatched.lifecycle?.lifecycleId || pilot.lifecycle.lifecycleId,
    identityFingerprint: dispatched.lifecycle?.identity?.fingerprint || pilot.lifecycle.identity.fingerprint,
    mediaManifestUrl: manifestUrl,
    videoUrl: liveManifest.media[0].url,
    lifecycle: dispatched.lifecycle,
    publicationState: persistedJob.state === 'PUBLISHED' ? 'verified-publication' : 'not-publication-proof',
    nextAction: persistedJob.state === 'PROVIDER_ACCEPTED'
      ? 'Wait for TikTok processing; Observer must verify inbox delivery/publication before learning.'
      : persistedJob.state === 'AWAITING_USER_POST'
        ? 'Open the TikTok inbox notification, review/edit the draft, and explicitly post it in TikTok.'
        : persistedJob.state === 'NEEDS_RECONCILIATION'
          ? 'Do not retry. Reconcile the ambiguous provider dispatch before any new attempt.'
          : persistedJob.state === 'FAILED'
            ? 'Review the explicit failure before a governed retry.'
            : 'No duplicate dispatch is permitted for this canonical publication_id.',
  }

  const receiptDir = path.join(distributionDir, 'publisher')
  fs.mkdirSync(receiptDir, { recursive: true })
  fs.writeFileSync(
    path.join(receiptDir, persistedJob.publicationId + '.json'),
    JSON.stringify(receipt, null, 2) + '\n',
  )

  if (dispatched.status === 'failed' || dispatched.status === 'needs-reconciliation') {
    const error = new Error(dispatched.error || 'TikTok dispatch did not complete')
    error.publicationReceipt = receipt
    throw error
  }

  return receipt
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const receipt = await uploadTikTokDraftFromArtifacts()
  console.log('[distribution] THS Publisher TikTok dispatch ' + receipt.publicationId + ' -> ' + receipt.state)
}
