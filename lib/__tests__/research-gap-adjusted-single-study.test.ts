import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('research gap adjusted single-study scoring', () => {
  it('uses pseudo-multi-study topology alongside publication-level single-study support', () => {
    const policy = readFileSync('lib/research-quality-policy.ts', 'utf8')

    expect(policy).toContain('topology.underlyingStudyIndependence.pseudoMultiStudyClaims')
    expect(policy).toContain('if (claim.singleStudy || pseudoMultiStudy)')
    expect(policy).toContain('publications collapse to ${pseudoMultiStudy.underlyingStudyCount} underlying study')
    expect(policy).toContain('addApprovedClaimReasons(analysis, topology, add)')
  })
})
