import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('evidence report unassigned status', () => {
  it('keeps unresolved single-grade evidence visible and distinct from insufficient evidence', () => {
    const root = process.cwd()
    const page = fs.readFileSync(path.join(root, 'app/evidence/evidence-report/page.tsx'), 'utf8')
    const panel = fs.readFileSync(path.join(root, 'app/evidence/evidence-report/UnassignedEvidenceStatusPanel.tsx'), 'utf8')

    expect(page).toContain("import UnassignedEvidenceStatusPanel from './UnassignedEvidenceStatusPanel'")
    expect(page).toContain('<UnassignedEvidenceStatusPanel dataset={dataset} />')
    expect(panel).toContain('no single evidence grade is being claimed')
    expect(panel).toContain('kept separate from both stronger grades and Avoid/Insufficient')
    expect(panel).toContain('metrics.unassignedIngredients')
    expect(panel).toContain('category.unassigned')
  })
})
