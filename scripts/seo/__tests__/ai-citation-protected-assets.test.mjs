import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { test } from 'vitest'

const policy = JSON.parse(readFileSync('config/ai-citation-protection-policy.json', 'utf8'))
const ledger = JSON.parse(readFileSync('config/ai-citation-protected-assets.json', 'utf8'))
const audit = readFileSync('scripts/ci/audit-ai-citation-readiness.mjs', 'utf8')
const generator = readFileSync('scripts/seo/ai-citation-protected-assets.mjs', 'utf8')

test('AI citation protection thresholds are configurable and bounded', () => {
  assert.equal(policy.version, 1)
  assert.ok(policy.minCitations > 0)
  assert.ok(policy.minCitationSharePct > 0 && policy.minCitationSharePct <= 100)
  assert.ok(policy.cumulativeCoveragePct > 0 && policy.cumulativeCoveragePct <= 100)
  assert.ok(policy.maxAssets > 0)
  assert.ok(policy.staleAfterDays > 0)
})

test('durable ledger starts fail-safe without publishing private Bing data', () => {
  assert.equal(ledger.version, 1)
  assert.ok(['awaiting-fresh-ingest', 'ready'].includes(ledger.status))
  assert.ok(Array.isArray(ledger.assets))
  for (const asset of ledger.assets) {
    assert.match(asset.url, /^\//)
    assert.equal('queries' in asset, false)
  }
})

test('ledger generation is deterministic for an unchanged source report', () => {
  assert.doesNotMatch(generator, /new Date\s*\(/)
  assert.match(generator, /generatedAt:\s*sourceReportGeneratedAt/)
})

test('canonical AI-search audit invokes protected-asset identity validation', () => {
  assert.match(audit, /validate-ai-citation-protected-assets\.mjs/)
  const run = spawnSync(process.execPath, ['scripts/ci/validate-ai-citation-protected-assets.mjs'], { encoding: 'utf8' })
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`)
})
