#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { observeTikTokPublication } from './tiktok-publisher-adapter.mjs'

const clean = (value) => String(value ?? '').trim()
const DEFAULT_BRIDGE_BASE = 'https://thehippiescientist.net'
const CANONICAL_HOST = 'thehippiescientist.net'

function bridgeUrl(pathname, baseValue) {
  const base = new URL(baseValue || DEFAULT_BRIDGE_BASE)
  const local = ['localhost', '127.0.0.1'].includes(base.hostname)
  if (local) {
    if (!['http:', 'https:'].includes(base.protocol)) throw new Error('local THS Publisher bridge must use HTTP(S)')
  } else if (base.protocol !== 'https:' || base.hostname !== CANONICAL_HOST || base.port) {
    throw new Error('THS Publisher bridge must use the canonical HTTPS host')
  }
  if (base.username || base.password) throw new Error('THS Publisher bridge URL cannot contain credentials')
  return base
}

async function queueRequest(pathname, {
  adminToken,
  bridgeBase,
  method = 'GET',
  query = null,
  body = null,
  fetchImpl = globalThis.fetch,
} = {}) {
  const token = clean(adminToken)
  if (!token) throw new Error('missing THS_PUBLISHER_ADMIN_TOKEN')
  const base = bridgeUrl(pathname, bridgeBase)
  const url = new URL(pathname, base)
  if (query) {
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value))
  }
  const headers = { Authorization: 'Bearer ' + token }
  if (body !== null) headers['Content-Type'] = 'application/json'
  const response = await fetchImpl(url.toString(), {
    method,
    headers,
    body: body === null ? undefined : JSON.stringify(body),
  })
  const raw = await response.text()
  let payload
  try { payload = raw ? JSON.parse(raw) : {} } catch { throw new Error('THS Publisher bridge returned invalid JSON') }
  if (!response.ok || payload?.ok !== true) {
    throw new Error('THS Publisher bridge failed (' + response.status + '): ' + clean(payload?.error || 'unknown_error'))
  }
  return payload
}

export async function observeTikTokPublicationFromQueue({
  publicationId = process.env.THS_PUBLICATION_ID,
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  publisherAdminToken = process.env.THS_PUBLISHER_ADMIN_TOKEN,
  publisherBridgeBase = process.env.THS_PUBLISHER_BRIDGE_BASE || DEFAULT_BRIDGE_BASE,
  tiktokAdminToken = process.env.TIKTOK_PUBLISHER_ADMIN_TOKEN,
  tiktokBridgeBase = process.env.TIKTOK_PUBLISHER_BRIDGE_BASE || DEFAULT_BRIDGE_BASE,
  fetchImpl = globalThis.fetch,
} = {}) {
  const id = clean(publicationId)
  if (!/^pub_[0-9a-f]{24}$/.test(id)) throw new Error('missing or invalid THS_PUBLICATION_ID')

  const current = await queueRequest('/api/publisher/job', {
    adminToken: publisherAdminToken,
    bridgeBase: publisherBridgeBase,
    query: { publication_id: id },
    fetchImpl,
  })
  const storedJob = current.job
  if (!storedJob || storedJob.publicationId !== id) throw new Error('THS Publisher returned the wrong publication job')

  if (storedJob.state === 'PUBLISHED') {
    return {
      publicationId: id,
      status: 'published',
      state: 'PUBLISHED',
      job: storedJob,
      lifecycle: storedJob?.governance?.lifecycleSnapshot || null,
      observation: null,
    }
  }

  const lifecycle = storedJob?.governance?.lifecycleSnapshot
  if (!lifecycle?.identity) {
    throw new Error('THS Publisher job is missing its governed lifecycle snapshot; reconcile before observing')
  }

  const observed = await observeTikTokPublication({
    job: storedJob,
    lifecycle,
    currentIdentity: lifecycle.identity,
    adminToken: tiktokAdminToken,
    bridgeBase: tiktokBridgeBase,
    fetchImpl,
  })

  const update = await queueRequest('/api/publisher/update', {
    adminToken: publisherAdminToken,
    bridgeBase: publisherBridgeBase,
    method: 'POST',
    body: {
      job: observed.job,
      expectedUpdatedAt: storedJob.updatedAt,
    },
    fetchImpl,
  })
  const persistedJob = update.job

  const receipt = {
    schemaVersion: 'ths-tiktok-observer-receipt-v1',
    publicationId: id,
    experimentId: persistedJob.identity.experimentId,
    state: persistedJob.state,
    observerStatus: observed.status,
    observedAt: new Date().toISOString(),
    observation: observed.observation || null,
    providerReceipt: persistedJob.providerReceipt || null,
    lifecycle: observed.lifecycle || persistedJob?.governance?.lifecycleSnapshot || null,
  }

  const receiptDir = path.join(distributionDir, 'publisher')
  fs.mkdirSync(receiptDir, { recursive: true })
  fs.writeFileSync(path.join(receiptDir, id + '.observer.json'), JSON.stringify(receipt, null, 2) + '\n')

  return receipt
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const receipt = await observeTikTokPublicationFromQueue()
  console.log('[distribution] THS Observer ' + receipt.publicationId + ' -> ' + receipt.state + ' (' + receipt.observerStatus + ')')
}
