import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const analyzer = path.join(root, 'scripts/seo/ai-query-opportunity-report.mjs')
const queryCsv = (query, citations) => `Grounding Query,Intent,Topic,Citations,Citation Share\n${query},informational,sleep,${citations},10\n`
const overviewCsv = 'Date,Citations,Cited Pages\n2026-09-01,100,10\n'

test('AI query analyzer fails closed when multiple query exports have ambiguous freshness', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ai-query-selection-'))
  const out = path.join(dir, 'out')
  mkdirSync(out)
  writeFileSync(path.join(dir, 'overview.csv'), overviewCsv)
  writeFileSync(path.join(dir, 'queries-old.csv'), queryCsv('old query', 1))
  writeFileSync(path.join(dir, 'queries-new.csv'), queryCsv('new query', 9))

  const ambiguous = spawnSync(process.execPath, [analyzer, `--dir=${dir}`, `--out=${out}`], { encoding: 'utf8' })
  assert.notEqual(ambiguous.status, 0)
  assert.match(ambiguous.stderr, /freshness cannot be inferred safely/)
  assert.match(ambiguous.stderr, /--query=<filename>/)

  const explicit = spawnSync(process.execPath, [analyzer, `--dir=${dir}`, `--out=${out}`, '--query=queries-new.csv'], { encoding: 'utf8' })
  assert.equal(explicit.status, 0, explicit.stderr)
  const report = JSON.parse(readFileSync(path.join(out, 'ai-query-opportunities.json'), 'utf8'))
  assert.equal(report.queries.source, 'queries-new.csv')
  assert.equal(report.queries.queryCitations, 9)
})

test('explicit --query selection rejects a wrong export shape', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ai-query-shape-'))
  const out = path.join(dir, 'out')
  writeFileSync(path.join(dir, 'overview.csv'), overviewCsv)
  const result = spawnSync(process.execPath, [analyzer, `--dir=${dir}`, `--out=${out}`, '--query=overview.csv'], { encoding: 'utf8' })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /not a usable Search Query export/)
})
