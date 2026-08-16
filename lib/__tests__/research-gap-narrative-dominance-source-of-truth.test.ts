import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('research gap narrative dominance source of truth', () => {
  it('scores narrative dominance only from approved claim-edge topology', () => {
    const policy = readFileSync('lib/research-quality-policy.ts', 'utf8')

    expect(policy).not.toContain('narrativeReviewDominatedProfile')
    expect(policy).not.toContain("'narrative-review-dominated-profile'")
    expect(policy).not.toContain('profile.narrativeDominatedVsPrimaryHuman')
    expect(policy).toContain('topology.edgeWeightedNarrativeDominatedProfiles')
    expect(policy).toContain("'edge-weighted-narrative-dominance'")
  })
})
