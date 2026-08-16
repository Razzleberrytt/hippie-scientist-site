import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('research gap single-study profile aggregation', () => {
  it('preserves per-claim weight math while emitting one profile-level reason', () => {
    const policy = readFileSync('lib/research-quality-policy.ts', 'utf8')

    expect(policy).toContain('const singleStudyByProfile = new Map')
    expect(policy).toContain('group.weight += RESEARCH_GAP_WEIGHTS.singleStudyApprovedClaim + high + veryHigh')
    expect(policy).toContain('for (const [url, group] of singleStudyByProfile)')
    expect(policy).toContain("'single-study-approved-claim',\n      group.weight")
    expect(policy).toContain('approved claim(s) effectively depend on one study')
  })
})
