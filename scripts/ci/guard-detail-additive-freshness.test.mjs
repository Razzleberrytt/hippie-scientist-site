import { describe, expect, it } from 'vitest'
import { findStaleDetailRecords } from './guard-detail-additive-freshness.mjs'

const TAGS = {
  'herb-a': [{ risk_mechanism: 'serotonergic', pair_behavior: 'additive' }],
  'herb-b': [{ risk_mechanism: 'anticoagulant', pair_behavior: 'additive' }],
}

const readerFor = (records) => (slug) => records[slug] ?? null

describe('findStaleDetailRecords', () => {
  it('flags a missing additive mechanism', () => {
    const flat = [{ slug: 'herb-a', contraindications: ['serotonin syndrome with SSRIs'] }]
    const findings = findStaleDetailRecords(flat, TAGS, readerFor({ 'herb-a': { contraindications: ['pregnancy'] } }))
    expect(findings).toEqual([{ slug: 'herb-a', reason: 'stale_mechanism', missing: ['serotonergic'] }])
  })

  it('passes when detail content includes the mechanism', () => {
    const flat = [{ slug: 'herb-a', contraindications: ['serotonin syndrome with SSRIs'] }]
    expect(findStaleDetailRecords(flat, TAGS, readerFor({ 'herb-a': { contraindications: ['serotonin syndrome with SSRIs'] } }))).toEqual([])
  })

  it('flags an empty override', () => {
    const flat = [{ slug: 'herb-b', contraindications: ['bleeding risk with anticoagulants'] }]
    expect(findStaleDetailRecords(flat, TAGS, readerFor({ 'herb-b': { contraindications: [] } }))).toEqual([
      { slug: 'herb-b', reason: 'empty_override', missing: [] },
    ])
  })

  it('ignores absent detail files and absent contraindications keys', () => {
    const flat = [{ slug: 'herb-a', contraindications: ['serotonin syndrome with SSRIs'] }]
    expect(findStaleDetailRecords(flat, TAGS, readerFor({}))).toEqual([])
    expect(findStaleDetailRecords(flat, TAGS, readerFor({ 'herb-a': { dosage: '500 mg' } }))).toEqual([])
  })

  it('skips cluster-member records', () => {
    const flat = [{ slug: 'herb-a', runtime_export_decision: 'cluster_member_runtime', contraindications: ['serotonin syndrome'] }]
    expect(findStaleDetailRecords(flat, TAGS, readerFor({ 'herb-a': { contraindications: [] } }))).toEqual([])
  })
})
