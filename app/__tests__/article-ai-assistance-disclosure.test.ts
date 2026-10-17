import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')
const slugs = [
  "dmt-types-explained",
  "long-term-cannabis-brain-effects",
  "adhd-brain-facts-explained",
  "yopo-bufotenine-science-history",
  "psychedelics-and-the-brain-science"
] as const

describe('EvidenceMotion article AI-assistance disclosure', () => {
  it('preserves the flag through the article collection schema', () => {
    const schema = read('content-collections.ts')
    const articleSchema = schema.split('const citationPageSchema = z.object({')[1]?.split('const articleMonographs =')[0]
    expect(articleSchema).toContain('ai_assisted: z.boolean().optional()')
  })

  it('renders visible, accessible text only for AI-assisted articles', () => {
    const route = read('app/articles/[slug]/page.tsx')
    expect(route).toContain("const aiAssisted = 'ai_assisted' in page && page.ai_assisted === true")
    expect(route).toContain('{aiAssisted ? (')
    expect(route).toContain('Prepared with AI assistance; sources and limitations are provided for independent review.')
    expect(route).not.toContain('AI-reviewed and approved')
  })

  it('marks each of the five new manuscripts as AI-assisted', () => {
    for (const slug of slugs) {
      const source = read(`content/articles/${slug}.md`)
      expect(source).toContain('\nai_assisted: true\n')
      expect(source.split('---')[1]).not.toContain('readingTime:')
    }
  })

  it('does not replace independent scientific or safety evidence with disclosure', () => {
    const psychedelic = read('content/articles/psychedelics-and-the-brain-science.md')
    expect(psychedelic).toContain('hallucinogen persisting perception disorder (HPPD)')
    expect(psychedelic).toContain('hospitalization')
    expect(psychedelic).toContain('OVID')
    expect(psychedelic).toContain('Usona')
  })
})
