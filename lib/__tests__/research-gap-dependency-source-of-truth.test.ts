import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('research gap dependency source of truth', () => {
  it('scores high-study dependency only from all over-dependent underlying-study profiles', () => {
    const policy = readFileSync('lib/research-quality-policy.ts', 'utf8')
    const topologySignals = readFileSync('lib/research-quality-policy-topology-signals.ts', 'utf8')

    expect(policy).not.toContain('profile.overDependentOnSingleStudy')
    expect(policy).not.toContain('profile.dominantStudySupportedClaimShare')
    expect(topologySignals).toContain('topology.underlyingStudyIndependence.profiles')
    expect(topologySignals).toContain('if (!profile.overDependentOnSingleUnderlyingStudy) continue')
    expect(topologySignals).not.toContain('topology.underlyingStudyIndependence.newlyOverDependentProfiles)')
    expect(topologySignals).toContain("kind: 'high-study-dependency'")
  })
})
