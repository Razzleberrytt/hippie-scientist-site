import { describe, expect, it } from 'vitest'

import {
  migrateEvidenceGradeArray,
  migrateEvidenceGradeRecord,
} from '../normalize-evidence-grades.mjs'

describe('evidence-grade migration boundary', () => {
  it('rewrites known legacy variants to the canonical enum', () => {
    expect(migrateEvidenceGradeRecord({ evidence_grade: 'b+' }).record.evidence_grade).toBe('B')
    expect(migrateEvidenceGradeRecord({ evidence_grade: 'F' }).record.evidence_grade).toBe('Avoid/Insufficient')
    expect(migrateEvidenceGradeRecord({ evidence_grade: 'preclinical evidence' }).record.evidence_grade).toBe('D')
  })

  it('leaves already-canonical values byte-stable', () => {
    const original = { slug: 'x', evidence_grade: 'A' }
    const result = migrateEvidenceGradeRecord(original)
    expect(result.record).toBe(original)
    expect(result.changed).toBe(false)
    expect(result.status).toBe('canonical')
  })

  it('removes a misleading universal grade when the source is outcome-dependent', () => {
    const result = migrateEvidenceGradeRecord({ slug: 'x', evidence_grade: 'B for PCOS; D for core goals' })
    expect(result.record).toEqual({ slug: 'x' })
    expect(result.status).toBe('outcome-dependent-universal-grade-removed')
  })

  it('never guesses an unmappable value', () => {
    const original = { slug: 'x', evidence_grade: 'banana-scale' }
    const result = migrateEvidenceGradeRecord(original)
    expect(result.record).toBe(original)
    expect(result.status).toBe('unmappable')
    expect(result.canonical).toBeNull()
  })

  it('reports migrations and unknowns with record identity', () => {
    const result = migrateEvidenceGradeArray([
      { slug: 'one', evidence_grade: 'c-' },
      { slug: 'two', evidence_grade: 'mystery' },
      { slug: 'three', evidence_grade: 'D' },
    ])

    expect(result.output[0].evidence_grade).toBe('C')
    expect(result.findings).toEqual([
      { index: 0, slug: 'one', status: 'migrated', raw: 'c-', canonical: 'C' },
      { index: 1, slug: 'two', status: 'unmappable', raw: 'mystery', canonical: null },
    ])
  })
})
