import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('research gap partial publication reuse semantics', () => {
  it('keeps pseudo-multi-study bonuses out of partial reuse scoring', () => {
    const policy = readFileSync('lib/research-quality-policy.ts', 'utf8')
    const topologySignals = readFileSync('lib/research-quality-policy-topology-signals.ts', 'utf8')

    expect(policy).not.toContain('highConfidenceUnderlyingStudyPublicationReuseBonus')
    expect(topologySignals).not.toContain('highConfidenceUnderlyingStudyPublicationReuseBonus')
    expect(topologySignals).not.toContain('high-confidence pseudo-multi-study')
    expect(topologySignals).toContain('retain multiple underlying studies but lose apparent publication-level independence')
  })
})
