import test from 'node:test'
import assert from 'node:assert/strict'

import { overlapReport } from '../pr-overlap.mjs'

test('blocks exact overlap on enrichment-sensitive files', () => {
  const result = overlapReport(
    ['scripts/enrichment-governor/governor.mjs', 'README.md'],
    [{ number: 99, title: 'other enrichment work', head: 'other', files: ['scripts/enrichment-governor/governor.mjs', 'docs/other.md'] }]
  )
  assert.equal(result.ok, false)
  assert.deepEqual(result.overlaps[0].shared, ['scripts/enrichment-governor/governor.mjs'])
})

test('ignores unrelated file overlap outside sensitive paths', () => {
  const result = overlapReport(
    ['README.md'],
    [{ number: 99, title: 'docs', head: 'docs', files: ['README.md'] }]
  )
  assert.equal(result.ok, true)
})

test('allows disjoint enrichment-sensitive work', () => {
  const result = overlapReport(
    ['ops/enrichment-governor/state.json'],
    [{ number: 99, title: 'source reporter', head: 'source', files: ['scripts/data/report-held-source-verification-queue.mjs'] }]
  )
  assert.equal(result.ok, true)
})
