import { expect, test } from 'vitest'

import {
  authorityProfileSignals,
  classifyCohort,
  periodForDate,
} from '../post-spam-cohort-lib.mjs'

function governed(overrides = {}) {
  return {
    researchEnrichment: {
      editorialStatus: 'approved',
      editorialReadiness: { publishable: true },
      supportedUses: [{ claim: 'a' }, { claim: 'b' }],
      unsupportedOrUnclearUses: [{ claim: 'c' }],
      interactions: [{ claim: 'd' }],
      contraindications: [],
      adverseEffects: [],
      mechanisms: [{ claim: 'e' }],
      sourceRegistryIds: ['s1', 's2', 's3', 's4'],
      evidenceSummary: 'Evidence summary',
      conflictNotes: [],
      researchGaps: [],
      ...overrides,
    },
  }
}

test('uses the requested August measurement windows', () => {
  expect(periodForDate('2026-08-04')).toBe('baseline')
  expect(periodForDate('2026-08-12')).toBe('baseline')
  expect(periodForDate('2026-08-13')).toBe('corrupted')
  expect(periodForDate('2026-08-17')).toBe('corrupted')
  expect(periodForDate('2026-08-18')).toBe('rollout')
  expect(periodForDate('2026-08-21')).toBe('rollout')
  expect(periodForDate('2026-08-22')).toBe('post')
})

test('separates authority, enriched, weak, editorial, research, and translated cohorts', () => {
  const map = new Map([
    ['herb:authority', governed()],
    ['herb:enriched', governed({ sourceRegistryIds: ['s1'] })],
  ])

  expect(authorityProfileSignals(map.get('herb:authority')).authority).toBe(true)
  expect(classifyCohort('/herbs/authority/', map)).toBe('A')
  expect(classifyCohort('/herbs/enriched/', map)).toBe('B')
  expect(classifyCohort('/herbs/weak/', map)).toBe('C')
  expect(classifyCohort('/guides/herbs/ashwagandha/', map)).toBe('D')
  expect(classifyCohort('/research/evidence-grading/', map)).toBe('E')
  expect(classifyCohort('/es/herbs/ashwagandha/', map)).toBe('F')
})
