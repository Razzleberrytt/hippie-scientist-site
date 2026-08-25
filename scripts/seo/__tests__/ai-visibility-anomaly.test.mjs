import { expect, test } from 'vitest'

import {
  anomalyForDate,
  isCorruptedAiVisibilityDate,
  partitionDatedRows,
} from '../ai-visibility-anomaly.mjs'

test('marks only Aug 13-17, 2026 as the known corrupted AI reporting window', () => {
  expect(isCorruptedAiVisibilityDate('2026-08-12')).toBe(false)
  expect(isCorruptedAiVisibilityDate('2026-08-13')).toBe(true)
  expect(isCorruptedAiVisibilityDate('2026-08-17T12:00:00Z')).toBe(true)
  expect(isCorruptedAiVisibilityDate('2026-08-18')).toBe(false)
  expect(anomalyForDate('not-a-date')).toBeNull()
})

test('partitions dated rows without dropping undated aggregates', () => {
  const rows = [
    { date: '2026-08-12', value: 1 },
    { date: '2026-08-13', value: 2 },
    { date: '', value: 3 },
    { date: '2026-08-18', value: 4 },
  ]
  const result = partitionDatedRows(rows, row => row.date)

  expect(result.excluded.map(row => row.value)).toEqual([2])
  expect(result.undated.map(row => row.value)).toEqual([3])
  expect(result.clean.map(row => row.value)).toEqual([1, 3, 4])
})
