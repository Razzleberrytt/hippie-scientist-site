import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const FORBIDDEN_ASSEMBLY_CALLS = [
  'analyzeResearchQuality(',
  'buildResearchQualityTopology(',
  'buildResearchQualityGate(',
  'buildResearchGapQueue(',
  'analyzeResearchSourceIntegrity(',
] as const

const OWNED_ANALYSIS_CALLS = [
  {
    call: 'analyzeCitationIntegrity(',
    allowedFiles: new Set(['scripts/ci/validate-citation-identifiers.mjs']),
  },
] as const

function listCodeFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return listCodeFiles(full)
    return /\.(?:ts|mjs|js)$/.test(entry.name) ? [full] : []
  })
}

describe('research-quality script boundary', () => {
  it('keeps every script consumer on the canonical research-quality snapshot', () => {
    const root = process.cwd()
    const scriptsDir = path.join(root, 'scripts')
    const violations: string[] = []

    for (const file of listCodeFiles(scriptsDir)) {
      const source = fs.readFileSync(file, 'utf8')
      const relative = path.relative(root, file).replaceAll(path.sep, '/')

      for (const call of FORBIDDEN_ASSEMBLY_CALLS) {
        if (!source.includes(call)) continue
        violations.push(`${relative} -> ${call}`)
      }

      for (const rule of OWNED_ANALYSIS_CALLS) {
        if (!source.includes(rule.call) || rule.allowedFiles.has(relative)) continue
        violations.push(`${relative} -> ${rule.call}`)
      }
    }

    expect(
      violations,
      `Scripts must consume buildResearchQualitySnapshot() instead of reconstructing canonical research state; direct specialized analyzers are reserved for explicitly owned lightweight validators:\n${violations.join('\n')}`,
    ).toEqual([])
  })

  it('keeps structured content integrity in-process in the canonical roll-up', () => {
    const root = process.cwd()
    const rollup = fs.readFileSync(path.join(root, 'scripts', 'ci', 'research-quality.ts'), 'utf8')

    expect(rollup).toContain("from '../../lib/content-integrity.mjs'")
    expect(rollup).toContain('analyzeContentIntegrity(ROOT)')
    expect(rollup).toContain('writeContentIntegrityReport(contentIntegrity, ROOT)')
    expect(rollup).not.toContain('spawnSync')
    expect(rollup).not.toContain('audit-content-integrity.mjs')
  })

  it('keeps the evidence-grade status row aligned with topology-backed hard-gate policy', () => {
    const root = process.cwd()
    const rollup = fs.readFileSync(path.join(root, 'scripts', 'ci', 'research-quality.ts'), 'utf8')

    expect(rollup).toContain('evidenceGradeConsistency.topologyContradictions.length === 0')
    expect(rollup).toContain('topologyContradictions=${evidenceGradeConsistency.totals.topologyContradictionsIndexable}')
    expect(rollup).toContain('topologyWarnings=${evidenceGradeConsistency.totals.topologyWarningsIndexable}')
    expect(rollup).toContain('gate.summary.evidenceGradeContradictions')
    expect(rollup).toContain('topology-backed Grade A contradiction(s)')
  })
})
