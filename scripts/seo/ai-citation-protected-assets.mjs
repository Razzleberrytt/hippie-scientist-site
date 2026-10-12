#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { normalizeCitationUrl, findCitationOwner, identityFor } from './ai-citation-protection-core.mjs'

const ROOT = process.cwd()
const REPORT = path.join(ROOT, 'ops', 'reports', 'ai-citations.json')
const MANIFEST = path.join(ROOT, 'config', 'ai-citation-swarm-priorities.json')
const POLICY = path.join(ROOT, 'config', 'ai-citation-protection-policy.json')
const LEDGER = path.join(ROOT, 'config', 'ai-citation-protected-assets.json')
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))

// The durable owner-validated derived manifest is explicit, not a substitute for a
// fresh source report. Authenticated Bing CSVs must never enter the public repo.
const manifestMode = process.argv.includes('--from-manifest')
if (!manifestMode && !existsSync(REPORT)) {
  console.log('[ai-citation-assets] no local report; durable protection ledger unchanged')
  process.exit(0)
}

const source = readJson(manifestMode ? MANIFEST : REPORT)
const policy = readJson(POLICY)
const snapshotLabel = String(source.snapshotLabel || '')
if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotLabel) || !Number.isFinite(Date.parse(snapshotLabel))) {
  throw new Error('A dated source snapshot is required before writing the protected ledger')
}
const sourceReportGeneratedAt = manifestMode ? null : source.generatedAt ?? null
const citationsTotal = Number(source?.totals?.citations ?? 0)
const rows = manifestMode ? source.defendUrls : (source.urls ?? source.topCited ?? [])
if (!Array.isArray(rows) || !rows.length || !Number.isFinite(citationsTotal) || citationsTotal <= 0) {
  throw new Error('Invalid or empty citation source: protected ledger unchanged')
}

const seen = new Set()
let considered = 0
let protectedCitations = 0
const assets = []
const exceptions = []
const ranked = [...rows].sort((a, b) => Number(b.citations ?? 0) - Number(a.citations ?? 0))
for (const row of ranked) {
  if (considered >= policy.maxAssets) break
  const citations = Number(row.citations)
  if (!Number.isFinite(citations) || citations < 0) throw new Error('Invalid page citation count')
  const sharePct = citationsTotal > 0 ? citations / citationsTotal * 100 : 0
  const reachesThreshold = citations >= policy.minCitations || sharePct >= policy.minCitationSharePct
  const belowTarget = protectedCitations / citationsTotal * 100 < policy.cumulativeCoveragePct
  if (!reachesThreshold && !belowTarget) continue

  const url = normalizeCitationUrl(row.url)
  if (seen.has(url)) throw new Error('Duplicate canonical asset in citation source: ' + url)
  seen.add(url)
  considered += 1
  const common = { url, citations, citationSharePct: Number(sharePct.toFixed(2)) }
  const owner = findCitationOwner(ROOT, url)
  if (!owner) {
    exceptions.push({ ...common, reason: 'no-exact-canonical-source-owner' })
    continue
  }
  const identity = identityFor(ROOT, owner)
  if (!identity.title || (owner.sourceType === 'article-frontmatter' && !identity.slug)) {
    exceptions.push({ ...common, sourceFile: owner.sourceFile, reason: 'missing-protectable-source-identity' })
    continue
  }
  if (identity.canonical && normalizeCitationUrl(identity.canonical) !== url) {
    exceptions.push({ ...common, sourceFile: owner.sourceFile, reason: 'canonical-route-mismatch' })
    continue
  }
  assets.push({
    ...common,
    sourceFile: owner.sourceFile,
    sourceType: owner.sourceType,
    protectionReason: reachesThreshold ? 'threshold' : 'cumulative-coverage',
    identity,
    protectedFields: Object.keys(identity).sort(),
  })
  protectedCitations += citations
}

if (!assets.length) throw new Error('No resolvable protected assets: ledger unchanged')
const ledger = {
  version: 1,
  status: 'ready',
  generatedAt: sourceReportGeneratedAt,
  snapshotLabel,
  sourceReportGeneratedAt,
  sourceKind: manifestMode ? 'owner-validated-derived-page-stats' : 'retained-first-party-report',
  sourcePath: manifestMode ? 'config/ai-citation-swarm-priorities.json' : 'ops/reports/ai-citations.json',
  policy,
  coverage: {
    selectedUrls: considered,
    protectedUrls: assets.length,
    exceptionUrls: exceptions.length,
    protectedCitations,
    protectedSharePct: Number((protectedCitations / citationsTotal * 100).toFixed(2)),
  },
  assets,
  exceptions,
}
writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n')
console.log('[ai-citation-assets] protected ' + assets.length + '/' + considered +
  ' selected URLs (' + ledger.coverage.protectedSharePct + '% of source page citations), ' +
  exceptions.length + ' explicit owner exceptions')
