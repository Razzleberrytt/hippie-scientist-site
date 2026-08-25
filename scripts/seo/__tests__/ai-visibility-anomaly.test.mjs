import assert from 'node:assert/strict'
import test from 'node:test'

import {
  anomalyForDate,
  isCorruptedAiVisibilityDate,
  partitionDatedRows,
} from '../ai-visibility-anomaly.mjs'

test('marks only Aug 13-17, 2026 as the known corrupted AI reporting window', () => {
  assert.equal(isCorruptedAiVisibilityDate('2026-08-12'), false)
  assert.equal(isCorruptedAiVisibilityDate('2026-08-13'), true)
  assert.equal(isCorruptedAiVisibilityDate('2026-08-17T12:00:00Z'), true)
  assert.equal(isCorruptedAiVisibilityDate('2026-08-18'), false)
  assert.equal(anomalyForDate('not-a-date'), null)
})

test('partitions dated rows without dropping undated aggregates', () => {
  const rows = [
    { date: '2026-08-12', value: 1 },
    { date: '2026-08-13', value: 2 },
    { date: '', value: 3 },
    { date: '2026-08-18', value: 4 },
  ]
  const result = partitionDatedRows(rows, row => row.date)

  assert.deepEqual(result.excluded.map(row => row.value), [2])
  assert.deepEqual(result.undated.map(row => row.value), [3])
  assert.deepEqual(result.clean.map(row => row.value), [1, 3, 4])
})
