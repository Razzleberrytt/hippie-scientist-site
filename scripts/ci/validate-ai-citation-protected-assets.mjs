#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  normalizeCitationUrl,
  findCitationOwner,
  identityFor,
} from '../seo/ai-citation-protection-core.mjs'

const ROOT = process.cwd()
const LEDGER = path.join(ROOT, 'config', 'ai-citation-protected-assets.json')
const POLICY = path.join(ROOT, 'config', 'ai-citation-protection-policy.json')
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))

if (!existsSync(LEDGER) || !existsSync(POLICY)) {
  console.error('[ai-citation-assets] missing ledger or protection policy')
  process.exit(1)
}

const ledger = readJson(LEDGER)
const policy = readJson(POLICY)
if (ledger.status !== 'ready') {
  console.log('[ai-citation-assets] not yet ready; no identity gate claimed')
  process.exit(0)
}
const stamp = ledger.sourceReportGeneratedAt || ledger.snapshotLabel
const age = typeof stamp === 'string' && stamp.trim() ? Date.now() - Date.parse(stamp) : NaN
if (!Number.isFinite(age)) {
  console.error('[ai-citation-assets] ready ledger requires valid dated provenance')
  process.exit(1)
}
if (age < 0 || age > policy.staleAfterDays * 86400000) {
  console.log('[ai-citation-assets] future-dated or stale citation snapshot: citation-neutral; unrelated changes not blocked')
  process.exit(0)
}

const failures = []
if (!Array.isArray(ledger.assets) || ledger.assets.length < 1) failures.push('ready ledger has no protected assets')
if (!Array.isArray(ledger.exceptions)) failures.push('ready ledger missing explicit exception inventory')
if (ledger.sourceKind === 'owner-validated-derived-page-stats' &&
    ledger.sourcePath !== 'config/ai-citation-swarm-priorities.json') {
  failures.push('invalid derived snapshot provenance')
}
const seen = new Set()
for (const asset of ledger.assets ?? []) {
  let route
  try { route = normalizeCitationUrl(asset.url) } catch { failures.push('invalid protected route'); continue }
  if (seen.has(route)) failures.push(route + ': duplicate protected route')
  seen.add(route)
  if (!asset.sourceFile || !asset.sourceType || !asset.identity ||
      !Array.isArray(asset.protectedFields) || !asset.identity.title) {
    failures.push(route + ': missing verifiable source owner or protected identity')
    continue
  }
  const owner = findCitationOwner(ROOT, route)
  if (!owner || owner.sourceFile !== asset.sourceFile || owner.sourceType !== asset.sourceType) {
    failures.push(route + ': canonical source owner missing, moved, or changed')
    continue
  }
  const current = identityFor(ROOT, owner)
  const fields = Object.keys(asset.identity).sort()
  if (JSON.stringify(fields) !== JSON.stringify([...asset.protectedFields].sort())) {
    failures.push(route + ': protectedFields does not match observed baseline fields')
  }
  if (asset.sourceType === 'article-frontmatter' && !asset.identity.slug) {
    failures.push(route + ': article slug missing from baseline')
  }
  for (const field of fields) {
    if (!['title', 'canonical', 'h1', 'slug'].includes(field) ||
        typeof asset.identity[field] !== 'string' || asset.identity[field].length === 0) {
      failures.push(route + ': unrecognized or empty identity baseline ' + field)
      continue
    }
    if (current[field] !== asset.identity[field]) failures.push(route + ': protected ' + field + ' changed')
  }
}
for (const exception of ledger.exceptions ?? []) {
  let route
  try { route = normalizeCitationUrl(exception.url) } catch { failures.push('invalid exception route'); continue }
  if (seen.has(route)) failures.push(route + ': exception overlaps another citation asset')
  seen.add(route)
  if (!['no-exact-canonical-source-owner', 'missing-protectable-source-identity', 'canonical-route-mismatch'].includes(exception.reason)) {
    failures.push(route + ': unapproved or missing exception reason')
  }
}
if (ledger.coverage?.selectedUrls !== seen.size ||
    ledger.coverage?.protectedUrls !== ledger.assets?.length ||
    ledger.coverage?.exceptionUrls !== ledger.exceptions?.length) {
  failures.push('selected/protected/exception coverage reconciliation mismatch')
}
if (failures.length) {
  console.error('[ai-citation-assets] protected identity regression or invalid ledger:')
  for (const failure of failures) console.error(' - ' + failure)
  console.error('Intentional route or title migrations need reviewed source proof, redirect and rollback before the dated ledger is refreshed.')
  process.exit(1)
}
console.log('[ai-citation-assets] PASS protected=' + ledger.assets.length + ' exceptions=' + ledger.exceptions.length +
  ' snapshot=' + ledger.snapshotLabel)
