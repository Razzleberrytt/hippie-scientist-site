import { describe, expect, it } from 'vitest'

import { citationReadySentenceCount, toCitationReadySummary } from '@/src/lib/citation-ready-summary'

describe('toCitationReadySummary', () => {
  it('preserves summaries already within the 2-4 sentence window', () => {
    const answer = 'The evidence is moderate for this outcome. Trials are short and formulation-specific.'
    expect(toCitationReadySummary(answer)).toBe(answer)
    expect(citationReadySentenceCount(answer)).toBe(2)
  })

  it('adds neutral context to a one-sentence answer without inventing evidence', () => {
    const answer = 'Human evidence is limited.'
    const summary = toCitationReadySummary(answer)

    expect(citationReadySentenceCount(summary)).toBe(2)
    expect(summary).toContain('evidence limitations and safety context')
  })

  it('folds long answers into four sentences without dropping later caveats', () => {
    const answer = 'One. Two. Three. Four. Five includes a safety caveat. Six includes a population caveat.'
    const summary = toCitationReadySummary(answer)

    expect(citationReadySentenceCount(summary)).toBe(4)
    expect(summary).toContain('Five includes a safety caveat')
    expect(summary).toContain('Six includes a population caveat')
  })
})
