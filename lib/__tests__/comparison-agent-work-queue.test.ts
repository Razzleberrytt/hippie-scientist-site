import { describe, expect, it } from 'vitest'
import { buildComparisonAgentWorkPacket } from '@/lib/comparison-agent-work-queue'
import type { ComparisonShortlistRow } from '@/lib/comparison-shortlist'

function row(overrides: Partial<ComparisonShortlistRow> = {}): ComparisonShortlistRow {
  return {
    a: { slug: 'lemon-balm', name: 'Lemon Balm', effects: ['calming'], explicitEffects: ['calming'], compounds: [], compoundClasses: [], evidence: 'Moderate', intensity: 'Mild', safety: [] },
    b: { slug: 'passionflower', name: 'Passionflower', effects: ['calming'], explicitEffects: ['calming'], compounds: [], compoundClasses: [], evidence: 'Moderate', intensity: 'Mild', safety: [] },
    relationshipScore: 10,
    scientificPriorityScore: 16,
    editorialIntentScore: 5,
    observedBehaviorScore: 6,
    priorityScore: 27,
    chemistrySupported: true,
    sharedSpecificEffects: ['calming'],
    evidenceTier: 2,
    evidenceLabel: 'moderate',
    intentSignals: [],
    behaviorSignals: [],
    observedBehavior: { impressions: 28, clicks: 8, ctr: 8 / 28, deepExplorationRate: 0.625 },
    reasons: [],
    ...overrides,
  }
}

describe('comparison agent work queue', () => {
  it('turns a build-next candidate into a deterministic production packet', () => {
    const packet = buildComparisonAgentWorkPacket(row(), 'high-confidence', 'build-next')

    expect(packet.packetId).toBe('comparison:lemon-balm:passionflower')
    expect(packet.proposedSlug).toBe('lemon-balm-vs-passionflower')
    expect(packet.recommendedAction).toBe('build-next')
    expect(packet.nextTask).toContain('Draft the production comparison')
    expect(packet.completionCriteria.some((item) => item.includes('concrete user decision question'))).toBe(true)
  })

  it('routes weak-evidence demand into research work instead of page drafting', () => {
    const packet = buildComparisonAgentWorkPacket(row({ evidenceTier: 1, evidenceLabel: 'limited' }), 'high-confidence', 'research-first')

    expect(packet.recommendedAction).toBe('research-first')
    expect(packet.actionReason).toContain('evidence is only limited')
    expect(packet.researchGaps.some((gap) => gap.includes('at least moderate'))).toBe(true)
    expect(packet.nextTask).toContain('do not draft the production page')
  })

  it('turns emerging demand into a measurable observation task', () => {
    const packet = buildComparisonAgentWorkPacket(row({
      observedBehaviorScore: 1.2,
      observedBehavior: { impressions: 8, clicks: 1, ctr: 0.125, deepExplorationRate: 0 },
    }), 'emerging', 'keep-observing')

    expect(packet.researchGaps).toEqual(expect.arrayContaining([
      expect.stringContaining('12 more related-card impressions'),
      expect.stringContaining('4 more related-card clicks'),
    ]))
    expect(packet.completionCriteria.some((item) => item.includes('Do not create a production page'))).toBe(true)
  })

  it('flags missing chemistry and decision-axis context as explicit research gaps', () => {
    const packet = buildComparisonAgentWorkPacket(row({ chemistrySupported: false, sharedSpecificEffects: [] }), 'promising', 'validate-and-outline')

    expect(packet.researchGaps.some((gap) => gap.includes('chemistry or mechanism distinction'))).toBe(true)
    expect(packet.researchGaps.some((gap) => gap.includes('concrete user-facing decision axis'))).toBe(true)
  })
})
