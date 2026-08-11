import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SHARED_AFFILIATE_SURFACES = [
  'components/AffiliateProductBox.tsx',
  'components/AffiliateBlock.tsx',
  'components/RecommendationSection.tsx',
  'components/monetization/GoalTopAffiliatePicks.tsx',
  'components/monetization/ProductTrustAffiliate.tsx',
]

function source(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('shared affiliate surface copy', () => {
  it.each(SHARED_AFFILIATE_SURFACES)('%s avoids unsourced comparative ranking labels', (relativePath) => {
    const file = source(relativePath)

    expect(file).not.toMatch(/\bbest overall\b/i)
    expect(file).not.toMatch(/\bbest value\b/i)
    expect(file).not.toMatch(/why we recommend it/i)
  })

  it('routes AffiliateProductBox rationale through the shared display sanitizer', () => {
    const file = source('components/AffiliateProductBox.tsx')

    expect(file).toContain("import { affiliateRationaleForDisplay } from '../src/lib/affiliate-copy'")
    expect(file).toContain('affiliateRationaleForDisplay(displayTitle, product.rationale)')
    expect(file).not.toContain('{product.rationale}')
  })
})
