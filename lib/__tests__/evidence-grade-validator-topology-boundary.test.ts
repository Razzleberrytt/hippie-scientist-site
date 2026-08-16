import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('evidence-grade standalone validator boundary', () => {
  it('consumes the canonical snapshot and hard-fails topology-backed Grade A contradictions', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts/ci/validate-evidence-grade-consistency.ts'),
      'utf8',
    )

    expect(source).toContain("from '../../lib/research-quality-snapshot'")
    expect(source).toContain('buildResearchQualitySnapshot(ROOT)')
    expect(source).not.toContain('analyzeEvidenceGradeConsistency(')
    expect(source).toContain('report.topologyContradictions.length > 0')
    expect(source).toContain('Grade A contradiction(s) proven by canonical underlying-study topology')
  })
})
