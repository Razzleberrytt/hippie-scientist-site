import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  migrateEvidenceGradeArray,
  migrateEvidenceGradeRecord,
  normalizeEvidenceGradeFiles,
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

  it('removes a misleading universal grade and leaves an outcome-dependent marker', () => {
    const result = migrateEvidenceGradeRecord({ slug: 'x', evidence_grade: 'B for PCOS; D for core goals' })
    expect(result.record).toEqual({ slug: 'x', evidence_grade_status: 'outcome-dependent' })
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

  it('normalizes every denormalized runtime surface emitted by the workbook builder', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-grade-migration-'))
    const files = [
      'herbs.json',
      'compounds.json',
      'featured-herbs.json',
      'featured-compounds.json',
      'herb-index.json',
      'compound-index.json',
      'claims.json',
    ]

    try {
      for (const filename of files) {
        fs.writeFileSync(
          path.join(dir, filename),
          `${JSON.stringify([{ slug: filename, evidence_grade: 'b+' }], null, 2)}\n`,
          'utf8',
        )
      }

      const report = normalizeEvidenceGradeFiles({ dataDir: dir, write: true, strict: true })
      expect(report.files.filter((file) => file.exists)).toHaveLength(files.length)
      expect(report.totals.unmappable).toBe(0)

      for (const filename of files) {
        const [record] = JSON.parse(fs.readFileSync(path.join(dir, filename), 'utf8'))
        expect(record.evidence_grade, filename).toBe('B')
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})
