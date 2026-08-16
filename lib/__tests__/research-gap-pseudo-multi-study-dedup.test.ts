import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('research gap pseudo-multi-study scoring', () => {
  it('routes pseudo-multi-study support through single-study scoring rather than publication-reuse scoring', () => {
    const policy = readFileSync('lib/research-quality-policy.ts', 'utf8')

    expect(policy).toContain('topology.underlyingStudyIndependence.pseudoMultiStudyClaims')
    expect(policy).toContain('if (claim.singleStudy || pseudoMultiStudy)')
    expect(policy).toContain('reducedClaims: topology.underlyingStudyIndependence.reducedClaims.filter')
    expect(policy).toContain('(claim) => !claim.pseudoMultiStudySupport')
    expect(policy).toContain('buildAggregatedTopologyGapSignals(concentrationScoringTopology, aggregatedWeights)')
  })
})
