import { describe, expect, it } from 'vitest'

import { mergeSummaryWithDetail } from '../ai-entity-artifacts.mjs'

describe('AI entity canonical detail precedence', () => {
  it('preserves reviewed detail summary/description over stale list values', () => {
    const summary = {
      slug: 'bpc-157',
      summary: 'stale list summary',
      description: 'stale list description',
      evidence_grade: 'D',
    }
    const detail = {
      slug: 'bpc-157',
      summary: 'reviewed detail summary',
      description: 'reviewed detail description',
      evidence_grade: 'C',
    }

    expect(mergeSummaryWithDetail(summary, detail)).toEqual({
      slug: 'bpc-157',
      summary: 'reviewed detail summary',
      description: 'reviewed detail description',
      evidence_grade: 'D',
    })
  })

  it('falls back to list text when detail text is missing', () => {
    expect(mergeSummaryWithDetail(
      { summary: 'list summary', description: 'list description' },
      { summary: '', description: null },
    )).toEqual({ summary: 'list summary', description: 'list description' })
  })

  it('falls back to substantive list text when detail text is a placeholder or pipeline note', () => {
    expect(mergeSummaryWithDetail(
      { summary: 'Reviewed list summary with substantive evidence context.', description: 'Reviewed list description.' },
      { summary: 'No summary available yet.', description: 'Bulk-ingested support row awaiting editorial review.' },
    )).toEqual({
      summary: 'Reviewed list summary with substantive evidence context.',
      description: 'Reviewed list description.',
    })
  })
})
