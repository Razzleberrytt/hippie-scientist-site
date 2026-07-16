import { describe, expect, it } from 'vitest'
import { findStaleDetailRecords } from './guard-detail-additive-freshness.mjs'

const TAGS_BY_SLUG = {
  'herb-a': [
    { risk_mechanism: 'pregnancy', pair_behavior: 'single_only' },
    { risk_mechanism: 'serotonergic', pair_behavior: 'additive' },
  ],
  'herb-b': [{ risk_mechanism: 'anticoagulant', pair_behavior: 'additive' }],
}

function readerFor(detailBySlug) {
  return (slug) => detailBySlug[slug] ?? null
}

describe('findStaleDetailRecords', () => {
  it('flags a detail file missing a newly-tagged additive mechanism', () => {
    const flat = [{ slug: 'herb-a', contraindications: ['pregnancy', 'serotonin syndrome with SSRIs'] }]
    const detail = { 'herb-a': { contraindications: ['pregnancy'] } } // stale: no serotonergic keyword
    const findings = findStaleDetailRecords(flat, TAGS_BY_SLUG, readerFor(detail))
    expect(findings).toEqual([{ slug: 'herb-a', reason: 'stale_mechanism', missing: ['serotonergic'] }])
  })

  it('passes when the detail file already reflects the tagged mechanism', () => {
    const flat = [{ slug: 'herb-a', contraindications: ['pregnancy', 'serotonin syndrome with SSRIs'] }]
    const detail = { 'herb-a': { contraindications: ['pregnancy', 'risk of serotonin syndrome with SSRIs'] } }
    expect(findStaleDetailRecords(flat, TAGS_BY_SLUG, readerFor(detail))).toEqual([])
  })

  it('flags an empty detail contraindications array that would clobber a non-empty flat record', () => {
    const flat = [{ slug: 'herb-b', contraindications: ['bleeding risk with anticoagulants'] }]
    const detail = { 'herb-b': { contraindications: [] } }
    const findings = findStaleDetailRecords(flat, TAGS_BY_SLUG, readerFor(detail))
    expect(findings).toEqual([{ slug: 'herb-b', reason: 'empty_override', missing: [] }])
  })

  it('ignores entities with no detail file at all', () => {
    const flat = [{ slug: 'herb-a', contraindications: ['pregnancy', 'serotonin syndrome with SSRIs'] }]
    expect(findStaleDetailRecords(flat, TAGS_BY_SLUG, readerFor({}))).toEqual([])
  })

  it('ignores a detail file with no contraindications key present', () => {
    const flat = [{ slug: 'herb-a', contraindications: ['pregnancy', 'serotonin syndrome with SSRIs'] }]
    const detail = { 'herb-a': { dosage: '500mg' } }
    expect(findStaleDetailRecords(flat, TAGS_BY_SLUG, readerFor(detail))).toEqual([])
  })

  it('ignores entities with no additive-mechanism tags at all', () => {
    const flat = [{ slug: 'herb-c', contraindications: ['pregnancy'] }]
    const detail = { 'herb-c': { contraindications: ['pregnancy'] } }
    expect(findStaleDetailRecords(flat, TAGS_BY_SLUG, readerFor(detail))).toEqual([])
  })

  it('skips cluster-member records entirely (trust-resolved separately, not a blanket overlay)', () => {
    const flat = [
      {
        slug: 'herb-a',
        runtime_export_decision: 'cluster_member_runtime',
        contraindications: ['pregnancy', 'serotonin syndrome with SSRIs'],
      },
    ]
    const detail = { 'herb-a': { contraindications: [] } }
    expect(findStaleDetailRecords(flat, TAGS_BY_SLUG, readerFor(detail))).toEqual([])
  })
})
