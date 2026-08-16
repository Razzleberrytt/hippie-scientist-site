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
  {
    call: 'analyzeEvidenceGradeConsistency(',
    allowedFiles: new Set(['scripts/ci/validate-evidence-grade-consistency.ts']),
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

describe('research-quality CI boundary', () => {
  it('keeps scripts/ci consumers on the canonical research-quality snapshot', () => {
    const root = process.cwd()
    const ciDir = path.join(root, 'scripts', 'ci')
    const violations: string[] = []

    for (const file of listCodeFiles(ciDir)) {
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
      `CI/report scripts must consume buildResearchQualitySnapshot() instead of reconstructing canonical research state; direct specialized analyzers are reserved for their lightweight standalone validators:\n${violations.join('\n')}`,
    ).toEqual([])
  })
})
