#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildMetricoolSchedulerRequest, scheduleMetricoolPublication } from './metricool-provider.mjs'

const clean = (value) => String(value ?? '').trim()
const DEFAULT_MANIFEST_URL = 'https://thehippiescientist.net/media/distribution/metricool/latest.json'
const DEFAULT_USER_ID = '5228072'
const DEFAULT_BLOG_ID = '6794242'
const DEFAULT_AVAILABLE_NETWORKS = ['facebook', 'tiktok', 'youtube']

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`failed to fetch Metricool publication manifest (${response.status})`)
  return response.json()
}

async function assertMediaReachable(media, fetchImpl) {
  for (const item of media) {
    const response = await fetchImpl(item.url, { method: 'HEAD' })
    if (!response.ok) throw new Error(`Metricool media URL is not reachable (${response.status}): ${item.url}`)
    const contentType = clean(response.headers?.get?.('content-type')).toLowerCase()
    if (contentType && !contentType.startsWith('image/')) {
      throw new Error(`Metricool carousel media URL returned non-image content: ${item.url}`)
    }
  }
}

export async function scheduleMetricoolPublicationFromArtifacts({
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  manifestUrl = process.env.METRICOOL_PUBLICATION_MANIFEST_URL || DEFAULT_MANIFEST_URL,
  publicationAt = process.env.METRICOOL_PUBLICATION_AT,
  networks = process.env.METRICOOL_NETWORKS,
  autoPublish = process.env.METRICOOL_AUTO_PUBLISH !== 'false',
  userToken = process.env.METRICOOL_USER_TOKEN,
  userId = process.env.METRICOOL_USER_ID || DEFAULT_USER_ID,
  blogId = process.env.METRICOOL_BLOG_ID || DEFAULT_BLOG_ID,
  fetchImpl = globalThis.fetch,
  now = new Date(),
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('Metricool publication scheduling requires fetch')
  if (!clean(publicationAt)) throw new Error('missing METRICOOL_PUBLICATION_AT')
  if (!clean(networks)) throw new Error('missing METRICOOL_NETWORKS')

  const liveManifest = await fetchJson(manifestUrl, fetchImpl)
  if (liveManifest?.schemaVersion !== 'metricool-publication-media-v1' || liveManifest?.status !== 'ready-for-provider') {
    throw new Error('live Metricool publication manifest is invalid or not provider-ready')
  }

  const selection = readJson(path.join(distributionDir, 'opportunity-selection.json'))
  const objectId = clean(selection?.selected?.id)
  if (!objectId) throw new Error('Metricool scheduling requires a selected governed opportunity')
  const pilotPath = path.join(distributionDir, 'pilots', objectId, 'bounded-pilot.json')
  const pilot = readJson(pilotPath)
  if (pilot?.lifecycle?.identity?.fingerprint !== liveManifest.identityFingerprint) {
    throw new Error('live Metricool media identity is stale relative to the current governed pilot')
  }
  if (liveManifest.researchObjectId !== objectId || liveManifest.lifecycleId !== pilot.lifecycle.lifecycleId) {
    throw new Error('live Metricool media does not match the current bounded pilot')
  }

  await assertMediaReachable(liveManifest.media, fetchImpl)
  const request = buildMetricoolSchedulerRequest({
    format: liveManifest.format,
    networks,
    text: liveManifest.text,
    mediaUrls: liveManifest.media.map((item) => item.url),
    publicationAt,
    timezone: 'America/New_York',
    title: liveManifest.title,
    autoPublish,
    now,
    availableNetworks: DEFAULT_AVAILABLE_NETWORKS,
  })

  const scheduledAt = now instanceof Date ? now.toISOString() : new Date(now).toISOString()
  const result = await scheduleMetricoolPublication({
    lifecycle: pilot.lifecycle,
    currentIdentity: pilot.lifecycle.identity,
    request,
    userToken,
    userId,
    blogId,
    fetchImpl,
    now: scheduledAt,
  })

  const receipt = {
    schemaVersion: 'metricool-schedule-receipt-v1',
    provider: 'metricool',
    externalId: result.externalId,
    requestId: result.requestId,
    scheduledAt,
    publicationAt,
    autoPublish: Boolean(autoPublish),
    networks: request.providers.map((provider) => provider.network),
    researchObjectId: objectId,
    lifecycleId: result.lifecycle.lifecycleId,
    identityFingerprint: result.lifecycle.identity.fingerprint,
    idempotencyKey: result.lifecycle.identity.idempotencyKey,
    mediaManifestUrl: manifestUrl,
    lifecycle: result.lifecycle,
  }
  const receiptDir = path.join(distributionDir, 'metricool')
  fs.mkdirSync(receiptDir, { recursive: true })
  fs.writeFileSync(path.join(receiptDir, `${result.lifecycle.identity.idempotencyKey}.scheduled.json`), `${JSON.stringify(receipt, null, 2)}\n`)
  return receipt
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const receipt = await scheduleMetricoolPublicationFromArtifacts()
  console.log(`[distribution] Metricool scheduled ${receipt.researchObjectId} -> ${receipt.networks.join(', ')} (${receipt.externalId})`)
}
