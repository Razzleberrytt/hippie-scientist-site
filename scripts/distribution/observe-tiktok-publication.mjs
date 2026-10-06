#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

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

export async function observeTikTokPublicationFromQueue({
  publicationId = process.env.THS_PUBLICATION_ID,
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  publisherAdminToken = process.env.THS_PUBLISHER_ADMIN_TOKEN,
  publisherBridgeBase = process.env.THS_PUBLISHER_BRIDGE_BASE || DEFAULT_BRIDGE_BASE,
  fetchImpl = globalThis.fetch,
} = {}) {
  const id = clean(publicationId)
  if (!/^pub_[0-9a-f]{24}$/.test(id)) throw new Error('missing or invalid THS_PUBLICATION_ID')
  if (typeof fetchImpl !== 'function') throw new Error('THS Observer requires fetch')

  const observed = await publisherRequest('/api/publisher/observe', {
    adminToken: publisherAdminToken,
    bridgeBase: publisherBridgeBase,
    body: { publicationId: id },
    fetchImpl,
  })
  const persistedJob = observed.job
  if (!persistedJob || persistedJob.publicationId !== id) {
    throw new Error('THS Observer returned the wrong canonical publication')
  }

  const receipt = {
    schemaVersion: 'ths-tiktok-observer-receipt-v1',
    publicationId: id,
    experimentId: persistedJob.identity.experimentId,
    state: persistedJob.state,
    observerStatus: clean(observed.status),
    observedAt: new Date().toISOString(),
    observation: observed.observation || null,
    providerReceipt: persistedJob.providerReceipt || null,
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
