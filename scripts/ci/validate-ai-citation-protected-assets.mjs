#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { findCitationOwner, normalizeCitationPath } from '../seo/ai-citation-protected-identity.mjs'

const ROOT = process.cwd()
const LEDGER = path.join(ROOT, 'config/ai-citation-protected-assets.json')
const POLICY = path.join(ROOT, 'config/ai-citation-protection-policy.json')
const json = (p) => JSON.parse(readFileSync(p, 'utf8'))
const hash = (v) => v === null ? null : createHash('sha256').update(v).digest('hex')

if (!existsSync(LEDGER) || !existsSync(POLICY)) {
  console.error('[ai-citation-assets] ledger or policy missing')
  process.exit(1)
}
const ledger = json(LEDGER)
const policy = json(POLICY)
if (ledger.status !== 'ready' || !Array.isArray(ledger.assets) || !ledger.assets.length) {
  console.log('[ai-citation-assets] no fresh protected assets yet; identity gate is fail-safe advisory')
  process.exit(0)
}
const snapshot = ledger.snapshotLabel
if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshot ?? '')) {
  console.log('[ai-citation-assets] invalid/missing dated snapshot; identity gate advisory')
  process.exit(0)
}
const age = (Date.now() - Date.parse(snapshot + 'T00:00:00Z')) / 86400000
if (!Number.isFinite(age) || age < -1 || age > policy.staleAfterDays) {
  console.log('[ai-citation-assets] snapshot future/stale; no unrelated PR blocking')
  process.exit(0)
}

const failures = []
const seen = new Set()
if (ledger.assets.length > policy.maxAssets) failures.push('protected assets exceed maxAssets policy')
for (const asset of ledger.assets) {
  try {
    const url = normalizeCitationPath(asset.url)
    if (seen.has(url)) failures.push('duplicate protected URL: ' + url)
    seen.add(url)
    if (!asset.sourceFile || !asset.identity || !asset.identity.slug || !asset.identity.canonical || (asset.identity.kind !== 'redirect' && !asset.identity.title)) {
      failures.push(url + ': incomplete protected source identity')
      continue
    }
    const owner = findCitationOwner(ROOT, url)
    if (owner.sourceFile !== asset.sourceFile) {
      failures.push(url + ': source owner changed/missing from ' + asset.sourceFile + ' to ' + owner.sourceFile)
      continue
    }
    if (!owner.identity) {
      failures.push(url + ': source identity cannot be verified in ' + asset.sourceFile)
      continue
    }
    if (asset.identity.kind === 'tsx' && !owner.identity.h1) failures.push(url + ': source H1 not verifiably protected')
    const fields = ['kind', 'title', 'slug', 'canonical', 'h1', ...(Object.hasOwn(asset.identity, 'headingSourceFile') ? ['headingSourceFile'] : [])]
    for (const key of fields) {
      const expected = asset.identity[key]
      const actual = owner.identity[key]
      if (expected !== actual) failures.push(url + ': protected ' + key + ' changed in ' + asset.sourceFile)
      // Legacy ledger fields may omit digests, but a digest must never hide a value drift.
      if (asset.fingerprints && asset.fingerprints[key] !== hash(expected ?? null)) failures.push(url + ': invalid baseline ' + key + ' digest')
    }
  } catch (error) { failures.push(asset.url + ': validation error: ' + error.message) }
}
if (failures.length) {
  console.error('[ai-citation-assets] protected identity regression:')
  failures.forEach(message => console.error('  - ' + message))
  console.error('Document authorized canonical/title migration, redirect and rollback before refreshing protection baseline. Legitimate scientific corrections do not need a baseline refresh unless identity changes.')
  process.exit(1)
}
console.log('[ai-citation-assets] PASS protected assets=' + ledger.assets.length + '; snapshot=' + snapshot)
