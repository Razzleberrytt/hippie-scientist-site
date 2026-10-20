#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { extractCitationIdentity, normalizeCitationUrl, protectedSourceOwner } from '../seo/ai-citation-protection-core.mjs'

const ROOT = process.cwd()
const LEDGER = 'config/ai-citation-protected-assets.json'
const POLICY = 'config/ai-citation-protection-policy.json'
const SOURCE = 'config/ai-citation-swarm-priorities.json'
const readJson = p => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'))

if (![LEDGER, POLICY, SOURCE].every(p => existsSync(path.join(ROOT, p)))) {
  console.error('[ai-citation-assets] missing protected citation config')
  process.exit(1)
}
const ledger = readJson(LEDGER), policy = readJson(POLICY), signal = readJson(SOURCE)
if (ledger.status !== 'ready') {
  console.log('[ai-citation-assets] no dated protected source baseline; advisory (unprotected)')
  process.exit(0)
}
const date = Date.parse(String(ledger.snapshotLabel) + 'T00:00:00Z')
const ageDays = (Date.now() - date) / 86400000
if (!Number.isFinite(date) || ageDays > policy.staleAfterDays || ageDays < -1 ||
    ledger.snapshotLabel !== signal.snapshotLabel) {
  console.log('[ai-citation-assets] invalid/future/stale/mismatched source snapshot; citation-neutral advisory')
  process.exit(0)
}
const failures = []
if (ledger.version !== 2 || !Array.isArray(ledger.assets) || ledger.assets.length === 0) {
  failures.push('ledger has no valid, versioned protected source assets')
}
const observed = new Set()
for (const asset of ledger.assets ?? []) {
  const url = normalizeCitationUrl(asset.url)
  if (!url || url !== asset.url || observed.has(url)) {
    failures.push(String(asset.url) + ': invalid or duplicate URL')
    continue
  }
  observed.add(url)
  const upstream = signal.defendUrls?.find(r => r.url === url)
  if (!upstream || upstream.citations !== asset.citations) failures.push(url + ': citations differ from dated source manifest')
  const resolved = protectedSourceOwner(ROOT, url)
  const owner = resolved?.sourceFile
  if (!owner || owner !== asset.sourceFile || JSON.stringify(resolved.redirect) !== JSON.stringify(asset.redirect)) {
    failures.push(url + ': exact source owner or permanent redirect missing/changed (' + asset.sourceFile + ')')
    continue
  }
  const target = resolved.redirect?.to ?? url
  const current = extractCitationIdentity(readFileSync(path.join(ROOT, owner), 'utf8'), owner)
  if (!asset.identity?.title) failures.push(url + ': baseline is missing mandatory source title')
  for (const field of ['sourceType', 'title', 'slug', 'canonical']) {
    if (current[field] !== asset.identity?.[field]) {
      failures.push(url + ': protected ' + field + ' changed in ' + owner)
    }
  }
  if (current.canonical && current.canonical !== target) failures.push(url + ': current declared canonical differs from resolved source URL')
}
if (failures.length) {
  console.error('[ai-citation-assets] citation identity regression detected:')
  for (const failure of failures) console.error('  - ' + failure)
  console.error('For an intentional migration, review dated citation source, route, redirect, rollback and the revised ledger in the same PR.')
  process.exit(1)
}
console.log('[ai-citation-assets] PASS protected page owners=' + ledger.assets.length +
  '; unmatched dated source URLs=' + (ledger.unresolved?.length ?? 0))
