import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('compound profile closing flow', () => {
  const compound = source('app/compounds/[slug]/page.tsx')

  it('keeps the sourcing and recommendation flow together before email capture', () => {
    const compare = compound.indexOf('<section id="compare"')
    const stack = compound.indexOf('<StackRecommendationSection')
    const affiliate = compound.indexOf('{affiliateCtaLink && !suppressAffiliate')
    const recommendation = compound.indexOf('<RecommendationSection')
    const email = compound.indexOf('<EmailCapture')

    expect(compare).toBeGreaterThan(-1)
    expect(stack).toBeGreaterThan(compare)
    expect(affiliate).toBeGreaterThan(stack)
    expect(recommendation).toBeGreaterThan(affiliate)
    expect(email).toBeGreaterThan(recommendation)
  })

  it('matches the trust-to-email ending used by the profile family', () => {
    const disclaimer = compound.indexOf('<Disclaimer')
    const author = compound.indexOf('<AuthorCredentials')
    const email = compound.indexOf('<EmailCapture')
    const backLink = compound.lastIndexOf('href="/compounds/"')

    expect(disclaimer).toBeGreaterThan(-1)
    expect(author).toBeGreaterThan(disclaimer)
    expect(email).toBeGreaterThan(author)
    expect(backLink).toBeGreaterThan(email)
    expect(compound.match(/<EmailCapture/g)).toHaveLength(1)
  })
})
