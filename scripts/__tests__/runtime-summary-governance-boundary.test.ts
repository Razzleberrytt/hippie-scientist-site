import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('runtime summary governance boundary', () => {
  it('normalizes and governs runtime data before summaries are read', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts/data/build-runtime-summary-indexes.mjs'),
      'utf8',
    )

    const postprocess = source.indexOf("import('./postprocess-workbook-payloads.mjs')")
    const governance = source.indexOf("import('./apply-governance-overlay.mjs')")
    const holds = source.indexOf('const holdReport = await reconcileDeliberateGovernanceHolds')
    const readHerbs = source.indexOf("readJson(path.join(DATA_DIR, 'herbs.json'))")

    expect(postprocess).toBeGreaterThan(-1)
    expect(governance).toBeGreaterThan(postprocess)
    expect(holds).toBeGreaterThan(governance)
    expect(readHerbs).toBeGreaterThan(holds)
  })

  it('supports a derived-only refresh that preserves already-governed runtime state', () => {
    const summarySource = fs.readFileSync(
      path.join(process.cwd(), 'scripts/data/build-runtime-summary-indexes.mjs'),
      'utf8',
    )
    const enforcementSource = fs.readFileSync(
      path.join(process.cwd(), 'scripts/data/enforce-production-content-invariants.mjs'),
      'utf8',
    )

    expect(summarySource).toContain("process.argv.includes('--preserve-governed-state')")
    expect(summarySource).toContain('if (PRESERVE_GOVERNED_STATE)')
    expect(summarySource).toContain('skipping mutating pre-summary stages')
    expect(enforcementSource).toContain(
      'build-runtime-summary-indexes.mjs --data-dir=public/data --preserve-governed-state',
    )
  })

  it('keeps mutating governance and citation replay outside preserve-governed-state mode', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts/data/build-runtime-summary-indexes.mjs'),
      'utf8',
    )

    const preserveBranch = source.indexOf('if (PRESERVE_GOVERNED_STATE)')
    const mutatingBranch = source.indexOf('} else {', preserveBranch)
    const postprocess = source.indexOf("import('./postprocess-workbook-payloads.mjs')", mutatingBranch)
    const governance = source.indexOf("import('./apply-governance-overlay.mjs')", mutatingBranch)
    const citationExport = source.indexOf('exportCanonicalCitationsToRuntime', mutatingBranch)
    const readHerbs = source.indexOf("readJson(path.join(DATA_DIR, 'herbs.json'))")

    expect(preserveBranch).toBeGreaterThan(-1)
    expect(mutatingBranch).toBeGreaterThan(preserveBranch)
    expect(postprocess).toBeGreaterThan(mutatingBranch)
    expect(governance).toBeGreaterThan(postprocess)
    expect(citationExport).toBeGreaterThan(governance)
    expect(readHerbs).toBeGreaterThan(citationExport)
  })

  it('keeps the current AI entity artifact authority after governance replay', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts/data/build-runtime-summary-indexes.mjs'),
      'utf8',
    )

    expect(source).toContain("from './ai-entity-artifacts.mjs'")
    expect(source).not.toContain("from './ai-entity-enrichment-lib.mjs'")
  })
})
