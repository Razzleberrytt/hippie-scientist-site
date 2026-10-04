import { describe, expect, it } from 'vitest'
import { allBlogPosts } from '../../.content-collections/generated'

describe('2C-B citation research brief generation', () => {
  it('preserves authored citation metadata through the blog content collection', () => {
    const page = allBlogPosts.find((post) => post.slug === '2c-b-effects')

    expect(page).toBeDefined()
    expect(page?.factualUpdated).toBe('2026-10-04')
    expect(page?.keyTakeaways).toHaveLength(5)
    expect(page?.citationQuestions).toHaveLength(10)
    expect(page?.canonicalConcepts).toContain('2C-B')
    expect(page?.canonicalConcepts).toContain('harm reduction')
  })
})
