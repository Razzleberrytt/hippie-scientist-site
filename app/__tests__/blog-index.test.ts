import { describe, expect, it } from 'vitest'
import { BLOG_STYLE_GROUPS, inferArticleStyle } from '../../lib/blog-index'
import { isSafeInternalHref } from '../../lib/display-utils'

describe('blog index model', () => {
  it('links research style browse cards to distinct category pages', () => {
    const hrefs = BLOG_STYLE_GROUPS.map((group) => group.href)

    expect(hrefs).toEqual([
      '/articles/style/research-digests',
      '/articles/style/pharmacology-basics',
      '/articles/style/safety-set-setting',
      '/articles/style/traditional-use',
      '/articles/style/nootropics',
      '/articles/style/extraction-preparation',
    ])
    expect(hrefs).not.toContain('/articles')
  })

  it('treats hyphenated static article paths as safe internal hrefs', () => {
    expect(isSafeInternalHref('/articles/style/research-digests')).toBe(true)
  })

  it('infers article styles from typed post content', () => {
    expect(
      inferArticleStyle({
        slug: 'x',
        title: 'Extraction 101 - Skullcap',
        excerpt: 'A practical primer.',
        date: '2026-03-21',
        readingTime: '1 min read',
        content: 'Preparation choices and solvent notes.',
      }),
    ).toBe('Preparation guide')
  })
})
