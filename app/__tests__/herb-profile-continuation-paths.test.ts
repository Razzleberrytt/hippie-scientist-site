import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('herb profile continuation-path consolidation', () => {
  const herb = source('app/herbs/[slug]/page.tsx')
  const compound = source('app/compounds/[slug]/page.tsx')

  it('uses the tracked see-also cluster as the herb related-profile handoff', () => {
    expect(herb).toContain('<SeeAlsoCluster slug={normalizedSlug} kind="herb" limit={6} />')
    expect(herb).not.toContain('<RelatedDiscoveryGroups')
    expect(compound).toContain('<RelatedDiscoveryGroups')
  })

  it('preserves unique guide, article, or research reading in the existing context section', () => {
    expect(herb).toContain('function getRelatedReadingLinks')
    expect(herb).toContain('/article|research/i.test(group.title)')
    expect(herb).toContain('/guide/i.test(group.title)')
    expect(herb).toContain('.slice(0, 6)')
    expect(herb).toContain('Guides &amp; research context for {displayName}')
    expect(herb).toContain('Related reading')
    expect(herb).toContain('relatedReadingLinks.map')
  })

  it('keeps related herbs out of the compare-and-sourcing continuation list', () => {
    const compareStart = herb.indexOf('<section id="compare"')
    const compareEnd = herb.indexOf('<Disclaimer', compareStart)
    const compare = herb.slice(compareStart, compareEnd)

    expect(compareStart).toBeGreaterThan(-1)
    expect(compare).toContain('{comparisonLinks.length > 0 ? (')
    expect(compare).toContain('{comparisonLinks.map(link => (')
    expect(compare).not.toContain('relatedHerbLinks.map')
  })

  it('keeps safety-based commercial suppression unchanged', () => {
    expect(herb).toContain('shouldSuppressAffiliate(herb)')
    expect(herb).toContain('Sourcing options disabled for safety')
    expect(herb).toContain('{!suppressAffiliate && <SourcingCta')
  })

  it('keeps phone-friendly wrapping primitives on the remaining guide paths', () => {
    expect(herb).toContain('className="hs-chips mt-2"')
    expect(herb).toContain('className="hs-linklist mt-2"')
  })
})
