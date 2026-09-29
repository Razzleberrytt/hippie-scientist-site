import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('compound profile continuation consolidation', () => {
  const compound = source('app/compounds/[slug]/page.tsx')
  const herb = source('app/herbs/[slug]/page.tsx')
  const experience = source('scripts/ci/validate-experience-backlog.mjs')

  it('routes compound next steps through the shared continuation container', () => {
    expect(compound).toContain('const continuationGroups = [')
    expect(compound).toContain("title: 'Related Profiles'")
    expect(compound).toContain("title: 'Related Herbs'")
    expect(compound).toContain("title: 'Related Guides'")
    expect(compound).toContain('...internalLinkGroups')
    expect(compound).toContain('continuationGroups={continuationGroups}')
    expect(compound).not.toContain('<RelatedDiscoveryGroups')
    expect(compound).not.toContain('Guides that use {displayName}')
  })

  it('preserves source-herb context and legacy goal/condition anchors', () => {
    const sources = compound.indexOf('<CompoundSourceHerbs')
    const related = compound.indexOf('<section id="related"')
    expect(sources).toBeGreaterThan(-1)
    expect(related).toBeGreaterThan(sources)
    expect(compound).toContain('id="goals"')
    expect(compound).toContain('id="conditions"')
    expect(compound).toContain('Continue exploring {displayName}')
  })

  it('keeps Compare & Sourcing focused on true tradeoffs and sourcing', () => {
    const compareStart = compound.indexOf('<section id="compare"')
    const stackStart = compound.indexOf('<StackRecommendationSection', compareStart)
    const compareBlock = compound.slice(compareStart, stackStart)

    expect(compareStart).toBeGreaterThan(-1)
    expect(stackStart).toBeGreaterThan(compareStart)
    expect(compareBlock).toContain('{comparisonRecords.length > 0 ? (')
    expect(compareBlock).toContain('Tradeoffs')
    expect(compareBlock).toContain('<SourcingCta')
    expect(compareBlock).not.toContain('semanticRelated.slice')
    expect(compareBlock).not.toContain('conditionHerbEntries')
    expect(compareBlock).not.toContain('Related alternatives')
    expect(compareBlock).not.toContain('Herbs for similar conditions')
  })

  it('keeps sparse compounds useful through generated continuation groups', () => {
    expect(compound).toContain('...internalLinkGroups')
    expect(compound).toContain('continuationGroups={continuationGroups}')
    expect(compound).toContain('conditionHerbEntries.length > 0')
    expect(compound).toContain('semanticRelated.length > 0')
  })

  it('preserves risk-based commercial suppression and the existing closing order', () => {
    expect(compound).toContain('{!suppressAffiliate && <SourcingCta')
    expect(compound).toContain('{affiliateCtaLink && !suppressAffiliate')
    expect(compound).toContain('{suppressAffiliate ? (')
    expect(compound.indexOf('<EmailCapture')).toBeGreaterThan(compound.indexOf('<RecommendationSection'))
  })

  it('governs both profile families through the same shared continuation contract', () => {
    expect(herb).toContain('continuationGroups={continuationGroups}')
    expect(experience).toContain(
      "includesAll(compoundProfile, ['getRouteInternalLinkGroups', 'getBatchedRuntimeRecords', 'continuationGroups={continuationGroups}'])",
    )
  })
})
