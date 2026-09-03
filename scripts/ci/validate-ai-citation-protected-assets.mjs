#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const LEDGER = path.join(ROOT, 'config', 'ai-citation-protected-assets.json')
const POLICY = path.join(ROOT, 'config', 'ai-citation-protection-policy.json')
const sha = (value) => createHash('sha256').update(value ?? '').digest('hex')
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))

function extractIdentity(source) {
  const canonical = source.match(/canonical(?:s)?\s*:\s*(?:{[^}]*?)?["'`]([^"'`]+)["'`]/s)?.[1] ?? null
  const title = source.match(/title\s*:\s*["'`]([^"'`]+)["'`]/)?.[1] ?? null
  const h1 = source.match(/<h1(?:\s[^>]*)?>([^<{][\s\S]*?)<\/h1>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? null
  return { canonical, title, h1, fingerprints: { canonical: sha(canonical), title: sha(title), h1: sha(h1) } }
}

if (!existsSync(LEDGER)) {
  console.error('[ai-citation-assets] missing durable ledger')
  process.exit(1)
}
if (!existsSync(POLICY)) {
  console.error('[ai-citation-assets] missing protection policy')
  process.exit(1)
}

const ledger = readJson(LEDGER)
const policy = readJson(POLICY)
if (ledger.status !== 'ready' || !Array.isArray(ledger.assets) || ledger.assets.length === 0) {
  console.log('[ai-citation-assets] no fresh protected assets yet; identity gate is fail-safe advisory')
  process.exit(0)
}

if (ledger.sourceReportGeneratedAt) {
  const ageDays = (Date.now() - Date.parse(ledger.sourceReportGeneratedAt)) / 86400000
  if (Number.isFinite(ageDays) && ageDays > policy.staleAfterDays) {
    console.log(`[ai-citation-assets] ledger is ${ageDays.toFixed(1)} days old; stale data will not block unrelated PRs`)
    process.exit(0)
  }
}

const failures = []
for (const asset of ledger.assets) {
  if (!asset.sourceFile) continue
  const file = path.join(ROOT, asset.sourceFile)
  if (!existsSync(file)) {
    failures.push(`${asset.url}: source owner missing (${asset.sourceFile})`)
    continue
  }
  const current = extractIdentity(readFileSync(file, 'utf8'))
  for (const field of ['canonical', 'title', 'h1']) {
    const baseline = asset.identity?.fingerprints?.[field]
    if (!baseline) continue
    if (current.fingerprints[field] !== baseline) failures.push(`${asset.url}: protected ${field} changed in ${asset.sourceFile}`)
  }
}

if (failures.length) {
  console.error('[ai-citation-assets] protected identity regression detected:')
  for (const failure of failures) console.error(`  - ${failure}`)
  console.error('If intentional, refresh the ledger from a fresh Bing AI export and document migration/redirect/rollback in the PR.')
  process.exit(1)
}
console.log(`[ai-citation-assets] PASS protected assets=${ledger.assets.length}`)
