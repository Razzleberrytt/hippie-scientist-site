import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('compound profile continuation consolidation', () => {
  const compound = source('app/compounds/[slug]/page.tsx')
  const herb = source('app/herbs/[slug]/page.tsx')
  const seeAlso = source('components/SeeAlsoCluster.tsx')
  const experience = source('scripts/ci/validate-experience-backlog.mjs')

  it('routes related compound next steps through one continuation handoff', () => {
    expect(compound).toContain('const continuationGroups = [')
    expect(compound).toContain("title: 'Related Profiles'")
    expect(compound).toContain("title: 'Related Guides'")
    expect(compound).toContain("title: 'Related Herbs'")
    expect(compound).toContain('...internalLinkGroups')
    expect(compound).toContain('continuationGroups={continuationGroups}')
    expect(compound).toContain('getProfileDecisionClaimedHrefs(profileDecision)')
    expect(compound).toContain('claimedHrefs={profileDecisionClaimedHrefs}')
    expect(compound).not.toContain('<RelatedDiscoveryGroups')
    expect(compound).not.toContain('Guides that use {displayName}')
  })

  it('does not render an empty continuation shell for profiles with no paths', () => {
    expect(compound).toContain('const hasContinuationPaths =')
    expect(compound).toContain('clusterSeeAlso.length > 0')
    expect(compound).toContain('continuationGroups.some((group) => group.links.length > 0)')
    expect(compound).toContain('{hasContinuationPaths ? (')
  })

  it('preserves source herbs as a distinct origin/context job', () => {
    expect(compound).toContain('<CompoundSourceHerbs')
    expect(compound).toContain("{ id: 'compounds', label: 'Source herbs' }")
  })

  it('preserves legacy guide anchors only when their underlying context exists', () => {
    expect(compound).toContain("id={goalLinks.length > 0 || conditionLinks.length > 0 ? 'goals' : undefined}")
    expect(compound).toContain("id={conditionLinks.length > 0 ? 'conditions' : undefined}")
  })

  it('keeps Compare & Sourcing focused on true tradeoffs rather than generic related links', () => {
    const compareStart = compound.indexOf('<section id="compare"')
    const compareEnd = compound.indexOf('<StackRecommendationSection', compareStart)
    const compareBlock = compound.slice(compareStart, compareEnd)

    expect(compareStart).toBeGreaterThan(-1)
    expect(compareEnd).toBeGreaterThan(compareStart)
    expect(compareBlock).toContain('{comparisonRecords.length > 0 && (')
    expect(compareBlock).toContain('comparisonRecords')
    expect(compareBlock).not.toContain('semanticRelated')
    expect(compareBlock).not.toContain('conditionHerbEntries')
    expect(compareBlock).not.toContain('Related alternatives')
    expect(compareBlock).not.toContain('Herbs for similar conditions')
  })

  it('keeps risk-based sourcing suppression and the closing flow intact', () => {
    expect(compound).toContain('!suppressAffiliate && <SourcingCta')
    expect(compound).toContain('{suppressAffiliate ? (')
    expect(compound).toContain('Direct product recommendations and affiliate links are suppressed')
    expect(compound.indexOf('<EmailCapture')).toBeGreaterThan(compound.indexOf('<AuthorCredentials'))
  })

  it('uses the merged shared dedupe owner without changing herb composition', () => {
    expect(seeAlso).toContain('dedupeContinuationGroups')
    expect(seeAlso).toContain('visibleContinuationGroups')
    expect(herb).toContain('continuationGroups={continuationGroups}')
  })

  it('keeps the experience contract runtime-backed for both profile families', () => {
    expect(experience).toContain("includesAll(compoundProfile, ['getRouteInternalLinkGroups', 'getBatchedRuntimeRecords', 'continuationGroups={continuationGroups}'])")
    expect(experience).toContain("includesAll(herbProfile, ['getRouteInternalLinkGroups', 'getBatchedRuntimeRecords', 'continuationGroups={continuationGroups}'])")
  })
})
