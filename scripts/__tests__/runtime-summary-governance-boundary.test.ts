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
    const holds = source.indexOf('reconcileDeliberateGovernanceHolds')
    const readHerbs = source.indexOf("readJson(path.join(DATA_DIR, 'herbs.json'))")

    expect(postprocess).toBeGreaterThan(-1)
    expect(governance).toBeGreaterThan(postprocess)
    expect(holds).toBeGreaterThan(governance)
    expect(readHerbs).toBeGreaterThan(holds)
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
