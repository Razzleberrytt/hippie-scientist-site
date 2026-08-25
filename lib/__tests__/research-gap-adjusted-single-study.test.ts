import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('research gap adjusted single-study scoring', () => {
  it('uses pseudo-multi-study topology alongside publication-level single-study support', () => {
    const policy = readFileSync('lib/research-quality-policy.ts', 'utf8')
    const topologySignals = readFileSync('lib/research-quality-policy-topology-signals.ts', 'utf8')

    expect(policy).toContain('topology.underlyingStudyIndependence.pseudoMultiStudyClaims')
    expect(policy).toContain('if (claim.singleStudy || pseudoMultiStudy)')
    expect(policy).toContain('addApprovedClaimReasons(analysis, topology, add)')

    // Publication-lineage collapse detail moved into the topology-signal helper;
    // keep the regression anchored to the semantic invariant rather than its old file location.
    expect(topologySignals).toContain('after explicit publication-lineage collapse')
    expect(topologySignals).toContain('publications resolve to ${profile.underlyingStudyCount} underlying studies')
  })
})