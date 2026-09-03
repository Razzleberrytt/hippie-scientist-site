#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORT = path.join(ROOT, 'ops', 'reports', 'ai-citations.json')
const POLICY = path.join(ROOT, 'config', 'ai-citation-protection-policy.json')
const LEDGER = path.join(ROOT, 'config', 'ai-citation-protected-assets.json')

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
const sha = (value) => createHash('sha256').update(value ?? '').digest('hex')
const normalizeUrl = (url) => {
  const pathname = url.startsWith('http') ? new URL(url).pathname : url
  if (pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

function sourceFileFor(url) {
  const route = normalizeUrl(url)
  const file = route === '/' ? path.join(ROOT, 'app', 'page.tsx') : path.join(ROOT, 'app', route, 'page.tsx')
  return existsSync(file) ? path.relative(ROOT, file).replaceAll('\\', '/') : null
}

function extractIdentity(source) {
  const canonical = source.match(/canonical(?:s)?\s*:\s*(?:{[^}]*?)?["'`]([^"'`]+)["'`]/s)?.[1] ?? null
  const title = source.match(/title\s*:\s*["'`]([^"'`]+)["'`]/)?.[1] ?? null
  const h1 = source.match(/<h1(?:\s[^>]*)?>([^<{][\s\S]*?)<\/h1>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? null
  return {
    canonical,
    title,
    h1,
    fingerprints: {
      canonical: sha(canonical),
      title: sha(title),
      h1: sha(h1),
    },
  }
}

function selectAssets(report, policy) {
  const total = Number(report?.totals?.citations ?? 0)
  const rows = Array.isArray(report?.urls) ? [...report.urls] : Array.isArray(report?.topCited) ? [...report.topCited] : []
  rows.sort((a, b) => Number(b.citations ?? 0) - Number(a.citations ?? 0))
  let covered = 0
  const selected = []
  for (const row of rows) {
    if (selected.length >= policy.maxAssets) break
    const citations = Number(row.citations ?? 0)
    const sharePct = total > 0 ? (citations / total) * 100 : 0
    const reachesThreshold = citations >= policy.minCitations || sharePct >= policy.minCitationSharePct
    const belowCoverageTarget = total > 0 && (covered / total) * 100 < policy.cumulativeCoveragePct
    if (!reachesThreshold && !belowCoverageTarget) continue
    const url = normalizeUrl(row.url)
    const sourceFile = sourceFileFor(url)
    const source = sourceFile ? readFileSync(path.join(ROOT, sourceFile), 'utf8') : ''
    selected.push({
      url,
      sourceFile,
      citations,
      citationSharePct: Number(sharePct.toFixed(2)),
      protectionReason: reachesThreshold ? 'threshold' : 'cumulative-coverage',
      identity: sourceFile ? extractIdentity(source) : null,
    })
    covered += citations
  }
  return selected
}

if (!existsSync(REPORT)) {
  console.log('[ai-citation-assets] no local ai-citations report; durable ledger unchanged')
  process.exit(0)
}

const report = readJson(REPORT)
const policy = readJson(POLICY)
const assets = selectAssets(report, policy)
const sourceReportGeneratedAt = report.generatedAt ?? null
const ledger = {
  version: 1,
  status: assets.length ? 'ready' : 'awaiting-fresh-ingest',
  generatedAt: sourceReportGeneratedAt,
  snapshotLabel: report.snapshotLabel ?? null,
  sourceReportGeneratedAt,
  policy,
  assets,
}
writeFileSync(LEDGER, `${JSON.stringify(ledger, null, 2)}\n`)
console.log(`[ai-citation-assets] protected ${assets.length} assets -> ${path.relative(ROOT, LEDGER)}`)
