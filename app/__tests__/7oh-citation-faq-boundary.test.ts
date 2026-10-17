import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const load = (name: string) => fs.readFileSync(path.join(process.cwd(), name), 'utf8')
const faq = load('content/articles/7-hydroxymitragynine-faq.mdx')
const monograph = load('content/articles/7-hydroxymitragynine.mdx')

describe('7-OH FAQ companion publication boundaries', () => {
  it('preserves a distinct slug and links back to the canonical monograph', () => {
    expect(faq).toContain('slug: "7-hydroxymitragynine-faq"')
    expect(monograph).toContain('slug: "7-hydroxymitragynine"')
    expect(faq).toContain('](/articles/7-hydroxymitragynine/)')
  })

  it('contains 45 unique question H2 headings and 45 citationQuestions', () => {
    const headings = [...faq.matchAll(/^## (.+\?)$/gm)].map((m) => m[1])
    expect(headings).toHaveLength(45)
    expect(new Set(headings).size).toBe(45)
    const metadata = faq.split('---')[1].split('citationQuestions:')[1].split('canonicalConcepts:')[0]
    expect([...metadata.matchAll(/^  - "/gm)]).toHaveLength(45)
  })

  it('distinguishes future proposed thresholds from currently operative controls', () => {
    expect(faq).toContain('not yet operative exemptions')
    expect(faq).toContain('August 26')
    expect(faq).toContain('not a scheduling order')
  })
})
