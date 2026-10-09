import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const build = readFileSync(new URL('../build-deploy.mjs', import.meta.url), 'utf8')
const search = readFileSync(new URL('../data/build-search-index.mjs', import.meta.url), 'utf8')

test('global search index always rebuilds after sanitize, even on data-cache hits', () => {
  // The search index reads content/learn frontmatter, not just workbook data.
  assert.match(search, /content\/learn/)
  const start = build.indexOf('const DATA_SEGMENT_STEPS = new Set([')
  const end = build.indexOf('const DATA_HASH_MARKER', start)
  assert.ok(start >= 0 && end > start, 'data skip-set must be inspectable')
  const gate = build.slice(start, end)
  assert.doesNotMatch(gate, /['"]build-search-index['"]/)

  const sanitize = build.indexOf("name: 'sanitize-public-text-final'")
  const searchIndex = build.indexOf("name: 'build-search-index'")
  const validate = build.indexOf("name: 'validate-editorial-leaks'")
  assert.ok(sanitize >= 0 && searchIndex > sanitize && validate > searchIndex,
    'search must use sanitized data and be validated before deployment')
})

test('data segment cache is invalidated by executable inputs and requires full core outputs', () => {
  const inputStart = build.indexOf('const DATA_INPUT_GLOBS = [')
  const inputEnd = build.indexOf('const DATA_SEGMENT_STEPS', inputStart)
  const inputs = build.slice(inputStart, inputEnd)
  for (const required of [
    'scripts/build-deploy.mjs',
    'scripts/cache/**/*.mjs',
    'lib/**/*.mjs',
    'content/articles/**/*',
    'content/blog/**/*',
    'package-lock.json',
  ]) assert.ok(inputs.includes(required), 'missing cache input: ' + required)

  const freshStart = build.indexOf('function isDataSegmentFresh(')
  const freshEnd = build.indexOf('let dataInputHash', freshStart)
  const fresh = build.slice(freshStart, freshEnd)
  assert.ok(fresh.includes('if (!fs.existsSync(DATA_HASH_MARKER)) return false'), 'missing-marker cache must fail closed')
  assert.ok(fresh.includes("fs.readFileSync(DATA_HASH_MARKER, 'utf8').trim() !== dataInputHash"), 'hash mismatch must force rebuild')
  for (const required of [
    'herbs.json',
    'compounds.json',
    'claims.json',
    'summary-indexes/herbs-summary.json',
    'summary-indexes/compounds-summary.json',
    'runtime-maps/related-profiles.json',
  ]) assert.ok(fresh.includes(required), 'missing cache output: ' + required)
})

// A warm cache may restore stale detail copies even when its input marker matches.
// Never skip this cheap reconciliation: the divergence gate must still catch
// governance conflicts rather than relaxing the authoritative baseline.
test('indexability synchronization must run on a warm cache hit', () => {
  const start = build.indexOf('const DATA_SEGMENT_STEPS = new Set([')
  const end = build.indexOf('const DATA_HASH_MARKER', start)
  assert.ok(start >= 0 && end > start, 'data cache gate must remain inspectable')
  assert.doesNotMatch(build.slice(start, end), /['"]sync-detail-indexability['"]/, 'warm cache may not skip detail reconciliation')
  const sync = build.indexOf("name: 'sync-detail-indexability'")
  const divergence = build.indexOf("name: 'validate-indexability-divergence'")
  assert.ok(sync >= 0 && divergence > sync, 'detail reconciliation must precede divergence validation')
  assert.match(build.slice(divergence, divergence + 700), /report-indexability-divergence/, 'authoritative divergence check remains enabled')
})
