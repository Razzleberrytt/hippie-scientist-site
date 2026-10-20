#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { SOURCE_MANIFEST, selectProtectedAssets } from './ai-citation-protection-core.mjs'

const ROOT = process.cwd()
const readJson = file => JSON.parse(readFileSync(path.join(ROOT, file), 'utf8'))
const signal = readJson(SOURCE_MANIFEST)
const policy = readJson('config/ai-citation-protection-policy.json')
const date = Date.parse(signal.snapshotLabel + 'T00:00:00Z')
const ageDays = (Date.now() - date) / 86400000
if (!Number.isFinite(date) || ageDays < -1 || ageDays > policy.staleAfterDays) {
  console.error('[ai-citation-assets] source snapshot missing, future-dated or stale; durable ledger unchanged')
  process.exitCode = 1
} else {
  const selected = selectProtectedAssets(ROOT, signal, policy)
  const ledger = {
    version: 2,
    status: 'ready',
    generatedAt: null, // deterministic; snapshot label is the only date claim
    snapshotLabel: signal.snapshotLabel,
    sourceReportGeneratedAt: null,
    sourceManifest: SOURCE_MANIFEST,
    sourceTotals: signal.totals,
    policy,
    ...selected,
  }
  writeFileSync(path.join(ROOT, 'config/ai-citation-protected-assets.json'), JSON.stringify(ledger, null, 2) + '\n')
  console.log('[ai-citation-assets] selected ' + ledger.assets.length + ' verified page owners (' +
    ledger.coveragePct + '% of dated page-level citations); unresolved ' + ledger.unresolved.length)
  for (const row of ledger.unresolved) console.warn('[ai-citation-assets] source owner unresolved: ' + row.url)
}
