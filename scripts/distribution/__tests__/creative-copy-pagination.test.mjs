import { describe, expect, it } from 'vitest'
import { buildLosslessCreativeCopyPlan, paginateGovernedCopy } from '../creative-copy-pagination.mjs'

describe('lossless governed creative copy pagination', () => {
  const longFinding = 'Human trials report modest improvements in some stress measures, but formulations, populations, doses, follow-up periods, and outcome definitions vary across studies and limit broad generalization.'
  const longLimitation = 'The evidence base includes small trials with heterogeneous extracts and doses, variable risk of bias, and outcome differences that prevent treating the result as a universal effect or consumer dosing recommendation.'

  it('paginates long governed copy without truncation or rewriting', () => {
    const result = paginateGovernedCopy(longFinding, { maxChars: 72 })
    expect(result.totalPages).toBeGreaterThan(1)
    expect(result.pages.every((page) => page.content.length <= 72)).toBe(true)
    expect(result.pages.map((page) => page.content).join(' ')).toBe(result.original)
    expect(result.integrity).toMatchObject({ exactNormalizedMatch: true, truncation: false, rewrite: false })
    expect(result.pages.every((page) => page.rewriteAllowed === false && page.truncationAllowed === false)).toBe(true)
  })

  it('emits ordered continuation metadata for renderer consumption', () => {
    const plan = buildLosslessCreativeCopyPlan({ finding: longFinding, limitation: longLimitation }, { maxChars: 80 })
    expect(plan.finding.pages[0]).toMatchObject({ index: 1, continuation: false })
    expect(plan.finding.pages.at(-1)?.continues).toBe(false)
    expect(plan.finding.pages.slice(1).every((page) => page.continuation)).toBe(true)
    expect(plan.rendererContract).toMatchObject({
      renderEveryPageInOrder: true,
      mayDropContinuationPages: false,
      mayRewriteFactualCopy: false,
      mayTruncateFactualCopy: false,
      continuationIndicatorRequired: true,
    })
  })

  it('fails closed instead of splitting an oversized token or exceeding page capacity', () => {
    expect(() => paginateGovernedCopy(`safe ${'x'.repeat(81)}`, { maxChars: 80 })).toThrow(/cannot fit losslessly/)
    expect(() => paginateGovernedCopy('word '.repeat(100), { maxChars: 24, maxPages: 2 })).toThrow(/maximum lossless page count/)
  })

  it('normalizes whitespace only and preserves factual ordering exactly', () => {
    const result = paginateGovernedCopy('  one   two\nthree   four  ', { maxChars: 24 })
    expect(result.original).toBe('one two three four')
    expect(result.pages.map((page) => page.content).join(' ')).toBe('one two three four')
  })
})
