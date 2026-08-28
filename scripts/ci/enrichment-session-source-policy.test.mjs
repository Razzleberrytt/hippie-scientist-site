import { describe, expect, it } from 'vitest'

import { rollupSourceEligibilityError } from './enrichment-session-source-policy.mjs'

function submission(reviewStatus, sourceId = 'src_example') {
  return { reviewStatus, sourceId }
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
