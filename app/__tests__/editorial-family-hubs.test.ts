import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('editorial family information architecture', () => {
  it('gives Guides, Learn, and Articles the shared local navigation', () => {
    expect(read('app/guides/page.tsx')).toContain("EditorialFamilyNav active='guides'")
    expect(read('app/learn/page.tsx')).toContain("EditorialFamilyNav active='learn'")
    expect(read('app/articles/page.tsx')).toContain("EditorialFamilyNav active='articles'")
  })

  it('keeps the Learn hub concept-first instead of rendering multiple competing mega-sections', () => {
    const learn = read('app/learn/page.tsx')
    expect(learn).toContain('Choose a learning track')
    expect(learn).toContain('Complete learning index')
    expect(learn).toContain('<details')
    expect(learn).not.toContain('EducationSupernodeGrid')
    expect(learn).not.toContain("import Image from 'next/image'")
    expect(learn).not.toContain("import References")
  })

  it('keeps Guides focused on decisions and topics', () => {
    const guides = read('app/guides/page.tsx')
    expect(guides).toContain('Browse by health topic')
    expect(guides).toContain('Make a supplement or substance decision')
    expect(guides).not.toContain('AtlasComparisonCallout')
    expect(guides).not.toContain('Featured guides')
  })

  it('turns Articles into a curated latest view plus a categorized archive', () => {
    const articles = read('app/articles/page.tsx')
    expect(articles).toContain('latestArticles')
    expect(articles).toContain('articleGroups')
    expect(articles).toContain('Browse by category')
    expect(articles).toContain('<details')
  })
})
