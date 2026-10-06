#!/usr/bin/env node
import fs from 'node:fs'

const apiToken = String(process.env.CLOUDFLARE_API_TOKEN || '').trim()
const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim()
const project = String(process.env.CLOUDFLARE_PAGES_PROJECT || '').trim()

if (!apiToken || !accountId || !project) {
  throw new Error('Missing existing Cloudflare deploy credentials')
}

const api = 'https://api.cloudflare.com/client/v4'
const base = `${api}/accounts/${accountId}`
const headers = {
  Authorization: `Bearer ${apiToken}`,
  'Content-Type': 'application/json',
}

async function cf(url, init = {}) {
  const response = await fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) } })
  const payload = await response.json()
  if (!response.ok || payload?.success !== true) {
    throw new Error(`Cloudflare API failed ${response.status}: ${JSON.stringify(payload?.errors || payload)}`)
  }
  return payload
}

async function ensureD1(name) {
  const listed = await cf(`${base}/d1/database?name=${encodeURIComponent(name)}&per_page=100`)
  const existing = listed.result?.find((db) => db.name === name)
  if (existing?.uuid) return { id: existing.uuid, created: false }
  const created = await cf(`${base}/d1/database`, {
    method: 'POST',
    body: JSON.stringify({ name, primary_location_hint: 'enam' }),
  })
  return { id: created.result.uuid, created: true }
}

async function ensureKv(title) {
  const listed = await cf(`${base}/storage/kv/namespaces?per_page=1000`)
  const existing = listed.result?.find((ns) => ns.title === title)
  if (existing?.id) return { id: existing.id, created: false }
  const created = await cf(`${base}/storage/kv/namespaces`, {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
  return { id: created.result.id, created: true }
}

const d1 = await ensureD1('ths-publisher-prod')
const kv = await ensureKv('ths-tiktok-token-kv-prod')

const sql = fs.readFileSync('migrations/0001_ths_publisher.sql', 'utf8')
await cf(`${base}/d1/database/${d1.id}/query`, {
  method: 'POST',
  body: JSON.stringify({ sql }),
})
const verify = await cf(`${base}/d1/database/${d1.id}/query`, {
  method: 'POST',
  body: JSON.stringify({
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='ths_publications'",
  }),
})
const tableFound = (verify.result || []).some((batch) =>
  Array.isArray(batch?.results) && batch.results.some((row) => row?.name === 'ths_publications'))
if (!tableFound) throw new Error('THS Publisher D1 schema verification failed')

const projectUrl = `${base}/pages/projects/${encodeURIComponent(project)}`
const before = await cf(projectUrl)
const production = before.result?.deployment_configs?.production || {}
const d1Bindings = {
  ...(production.d1_databases || {}),
  THS_PUBLISHER_DB: { id: d1.id },
}
const kvBindings = {
  ...(production.kv_namespaces || {}),
  TIKTOK_TOKEN_KV: { namespace_id: kv.id },
}
const patched = await cf(projectUrl, {
  method: 'PATCH',
  body: JSON.stringify({
    deployment_configs: {
      production: {
        d1_databases: d1Bindings,
        kv_namespaces: kvBindings,
      },
    },
  }),
})
if (patched.result?.deployment_configs?.production?.d1_databases?.THS_PUBLISHER_DB?.id !== d1.id) {
  throw new Error('THS_PUBLISHER_DB binding verification failed')
}
if (patched.result?.deployment_configs?.production?.kv_namespaces?.TIKTOK_TOKEN_KV?.namespace_id !== kv.id) {
  throw new Error('TIKTOK_TOKEN_KV binding verification failed')
}

const deployments = await cf(`${projectUrl}/deployments?env=production&per_page=20`)
const newest = [...(deployments.result || [])]
  .sort((a, b) => Date.parse(b.created_on || 0) - Date.parse(a.created_on || 0))[0]
if (!newest?.id) throw new Error('No production deployment exists to retry')

const retried = await cf(`${projectUrl}/deployments/${newest.id}/retry`, {
  method: 'POST',
  body: JSON.stringify({}),
})

console.log(JSON.stringify({
  d1Ready: true,
  d1Created: d1.created,
  kvReady: true,
  kvCreated: kv.created,
  d1SchemaReady: true,
  pagesBindingsReady: true,
  retryAccepted: Boolean(retried.result?.id),
}, null, 2))
