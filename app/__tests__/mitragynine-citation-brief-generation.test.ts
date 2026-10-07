import { describe, expect, it } from 'vitest'
import { allArticleMonographs } from '../../.content-collections/generated'

describe('mitragynine citation research brief generation', () => {
  it('preserves authored citation metadata through the article collection', () => {
    const page = allArticleMonographs.find((article) => article.slug === 'mitragynine')

    expect(page).toBeDefined()
    expect(page?.factualUpdated).toBe('2026-10-04')
    expect(page?.keyTakeaways).toHaveLength(5)
    expect(page?.citationQuestions).toHaveLength(10)
    expect(page?.canonicalConcepts).toContain('mitragynine')
    expect(page?.canonicalConcepts).toContain('opioid pharmacology')
  })
})
