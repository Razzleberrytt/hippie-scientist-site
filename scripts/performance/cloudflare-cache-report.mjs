#!/usr/bin/env node
/**
 * Report Cloudflare cache status for the previous 24 hours using
 * httpRequestsAdaptiveGroups. A read-only analytics token is preferred. The
 * existing deployment token may also be used when it has Zone/Analytics Read.
 * Missing or insufficient credentials are a non-fatal monitoring skip.
 */
import fs from 'node:fs'
import path from 'node:path'

let zoneTag = (process.env.CF_ZONE_ID || process.env.CLOUDFLARE_ZONE_ID || '').trim()
const token = (process.env.CF_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN || '').trim()
const hostname = process.env.CF_ANALYTICS_HOSTNAME?.trim() || 'thehippiescientist.net'
const reportPath = path.resolve('reports/cloudflare-cache-report.json')

function writeReport(report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
}

function skip(reason) {
  const report = { generatedAt: new Date().toISOString(), hostname, status: 'skipped', reason }
  writeReport(report)
  console.log(`[cloudflare-cache] SKIP: ${reason}`)
  process.exit(0)
}

if (!token) skip('no Cloudflare API token configured')

if (!zoneTag) {
  const zoneResponse = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(hostname)}&status=active`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!zoneResponse.ok) skip(`cannot resolve zone id (HTTP ${zoneResponse.status})`)
  const zonePayload = await zoneResponse.json()
  zoneTag = zonePayload?.result?.[0]?.id || ''
  if (!zoneTag) skip('active zone could not be resolved for hostname')
}

const end = new Date()
const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)

const query = `
query CacheStatus($zoneTag: string, $start: Time, $end: Time, $hostname: string) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(
        limit: 100
        filter: {
          datetime_geq: $start
          datetime_lt: $end
          requestSource: "eyeball"
          clientRequestHTTPHost: $hostname
        }
      ) {
        count
        dimensions { cacheStatus }
      }
    }
  }
}`

const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables: {
      zoneTag,
      start: start.toISOString(),
      end: end.toISOString(),
      hostname,
    },
  }),
})

if (!response.ok) skip(`analytics request failed (HTTP ${response.status})`)

const payload = await response.json()
if (payload.errors?.length) skip(`analytics permission/query unavailable: ${payload.errors[0]?.message || 'unknown GraphQL error'}`)

const groups = payload?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || []
const byStatus = {}
let total = 0
let cacheServed = 0
const hitLike = new Set(['hit', 'stale', 'revalidated', 'updatedfresh'])

for (const group of groups) {
  const status = String(group?.dimensions?.cacheStatus || 'unknown').toLowerCase()
  const count = Number(group?.count || 0)
  byStatus[status] = (byStatus[status] || 0) + count
  total += count
  if (hitLike.has(status)) cacheServed += count
}

const report = {
  generatedAt: end.toISOString(),
  status: 'ok',
  window: { start: start.toISOString(), end: end.toISOString() },
  hostname,
  totalRequests: total,
  cacheServedRequests: cacheServed,
  cacheHitRate: total > 0 ? cacheServed / total : null,
  byStatus,
}

writeReport(report)
const pct = report.cacheHitRate == null ? 'n/a' : `${(report.cacheHitRate * 100).toFixed(1)}%`
console.log(`[cloudflare-cache] ${hostname}: ${pct} cache-served across ${total} requests (last 24h)`)
console.log('[cloudflare-cache] report: reports/cloudflare-cache-report.json')
