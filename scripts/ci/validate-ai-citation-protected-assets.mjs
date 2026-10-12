#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { identityFailures, selectProtectedAssets } from '../seo/ai-citation-protected-assets-lib.mjs'

const root = process.cwd()
const read = (name) => JSON.parse(readFileSync(path.join(root, name), 'utf8'))
const ledger = read('config/ai-citation-protected-assets.json')
const policy = read('config/ai-citation-protection-policy.json')
const manifest = read('config/ai-citation-swarm-priorities.json')

if (ledger.status !== 'ready' || !Array.isArray(ledger.assets) || ledger.assets.length === 0) {
  console.error('[ai-citation-assets] no active durable protection baseline; refusing silent advisory pass')
  process.exit(1)
}
const label = ledger.snapshotLabel
const stamp = /^\d{4}-\d{2}-\d{2}$/.test(label ?? '') ? Date.parse(label + 'T00:00:00Z') : NaN
const daysOld = (Date.now() - stamp) / 86400000
if (!Number.isFinite(daysOld) || daysOld < -1 || daysOld > policy.staleAfterDays) {
  console.warn('[ai-citation-assets] invalid/future/stale Bing snapshot; guard neutral for unrelated changes; refresh from verified Page Stats')
  process.exit(0)
}
const failures = []
if (ledger.sourceKind !== 'owner-verified-derived-bing-page-stats' || ledger.snapshotLabel !== manifest.snapshotLabel) failures.push('source/snapshot mismatch')
if (ledger.totals?.citations !== manifest.totals?.citations || ledger.totals?.citedUrls !== manifest.totals?.citedUrls) failures.push('derived source totals changed without reviewed baseline refresh')
let expected
try { expected = selectProtectedAssets({ root, manifest, policy }) } catch (e) { failures.push('invalid owner selection: ' + e.message) }
if (expected) {
  if (JSON.stringify(ledger.assets) !== JSON.stringify(expected.assets)) failures.push('baseline identities or coverage do not match current verified owner extraction')
  if (JSON.stringify(ledger.unresolvedOwners) !== JSON.stringify(expected.unresolvedOwners)) failures.push('source ownership exceptions changed')
  if (ledger.citationsCovered !== expected.citationsCovered || ledger.coveragePct !== expected.coveragePct) failures.push('citation coverage mismatch')
}
failures.push(...identityFailures(root, ledger))
if (failures.length) {
  console.error('[ai-citation-assets] verified citation-winner identity regression:')
  failures.forEach(f => console.error('  - ' + f))
  console.error('For deliberate migration: document canonical/redirect/rollback proof and refresh the ledger from a dated verified source with human review.')
  process.exit(1)
}
console.log('[ai-citation-assets] PASS: ' + ledger.assets.length + ' verified canonical source owners / ' + ledger.coveragePct + '% of dated Page Stats citations')
