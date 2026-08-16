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
      for (const call of FORBIDDEN_ASSEMBLY_CALLS) {
        if (!source.includes(call)) continue
        violations.push(`${path.relative(root, file)} -> ${call}`)
      }
    }

    expect(
      violations,
      `CI/report scripts must consume buildResearchQualitySnapshot() instead of reconstructing canonical research state:\n${violations.join('\n')}`,
    ).toEqual([])
  })
})
