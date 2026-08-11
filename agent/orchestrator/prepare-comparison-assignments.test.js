import { describe, expect, it } from 'vitest'

import {
  parseComparisonAssignmentArgs,
  selectComparisonAssignments,
} from './prepare-comparison-assignments.js'

function packet(overrides = {}) {
  return {
    packetId: 'comparison:ashwagandha:rhodiola',
    proposedSlug: 'ashwagandha-vs-rhodiola',
    title: 'Ashwagandha vs Rhodiola',
    recommendedAction: 'build-next',
    demandTier: 'high-confidence',
    actionReason: 'Demand and evidence support production.',
    nextTask: 'Draft the comparison.',
    researchGaps: [],
    completionCriteria: ['Answer the decision question.'],
    aSlug: 'ashwagandha',
    bSlug: 'rhodiola',
    evidenceTier: 3,
    evidenceLabel: 'strong',
    chemistrySupported: true,
    priorityScore: 9,
    scientificPriorityScore: 8,
    editorialIntentScore: 7,
    observedBehaviorScore: 6,
    observedBehavior: { impressions: 30, clicks: 8 },
    ...overrides,
  }
}

describe('selectComparisonAssignments', () => {
  it('selects only executable actions and preserves review guardrails', () => {
    const assignments = selectComparisonAssignments([
      packet(),
      packet({ packetId: 'comparison:a:b', recommendedAction: 'keep-observing' }),
      packet({ packetId: 'comparison:c:d', recommendedAction: 'no-action' }),
    ])

    expect(assignments).toHaveLength(1)
    expect(assignments[0].action).toBe('build-next')
    expect(assignments[0].guardrails).toContain('Do not publish automatically.')
  })

  it('prioritizes build work before research and outline work', () => {
    const assignments = selectComparisonAssignments([
      packet({ packetId: 'comparison:outline:item', recommendedAction: 'validate-and-outline', priorityScore: 100 }),
      packet({ packetId: 'comparison:research:item', recommendedAction: 'research-first', priorityScore: 50 }),
      packet({ packetId: 'comparison:build:item', recommendedAction: 'build-next', priorityScore: 1 }),
    ])

    expect(assignments.map((assignment) => assignment.action)).toEqual([
      'build-next',
      'research-first',
      'validate-and-outline',
    ])
  })

  it('supports action, packet, and limit filters without promoting work', () => {
    const assignments = selectComparisonAssignments([
      packet({ packetId: 'comparison:first:item', recommendedAction: 'research-first', priorityScore: 2 }),
      packet({ packetId: 'comparison:second:item', recommendedAction: 'research-first', priorityScore: 5 }),
      packet({ packetId: 'comparison:third:item', recommendedAction: 'build-next', priorityScore: 10 }),
    ], {
      action: 'research-first',
      packetId: 'comparison:second:item',
      limit: 1,
    })

    expect(assignments).toHaveLength(1)
    expect(assignments[0].sourcePacketId).toBe('comparison:second:item')
    expect(assignments[0].action).toBe('research-first')
  })

  it('keeps assignment IDs stable when filters or queue ordering change', () => {
    const target = packet({ packetId: 'comparison:lemon-balm:passionflower', priorityScore: 5 })
    const first = selectComparisonAssignments([
      packet({ packetId: 'comparison:higher:item', priorityScore: 50 }),
      target,
    ])
    const filtered = selectComparisonAssignments([target], {
      packetId: 'comparison:lemon-balm:passionflower',
      limit: 1,
    })

    expect(first.find((assignment) => assignment.sourcePacketId === target.packetId)?.assignmentId)
      .toBe('comparison-assignment:lemon-balm:passionflower')
    expect(filtered[0].assignmentId).toBe('comparison-assignment:lemon-balm:passionflower')
  })
})

describe('parseComparisonAssignmentArgs', () => {
  it('clamps limits and resolves queue paths', () => {
    const parsed = parseComparisonAssignmentArgs([
      '--action=research-first',
      '--packet=comparison:a:b',
      '--limit=500',
      '--queue=tmp/queue.json',
    ], '/repo')

    expect(parsed).toEqual({
      action: 'research-first',
      packetId: 'comparison:a:b',
      limit: 50,
      queuePath: '/repo/tmp/queue.json',
    })
  })

  it('rejects non-executable action filters', () => {
    expect(() => parseComparisonAssignmentArgs(['--action=keep-observing'], '/repo'))
      .toThrow('Unsupported executable action')
  })
})
