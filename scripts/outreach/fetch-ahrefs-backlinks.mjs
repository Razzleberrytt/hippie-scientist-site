#!/usr/bin/env node
/**
 * Fetch a domain-deduplicated backlink snapshot from Ahrefs Site Explorer v3,
 * compare it with the previous snapshot, and report new referring domains.
 *
 * This is monitoring only: it never contacts sites, edits disavow files, or
 * treats estimated source traffic as first-party referral traffic.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const token = (process.env.AHREFS_API_KEY || process.env.AHREFS_API_TOKEN || '').trim()
const target = (process.env.AHREFS_TARGET || 'thehippiescientist.net').trim()
const statePath = path.resolve(process.env.AHREFS_BACKLINK_STATE || 'ops/outreach/backlink-state.json')
const reportPath = path.resolve(process.env.AHREFS_BACKLINK_REPORT || 'reports/new-backlinks.json')
const maxRows = Math.min(1000, Math.max(1, Number(process.env.AHREFS_BACKLINK_LIMIT || 1000)))

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function host(value) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, '') } catch { return '' }
}

function isOriginalAsset(url) {
  return /\/(?:evidence\/evidence-report|evidence\/evidence-checker|safety-checker|botanical-activity-atlas|info\/infographics|info\/research-resources-for-writers)(?:\/|$)/i.test(String(url || ''))
}

function skipped(reason) {
  const report = { generatedAt: new Date().toISOString(), status: 'skipped', target, reason, newReferringDomains: [] }
  writeJson(reportPath, report)
  console.log(`[ahrefs-backlinks] SKIP: ${reason}`)
  process.exit(0)
}

if (!token) skipped('AHREFS_API_KEY / AHREFS_API_TOKEN is not configured')

const params = new URLSearchParams({
  target,
  mode: 'domain',
  protocol: 'both',
  aggregation: '1_per_domain',
  history: 'live',
  limit: String(maxRows),
  select: [
    'url_from',
    'url_to',
    'title',
    'anchor',
    'domain_rating_source',
    'url_rating_source',
    'traffic',
    'traffic_domain',
    'first_seen',
    'last_visited',
    'is_spam',
  ].join(','),
})

const endpoint = `https://api.ahrefs.com/v3/site-explorer/all-backlinks?${params}`
const response = await fetch(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
})

if (!response.ok) {
  const body = await response.text()
  skipped(`Ahrefs request failed (HTTP ${response.status}): ${body.slice(0, 240)}`)
}

const payload = await response.json()
const backlinks = Array.isArray(payload?.backlinks) ? payload.backlinks : []
const current = new Map()

for (const link of backlinks) {
  const domain = host(link.url_from)
  if (!domain || domain === target || domain.endsWith(`.${target}`)) continue
  const candidate = {
    domain,
    urlFrom: link.url_from || '',
    urlTo: link.url_to || '',
    title: link.title || '',
    anchor: link.anchor || '',
    domainRating: Number(link.domain_rating_source || 0),
    urlRating: Number(link.url_rating_source || 0),
    estimatedSourceOrganicTraffic: Number(link.traffic || 0),
    estimatedDomainOrganicTraffic: Number(link.traffic_domain || 0),
    firstSeen: link.first_seen || null,
    lastVisited: link.last_visited || null,
    ahrefsSpamFlag: Boolean(link.is_spam),
    linksToOriginalAsset: isOriginalAsset(link.url_to),
  }
  const existing = current.get(domain)
  if (!existing || candidate.domainRating > existing.domainRating) current.set(domain, candidate)
}

let previous = { domains: {} }
try { previous = JSON.parse(fs.readFileSync(statePath, 'utf8')) } catch {}
const previousDomains = new Set(Object.keys(previous?.domains || {}))
const newReferringDomains = [...current.values()]
  .filter((row) => !previousDomains.has(row.domain))
  .sort((a, b) => b.domainRating - a.domainRating || b.estimatedSourceOrganicTraffic - a.estimatedSourceOrganicTraffic)

const lostReferringDomains = [...previousDomains]
  .filter((domain) => !current.has(domain))
  .sort()

const report = {
  generatedAt: new Date().toISOString(),
  status: 'ok',
  target,
  source: 'Ahrefs Site Explorer v3 all-backlinks',
  snapshot: {
    backlinkRows: backlinks.length,
    referringDomains: current.size,
    originalAssetReferringDomains: [...current.values()].filter((row) => row.linksToOriginalAsset).length,
    ahrefsSpamFlaggedDomains: [...current.values()].filter((row) => row.ahrefsSpamFlag).length,
  },
  newReferringDomains,
  lostReferringDomains,
  note: 'traffic fields are Ahrefs organic-traffic estimates, not first-party referral visits; spam flags are review signals only.',
}
writeJson(reportPath, report)

const nextState = {
  updatedAt: report.generatedAt,
  target,
  domains: Object.fromEntries([...current].sort(([a], [b]) => a.localeCompare(b))),
}
writeJson(statePath, nextState)

console.log(`[ahrefs-backlinks] live referring domains: ${current.size}`)
console.log(`[ahrefs-backlinks] new: ${newReferringDomains.length}; lost since prior snapshot: ${lostReferringDomains.length}`)
console.log(`[ahrefs-backlinks] original-asset domains: ${report.snapshot.originalAssetReferringDomains}`)
console.log(`[ahrefs-backlinks] report: ${path.relative(root, reportPath)}`)
