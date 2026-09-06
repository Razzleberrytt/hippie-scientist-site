import { describe, expect, it } from 'vitest'

import { rollupSourceEligibilityError } from './enrichment-session-source-policy.mjs'

function submission(reviewStatus, sourceId = 'src_example', extra = {}) {
  return { reviewStatus, sourceId, ...extra }
}

function heldSource(editorialAdjudication) {
  return new Map([['src_example', { sourceId: 'src_example', active: true, editorialAdjudication }]])
}

describe('parallel enrichment rollup source eligibility', () => {
  it('allows draft research while registry intake is pending', () => {
    expect(rollupSourceEligibilityError(submission('draft_submission'), new Map())).toBeNull()
  })

  it('blocks rollup approval when the source is missing from the registry', () => {
    expect(rollupSourceEligibilityError(submission('approved_for_rollup'), new Map())).toBe(
      'sourceId src_example is missing from source registry',
    )
  })

  it('blocks rollup approval when the registered source is inactive', () => {
    const sourceById = new Map([['src_example', { sourceId: 'src_example', active: false }]])
    expect(rollupSourceEligibilityError(submission('approved_for_rollup'), sourceById)).toBe(
      'sourceId src_example is not active in source registry',
    )
  })

  it('allows rollup approval when the source is registered and active', () => {
    const sourceById = new Map([['src_example', { sourceId: 'src_example', active: true }]])
    expect(rollupSourceEligibilityError(submission('approved_for_rollup'), sourceById)).toBeNull()
  })
})

describe('editorial adjudication holds', () => {
  const scoped = { reason: 'YMYL survival claim', topicTypes: ['supported_use'], claimTypes: ['efficacy_signal'] }

  it('blocks a submission whose topicType is held', () => {
    const held = submission('approved_for_rollup', 'src_example', { topicType: 'supported_use', claimType: 'other' })
    expect(rollupSourceEligibilityError(held, heldSource(scoped))).toMatch(
      /holds supported_use\/other for human editorial adjudication: YMYL survival claim/,
    )
  })

  it('blocks a submission whose claimType is held even when its topicType is not', () => {
    const held = submission('approved_for_rollup', 'src_example', { topicType: 'conflict_note', claimType: 'efficacy_signal' })
    expect(rollupSourceEligibilityError(held, heldSource(scoped))).toMatch(/human editorial adjudication/)
  })

  it('lets hedged claims on a scoped-hold source through', () => {
    const hedged = submission('approved_for_rollup', 'src_example', { topicType: 'research_gap', claimType: 'research_gap' })
    expect(rollupSourceEligibilityError(hedged, heldSource(scoped))).toBeNull()
  })

  it('blocks every claim when the hold names no scope', () => {
    const any = submission('approved_for_rollup', 'src_example', { topicType: 'research_gap', claimType: 'research_gap' })
    expect(rollupSourceEligibilityError(any, heldSource({ reason: 'whole source is contested' }))).toMatch(
      /human editorial adjudication/,
    )
  })

  it('clears only when a human recorded both clearedBy and clearedAt', () => {
    const held = submission('approved_for_rollup', 'src_example', { topicType: 'supported_use', claimType: 'efficacy_signal' })
    const halfCleared = { ...scoped, clearedBy: 'editor' }
    expect(rollupSourceEligibilityError(held, heldSource(halfCleared))).toMatch(/human editorial adjudication/)

    const cleared = { ...scoped, clearedBy: 'editor', clearedAt: '2026-09-06T18:00:00.000Z' }
    expect(rollupSourceEligibilityError(held, heldSource(cleared))).toBeNull()
  })

  it('does not gate submissions that are not up for rollup', () => {
    const draft = submission('draft_submission', 'src_example', { topicType: 'supported_use', claimType: 'efficacy_signal' })
    expect(rollupSourceEligibilityError(draft, heldSource(scoped))).toBeNull()
  })
})
