#!/usr/bin/env node
/**
 * Report Cloudflare cache status for the previous 24 hours using the current
 * httpRequestsAdaptiveGroups GraphQL dataset. Requires CF_ZONE_ID and
 * CF_API_TOKEN. Missing credentials are a non-fatal skip so local builds stay
 * deterministic; scheduled CI can provide read-only analytics credentials.
 */
import fs from 'node:fs'
import path from 'node:path'

const zoneTag = process.env.CF_ZONE_ID?.trim()
const token = process.env.CF_API_TOKEN?.trim()
const hostname = process.env.CF_ANALYTICS_HOSTNAME?.trim() || 'thehippiescientist.net'
const reportPath = path.resolve('reports/cloudflare-cache-report.json')

if (!zoneTag || !token) {
  console.log('[cloudflare-cache] SKIP: CF_ZONE_ID / CF_API_TOKEN not configured')
  process.exit(0)
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

if (!response.ok) {
  throw new Error(`[cloudflare-cache] HTTP ${response.status}: ${await response.text()}`)
}

const payload = await response.json()
if (payload.errors?.length) {
  throw new Error(`[cloudflare-cache] GraphQL error: ${JSON.stringify(payload.errors)}`)
}

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
  window: { start: start.toISOString(), end: end.toISOString() },
  hostname,
  totalRequests: total,
  cacheServedRequests: cacheServed,
  cacheHitRate: total > 0 ? cacheServed / total : null,
  byStatus,
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

const pct = report.cacheHitRate == null ? 'n/a' : `${(report.cacheHitRate * 100).toFixed(1)}%`
console.log(`[cloudflare-cache] ${hostname}: ${pct} cache-served across ${total} requests (last 24h)`)
console.log('[cloudflare-cache] report: reports/cloudflare-cache-report.json')
