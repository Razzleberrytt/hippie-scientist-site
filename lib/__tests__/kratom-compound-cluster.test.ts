import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'
import { buildKratomCompoundArticleSchema, kratomCompoundArticles } from '../kratom-compound-article-schema'
import { buildArticleReferenceSchema, normalizeArticleReferences } from '../article-citation-metadata'

const slugs = Object.keys(kratomCompoundArticles)
function read(slug: string) {
  return matter(fs.readFileSync(path.join(process.cwd(), 'content/articles', `${slug}.mdx`), 'utf8'))
}

describe('kratom compound citation cluster', () => {
  it.each(slugs)('%s preserves reciprocal authored links and source provenance', (slug) => {
    const { data, content } = read(slug)
    const schema = buildKratomCompoundArticleSchema(slug, data.relatedSlugs)!
    expect(schema.about['@type']).toBe('ChemicalSubstance')
    expect(schema.about.url).toBe(`https://thehippiescientist.net/articles/${slug}/`)
    expect(schema.mentions).toHaveLength(6)
    for (const other of slugs.filter(value => value !== slug)) {
      expect(data.relatedSlugs).toContain(other)
      expect(content).toContain(`/articles/${other}/`)
    }
    expect(content).toContain('/guides/substance-use/')
    const references = normalizeArticleReferences(data.references)
    expect(references.length).toBeGreaterThan(0)
    expect(references.some(ref => ref.doi || ref.pmid)).toBe(true)
    expect(references.map(buildArticleReferenceSchema).every(ref => ref.url)).toBe(true)
    expect(JSON.stringify(schema)).not.toMatch(/sameAs|approved|dose|reviewedBy/)
  })

  it('keeps unrelated pages and duplicate/self/unknown relationships out of compound schema', () => {
    expect(buildKratomCompoundArticleSchema('magnesium')).toBeUndefined()
    expect(buildKratomCompoundArticleSchema('mitragynine', ['mitragynine', 'speciogynine', 'speciogynine', 'unknown'])?.mentions).toHaveLength(1)
  })

  it.each(slugs.filter(slug => slug !== 'mitragynine'))('%s retains each evidence and safety domain', (slug) => {
    const { content } = read(slug)
    for (const domain of [/human evidence/i, /preclinical|animal|in-vitro/i, /pharmacology|receptor/i, /metabolism and pharmacokinetics/i, /safety/i, /dependence and withdrawal/i, /interactions/i, /regulatory status/i, /evidence gaps/i]) {
      expect(content).toMatch(domain)
    }
  })

  it('distinguishes the effective derivative order from the unverified 7-OH threshold outcome', () => {
    const mp = read('mitragynine-pseudoindoxyl')
    expect(mp.content).toContain('effective August 26, 2026 through August 26, 2028')
    expect(mp.content).not.toMatch(/does \*\*not\*\* state that MP is already|no later effective temporary order was located/)
    expect(mp.data.references.some((ref: { url: string }) => ref.url.includes('2026-17429'))).toBe(true)
    expect(read('7-hydroxymitragynine').content).toContain('does not establish 7-OH\'s own final scheduling status')
  })

  it('preserves mixture, species, and assay boundaries instead of declaring isolated human efficacy', () => {
    for (const slug of ['speciociliatine', 'speciogynine', 'mitraciliatine']) {
      expect(read(slug).content).toMatch(/mixed kratom tea/i)
      expect(read(slug).content).toMatch(/No controlled isolated|No controlled efficacy trial of isolated/)
    }
    expect(read('3-dehydromitragynine').content).toContain('does not provide a safe exposure threshold for humans')
    expect(read('mitraciliatine').content).toContain('MOR antagonist/KOR agonist at human receptors')
    expect(read('speciociliatine').content).toContain('no measurable opioid agonism')
  })
})
