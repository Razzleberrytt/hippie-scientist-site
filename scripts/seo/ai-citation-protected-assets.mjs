#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { selectProtectedAssets } from './ai-citation-protected-assets-lib.mjs'

const root = process.cwd()
const read = (relative) => JSON.parse(readFileSync(path.join(root, relative), 'utf8'))
const manifest = read('config/ai-citation-swarm-priorities.json')
const policy = read('config/ai-citation-protection-policy.json')
const selected = selectProtectedAssets({ root, manifest, policy })
const ledger = {
  version: 1,
  status: 'ready',
  sourceKind: 'owner-verified-derived-bing-page-stats',
  snapshotLabel: manifest.snapshotLabel,
  generatedAt: null,
  sourceReportGeneratedAt: null,
  policy,
  totals: { citations: manifest.totals.citations, citedUrls: manifest.totals.citedUrls },
  citationsCovered: selected.citationsCovered,
  coveragePct: selected.coveragePct,
  assets: selected.assets,
  unresolvedOwners: selected.unresolvedOwners,
}
const target = path.join(root, 'config/ai-citation-protected-assets.json')
writeFileSync(target, JSON.stringify(ledger, null, 2) + '\n')
console.log('[ai-citation-assets] baseline: ' + ledger.assets.length + ' source-owned pages, ' + ledger.coveragePct + '% citation coverage, ' + ledger.unresolvedOwners.length + ' unresolved route owners')
