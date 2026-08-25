import assert from 'node:assert/strict'
import test from 'node:test'

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
  assert.equal(periodForDate('2026-08-04'), 'baseline')
  assert.equal(periodForDate('2026-08-12'), 'baseline')
  assert.equal(periodForDate('2026-08-13'), 'corrupted')
  assert.equal(periodForDate('2026-08-17'), 'corrupted')
  assert.equal(periodForDate('2026-08-18'), 'rollout')
  assert.equal(periodForDate('2026-08-21'), 'rollout')
  assert.equal(periodForDate('2026-08-22'), 'post')
})

test('separates authority, enriched, weak, editorial, research, and translated cohorts', () => {
  const map = new Map([
    ['herb:authority', governed()],
    ['herb:enriched', governed({ sourceRegistryIds: ['s1'] })],
  ])

  assert.equal(authorityProfileSignals(map.get('herb:authority')).authority, true)
  assert.equal(classifyCohort('/herbs/authority/', map), 'A')
  assert.equal(classifyCohort('/herbs/enriched/', map), 'B')
  assert.equal(classifyCohort('/herbs/weak/', map), 'C')
  assert.equal(classifyCohort('/guides/herbs/ashwagandha/', map), 'D')
  assert.equal(classifyCohort('/research/evidence-grading/', map), 'E')
  assert.equal(classifyCohort('/es/herbs/ashwagandha/', map), 'F')
})
