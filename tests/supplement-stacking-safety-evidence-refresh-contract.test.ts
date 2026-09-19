import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const page = fs.readFileSync(
  path.join(process.cwd(), 'app', 'guides', 'other', 'supplement-stacking-safety', 'page.tsx'),
  'utf8',
)

describe('supplement stacking safety 2026 evidence refresh', () => {
  it('records the current review provenance and 11-source ledger', () => {
    expect(page).toContain('Safety Review · 11 References · Reviewed September 19, 2026')
    expect((page.match(/\{ n: \d+, text:/g) ?? []).length).toBe(11)
    expect(page).toContain('citationUrls={STACKING_SAFETY_REFS.map((ref) => ref.url)}')
  })

  it('adds current interaction anchors without deleting historical context', () => {
    for (const pmid of ['38504455', '39288907', '38926083', '42394195']) {
      expect(page).toContain(pmid)
    }

    expect(page).toContain('19719333')
    expect(page).toContain('15784664')
    expect(page).toContain('Historical clinical review retained for context.')
  })

  it('keeps mechanistic CYP evidence separate from proven clinical interactions', () => {
    expect(page).toContain('clinical interaction data remain scarce for many herbs')
    expect(page).toContain('CYP activity a screening signal')
    expect(page).toContain('In-vitro CYP inhibition or induction should not be presented as a proven human interaction')
    expect(page).toContain('mechanism alone does not prove the magnitude of a specific pairwise interaction')
  })

  it('calibrates anticoagulant evidence instead of generalizing bleeding risk', () => {
    expect(page).toContain('randomized evidence is sparse')
    expect(page).toContain('limited by small samples, conflicting results, and heterogeneous herbal products')
    expect(page).toContain('rather than a blanket claim that every “blood-thinning” herb predictably increases bleeding')
  })

  it('updates serotonin-toxicity context without inventing pairwise risk', () => {
    expect(page).toContain('A modern serotonin-toxicity review confirms that drug interactions can precipitate toxicity')
    expect(page).toContain('does not establish a quantified risk for every unstudied supplement pair')
  })

  it('preserves the no-recipe and professional-review safety boundary', () => {
    expect(page).toContain('No combination gets a blanket “safe” label here.')
    expect(page).toContain('No interaction listed ≠ interaction ruled out.')
    expect(page).toContain('A fixed waiting period ≠ clearance.')
    expect(page).toContain('use a complete ingredient list for professional interaction review')
    expect(page).not.toMatch(/take .*mg .*with .*mg/i)
    expect(page).not.toMatch(/safe stack/i)
  })
})
