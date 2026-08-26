import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('source intake safety retry policy', () => {
  it('keeps non-randomized human studies restricted to the broadest safety retry tier', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'scripts', 'report-source-intake-queue.ts'), 'utf8')
    const safetyBlock = source.match(/safety:\s*\{\s*pass2:\s*\[([^\]]*)\],\s*pass3:\s*\[([^\]]*)\]/s)

    expect(safetyBlock, 'safety retry policy block should remain explicit and testable').not.toBeNull()

    const pass2 = safetyBlock?.[1] || ''
    const pass3 = safetyBlock?.[2] || ''

    expect(pass2).toContain("'regulatory-agency-monograph-guidance'")
    expect(pass2).toContain("'systematic-review-meta-analysis'")
    expect(pass2).not.toContain("'non-randomized-human-study'")

    expect(pass3).toContain("'reference-database-authority'")
    expect(pass3).toContain("'observational-human-evidence'")
    expect(pass3).toContain("'non-randomized-human-study'")
    expect(pass3).not.toContain("'preclinical-mechanistic-study'")
    expect(pass3).not.toContain("'traditional-use-monograph'")
  })
})
