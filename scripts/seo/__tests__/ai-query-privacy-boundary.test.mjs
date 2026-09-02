import { test, expect } from 'vitest'
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
    expect(gitignore).toMatch(new RegExp(`^${rule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'))
  }

  expect(gitignore).toMatch(/^!data-sources\/ai-performance\/README\.md$/m)
})

test('canonical analyzers keep writing only to the protected local report/history paths', () => {
  expect(opportunityAnalyzer).toMatch(/ops\/reports|OUTPUT_DIR/)
  expect(opportunityAnalyzer).toMatch(/ai-query-opportunities\.json/)
  expect(opportunityAnalyzer).toMatch(/ai-query-opportunities\.md/)

  expect(citationTracker).toMatch(/ops['"], ['"]ai-citations['"], ['"]history/)
  expect(citationTracker).toMatch(/ai-citations\.json/)
  expect(citationTracker).toMatch(/ai-citations\.md/)
})
