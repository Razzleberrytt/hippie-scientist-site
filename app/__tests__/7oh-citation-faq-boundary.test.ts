import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
const faq = read('content/articles/7-hydroxymitragynine-faq.mdx')
const main = read('content/articles/7-hydroxymitragynine.mdx')

describe('7-OH citation FAQ companion guard', () => {
  it('preserves independent FAQ and monograph identities', () => {
    expect(faq).toContain('slug: "7-hydroxymitragynine-faq"')
    expect(main).toContain('slug: "7-hydroxymitragynine"')
    expect(faq).toContain('](/articles/7-hydroxymitragynine/)')
  })
  it('exposes 45 unique question H2s and matching frontmatter questions', () => {
    const headings = [...faq.matchAll(/^## (.+\\?)$/gm)].map(m => m[1])
    expect(headings).toHaveLength(45)
    expect(new Set(headings).size).toBe(45)
    const block = faq.split('citationQuestions:')[1]?.split('canonicalConcepts:')[0] ?? ''
    expect([...block.matchAll(/^  - "/gm)]).toHaveLength(45)
  })
  it('does not represent proposals as operative exemptions', () => {
    expect(faq).toContain('proposed rules have not yet taken effect')
    expect(faq).toContain('August 26')
  })
})
