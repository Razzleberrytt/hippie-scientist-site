import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'

import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const batch2Slugs = [
  'limerence-versus-relationship-ocd-evidence-review',
  'excessive-reassurance-seeking-relationships-evidence-review',
  'social-rejection-pain-brain-evidence-review',
  'grandiose-vulnerable-narcissism-evidence-review',
  'romantic-breakup-recovery-grief-evidence-review',
  'emotional-unavailability-attachment-avoidance-evidence-review',
  'leaving-unhealthy-relationships-safety-evidence-review',
  'attachment-styles-relationship-outcomes-evidence-review',
  'dependent-personality-vs-attachment-anxiety-evidence-review',
  'rumination-repetitive-negative-thinking-evidence-review',
] as const

const articles = batch2Slugs.map((slug) => ({
  slug,
  ...matter(readFileSync(join(process.cwd(), 'content', 'articles', slug + '.md'), 'utf8')),
}))

const hub = readFileSync(join(process.cwd(), 'app/guides/mental-health/page.tsx'), 'utf8')

describe('THS mental health P0 Batch 2 completeness and science integrity', () => {
  it('contains exactly ten distinct substantial evidence reviews with correct release dates', () => {
    expect(articles).toHaveLength(10)
    expect(new Set(batch2Slugs).size).toBe(10)
    expect(new Set(articles.map(({ data }) => data.title)).size).toBe(10)
    for (const article of articles) {
      expect(article.data.slug).toBe(article.slug)
      expect(article.data.category).toBe('Mental Health')
      expect(article.data.date).toBe('2026-10-25')
      expect(article.data.factualUpdated).toBe('2026-10-25')
      expect(article.content.trim().split(/\s+/).length).toBeGreaterThan(1500)
      expect(article.data.description.length).toBeGreaterThanOrEqual(90)
      expect(article.data.keyTakeaways.length).toBeGreaterThanOrEqual(4)
      expect(article.data.references.length).toBeGreaterThanOrEqual(6)
      expect(article.data.faqs.length).toBeGreaterThanOrEqual(4)
      expect(article.data.citationQuestions.length).toBeGreaterThanOrEqual(4)
      expect(article.data.evidenceGrade.length).toBeGreaterThan(35)
      expect(article.content).toMatch(/meta-analys(is|es)/i)
      expect(article.content).toMatch(/not a new|not a newly|not an original/i)
      expect(article.content).toMatch(/limitations?|uncertain|observational|correlational|cross-sectional|heterogene|cannot (?:establish|demonstrate)|small (?:imaging )?studies/i)
      expect(article.content).toContain('/guides/mental-health/')
    }
  })

  it('has nonduplicate, attributable, linked references with explicit strength and type', () => {
    for (const article of articles) {
      const seen = new Set<string>()
      for (const source of article.data.references as Array<{
        title: string
        authors: string
        doi?: string
        pmid?: string
        url: string
        sourceType: string
        evidenceLevel: string
      }>) {
        expect(source.title.length).toBeGreaterThan(12)
        expect(source.authors.length).toBeGreaterThan(5)
        expect(source.url).toMatch(/^https:\/\//)
        expect(source.sourceType.length).toBeGreaterThan(10)
        expect(source.evidenceLevel.length).toBeGreaterThan(10)
        const key = source.pmid ? 'pmid:' + source.pmid : source.doi ? 'doi:' + source.doi : 'url:' + source.url
        expect(seen.has(key)).toBe(false)
        seen.add(key)
      }
      expect(new Set(article.data.relatedSlugs).size).toBe(article.data.relatedSlugs.length)
    }
  })

  it('renders authored FAQs with clear citation answers', () => {
    for (const article of articles) {
      const faqs = normalizeCitationMetadata(article.data).faqAnswers
      expect(faqs).toHaveLength(article.data.faqs.length)
      for (const faq of faqs) {
        expect(faq.question.length).toBeGreaterThan(12)
        expect(faq.answer.length).toBeGreaterThan(60)
        expect(faq.answer).toMatch(/\[\d/)
      }
    }
  })

  it('adds every Batch 2 article to the existing public-hub registry without duplicate routes', () => {
    expect(hub).toContain('const P0_RESEARCH_REVIEWS')
    expect(hub).toContain('P0_RESEARCH_REVIEWS.map((review) => (')
    expect(hub).toContain('...P0_RESEARCH_REVIEWS.map((review) => ({')
    for (const slug of batch2Slugs) {
      const href = '/articles/' + slug + '/'
      expect(hub).toContain(href)
      expect(hub.split(href).length - 1).toBe(1)
    }
  })

  it('crosslinks existing research and avoids duplicate site-local contexts', () => {
    for (const article of articles) {
      const localLinks = article.content.match(/\]\(\/articles\/[^)]+\)/g) ?? []
      expect(localLinks.length).toBeGreaterThanOrEqual(2)
      expect(article.data.relatedSlugs.length).toBeGreaterThanOrEqual(2)
      // A cautionary statement may quote a false claim to reject it; never ban the phrase alone.
      expect(article.content).toMatch(/(?:cannot|not|does not|no reliable|no validated|not enough|not a new|not an original)/i)
    }
    const limerence = articles.find(({ slug }) => slug === 'limerence-versus-relationship-ocd-evidence-review')!
    expect(limerence.content).toContain('would go beyond the direct evidence')
    const rejection = articles.find(({ slug }) => slug === 'social-rejection-pain-brain-evidence-review')!
    expect(rejection.content).toContain('There is no validated interpretation')
  })
})
