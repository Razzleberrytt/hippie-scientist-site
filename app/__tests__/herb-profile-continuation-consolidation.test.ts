import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('herb profile continuation consolidation', () => {
  const herb = source('app/herbs/[slug]/page.tsx')
  const compound = source('app/compounds/[slug]/page.tsx')
  const seeAlso = source('components/SeeAlsoCluster.tsx')
  const discovery = source('components/ui/RelatedDiscoveryGroups.tsx')
  const experience = source('scripts/ci/validate-experience-backlog.mjs')

  it('routes herb next steps through one continuation container', () => {
    expect(herb).toContain('const continuationGroups = [')
    expect(herb).toContain("title: 'Related Herbs'")
    expect(herb).toContain("title: 'Related Guides'")
    expect(herb).toContain('...internalLinkGroups')
    expect(herb).toContain('continuationGroups={continuationGroups}')
    expect(herb).toContain('getProfileDecisionClaimedHrefs(profileDecision)')
    expect(herb).toContain('claimedHrefs={profileDecisionClaimedHrefs}')
    expect(herb).not.toContain('<RelatedDiscoveryGroups')
    expect(herb).not.toContain('Guides that use {displayName}')
  })

  it('preserves legacy goal and condition anchors inside the consolidated handoff', () => {
    expect(herb).toContain('id="related"')
    expect(herb).toContain('id="goals"')
    expect(herb).toContain('id="conditions"')
    expect(herb).toContain('Continue exploring {displayName}')
  })

  it('keeps comparison as a distinct job instead of repeating related herbs in sourcing', () => {
    expect(herb).toContain('Compare alternatives')
    expect(herb).toContain('{comparisonLinks.map(link => (')
    const compareStart = herb.indexOf('{comparisonLinks.length > 0 ? (')
    const compareEnd = herb.indexOf('</section>', compareStart)
    const compareBlock = herb.slice(compareStart, compareEnd)
    expect(compareBlock).not.toContain('relatedHerbLinks.map')
    expect(herb).not.toContain('Continue comparing')
  })

  it('dedupes additional groups against botanical, cluster, and earlier continuation hrefs', () => {
    expect(seeAlso).toContain('function normalizeContinuationHref')
    expect(seeAlso).toContain('function dedupeContinuationGroups')
    expect(seeAlso).toContain('botanicalHrefKeys')
    expect(seeAlso).toContain('claimedHrefs')
    expect(seeAlso).toContain('visibleContinuationGroups')
    expect(seeAlso).toContain('linksPerGroup={5}')
  })

  it('updates the THS-011 contract to recognize the shared continuation container', () => {
    expect(experience).toContain("const seeAlsoCluster = read('components/SeeAlsoCluster.tsx')")
    expect(experience).toContain("continuationGroups={continuationGroups}")
    expect(experience).toContain("includesAll(seeAlsoCluster, ['RelatedDiscoveryGroups', 'continuationGroups', 'dedupeContinuationGroups', 'claimedHrefs'])")
  })

  it('keeps both profile families on the shared continuation architecture and discovery defaults stable', () => {
    expect(compound).toContain('continuationGroups={continuationGroups}')
    expect(discovery).toContain('linksPerGroup = 4')
  })
})
