#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { findCitationOwner, normalizeCitationPath } from './ai-citation-protected-identity.mjs'

const ROOT = process.cwd()
const REPORT = path.join(ROOT, 'ops/reports/ai-citations.json')
const DERIVED = path.join(ROOT, 'config/ai-citation-swarm-priorities.json')
const POLICY = path.join(ROOT, 'config/ai-citation-protection-policy.json')
const LEDGER = path.join(ROOT, 'config/ai-citation-protected-assets.json')
const json = (file) => JSON.parse(readFileSync(file, 'utf8'))
const fingerprint = (value) => value === null ? null : createHash('sha256').update(value).digest('hex')

function selectAssets(rows, total, policy) {
  if (!Number.isFinite(total) || total <= 0) throw new Error('Missing trustworthy page-level citation total')
  const assets = []
  let covered = 0
  const seen = new Set()
  for (const row of [...rows].sort((a, b) => Number(b.citations) - Number(a.citations))) {
    if (assets.length >= policy.maxAssets) break
    const url = normalizeCitationPath(row.url)
    if (seen.has(url)) continue
    seen.add(url)
    const citations = Number(row.citations)
    if (!Number.isFinite(citations) || citations < 0) throw new Error('Invalid citation count: ' + url)
    const share = 100 * citations / total
    const threshold = citations >= policy.minCitations || share >= policy.minCitationSharePct
    if (!threshold && 100 * covered / total >= policy.cumulativeCoveragePct) continue
    const { sourceFile, identity } = findCitationOwner(ROOT, url)
    if (!sourceFile || !identity || !identity.slug || !identity.canonical || (identity.kind !== 'redirect' && !identity.title)) {
      throw new Error('Unresolved citation owner/identity: ' + url)
    }
    assets.push({
      url, sourceFile, citations,
      citationSharePct: Number(share.toFixed(2)),
      protectionReason: threshold ? 'threshold' : 'cumulative-coverage',
      identity,
      fingerprints: Object.fromEntries(Object.entries(identity).map(([key, value]) => [key, fingerprint(value)])),
    })
    covered += citations
  }
  return assets
}

const policy = json(POLICY)
const report = existsSync(REPORT) ? json(REPORT) : null
const manifest = json(DERIVED)
const hasPageReport = report && Array.isArray(report.urls) && report.urls.length > 0
const rows = hasPageReport ? report.urls : manifest.defendUrls
const total = hasPageReport ? Number(report.totals?.citations) : Number(manifest.totals?.citations)
const snapshotLabel = hasPageReport ? report.snapshotLabel : manifest.snapshotLabel
const sourceReportGeneratedAt = hasPageReport ? (report.generatedAt ?? null) : null

if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotLabel ?? '')) {
  console.log('[ai-citation-assets] no valid dated page snapshot; ledger unchanged')
  process.exit(0)
}
const snapshotMs = Date.parse(snapshotLabel + 'T00:00:00Z')
const age = (Date.now() - snapshotMs) / 86400000
if (!Number.isFinite(age) || age < -1 || age > policy.staleAfterDays) {
  console.log('[ai-citation-assets] unavailable, future or stale citation snapshot; ledger unchanged')
  process.exit(0)
}

const assets = selectAssets(rows, total, policy)
if (!assets.length) throw new Error('Fresh page snapshot selected zero protected assets')
const ledger = {
  version: 1,
  status: 'ready',
  generatedAt: sourceReportGeneratedAt,
  snapshotLabel,
  sourceReportGeneratedAt,
  provenance: hasPageReport ? 'local-dated-page-report' : 'dated-derived-bing-page-stats-manifest',
  measurementBoundary: 'Bing Page Stats citation counts are not query totals or traffic and are not added to other views.',
  policy,
  assets,
}
writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n')
console.log('[ai-citation-assets] protected ' + assets.length + ' verified owners from ' + snapshotLabel)
