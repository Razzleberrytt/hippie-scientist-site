import { describe, expect, it } from 'vitest'
import { buildCitationReadySummary } from '../article-citation-metadata'

describe('citation-ready caveat preservation', () => {
  it('keeps an authored caveat even when it appears after the first four authored sentences', () => {
    const summary = buildCitationReadySummary({
      description: 'Sentence one states the conclusion. Sentence two adds context. Sentence three adds dose context. Sentence four adds duration context.',
      keyTakeaways: [
        'The evidence is limited by small studies and a specific population.',
      ],
      sourceCount: 8,
      evidenceGrade: 'B',
    })

    expect(summary).toContain('The evidence is limited by small studies and a specific population.')
    expect(summary).not.toContain('Sentence four adds duration context.')
  })

  it('does not invent a caveat when authored metadata does not contain one', () => {
    const summary = buildCitationReadySummary({
      description: 'Sentence one states the conclusion. Sentence two adds context.',
      keyTakeaways: ['Sentence three adds formulation context.'],
    })

    expect(summary).toBe('Sentence one states the conclusion. Sentence two adds context. Sentence three adds formulation context.')
  })
})
