import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const gitignore = readFileSync(path.join(root, '.gitignore'), 'utf8')
const opportunityAnalyzer = readFileSync(path.join(root, 'scripts/seo/ai-query-opportunity-report.mjs'), 'utf8')
const citationTracker = readFileSync(path.join(root, 'scripts/seo/ai-citation-tracker.mjs'), 'utf8')

test('Bing AI raw exports and query-derived generated outputs remain local/private', () => {
  const requiredIgnoreRules = [
    'data-sources/ai-performance/*',
    'ops/reports/ai-query-opportunities.json',
    'ops/reports/ai-query-opportunities.md',
    'ops/reports/ai-citations.json',
    'ops/reports/ai-citations.md',
    'ops/ai-citations/history/*.json',
  ]

  for (const rule of requiredIgnoreRules) {
    assert.match(gitignore, new RegExp(`^${rule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'), `missing privacy ignore rule: ${rule}`)
  }

  assert.match(gitignore, /^!data-sources\/ai-performance\/README\.md$/m)
})

test('canonical analyzers keep writing only to the protected local report/history paths', () => {
  assert.match(opportunityAnalyzer, /ops\/reports|OUTPUT_DIR/)
  assert.match(opportunityAnalyzer, /ai-query-opportunities\.json/)
  assert.match(opportunityAnalyzer, /ai-query-opportunities\.md/)

  assert.match(citationTracker, /ops['"], ['"]ai-citations['"], ['"]history/)
  assert.match(citationTracker, /ai-citations\.json/)
  assert.match(citationTracker, /ai-citations\.md/)
})
