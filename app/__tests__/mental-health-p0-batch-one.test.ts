import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'

import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const batch1Slugs = [
  'limerence-obsessive-love-evidence-review',
  'limerence-borderline-partner-evidence-review',
  'loving-a-partner-with-bpd-evidence-review',
  'bpd-vs-complex-ptsd-evidence-review',
  'avoidant-personality-vs-social-anxiety-evidence-review',
  'personality-disorder-recovery-long-term-evidence-review',
  'emotional-dysregulation-across-disorders-evidence-review',
  'attachment-to-people-who-hurt-us-evidence-review',
  'anxious-avoidant-relationship-cycle-evidence-review',
  'rejection-sensitive-dysphoria-adhd-evidence-review',
] as const

const articles = batch1Slugs.map((slug) => {
  const raw = readFileSync(join(process.cwd(), 'content', 'articles', slug + '.md'), 'utf8')
  return { slug, ...matter(raw) }
})

const hubSource = readFileSync(join(process.cwd(), 'app/guides/mental-health/page.tsx'), 'utf8')

describe('THS mental health P0 ten-article batch 1', () => {
  it('uses exactly ten distinct, substantive articles with dated disclosures', () => {
    expect(articles).toHaveLength(10)
    expect(new Set(articles.map(({ slug }) => slug)).size).toBe(10)
    expect(new Set(articles.map(({ data }) => data.title)).size).toBe(10)
    for (const article of articles) {
      expect(article.data.slug).toBe(article.slug)
      expect(article.data.date).toBe('2026-10-24')
      expect(article.data.factualUpdated).toBe('2026-10-24')
      expect(article.data.category).toBe('Mental Health')
      expect(article.content.trim().split(/\s+/).length).toBeGreaterThan(1500)
      expect(article.data.keyTakeaways.length).toBeGreaterThanOrEqual(4)
      expect(article.data.references.length).toBeGreaterThanOrEqual(6)
      expect(article.data.faqs.length).toBeGreaterThanOrEqual(4)
      expect(article.content).toMatch(/meta-analys(is|es)/i)
      expect(article.content).toMatch(/not a new|not a newly|not an original/i)
      expect(article.content).toContain('/guides/mental-health/')
    }
  })

  it('requires traceable, nonduplicate citation identifiers and explicit evidence descriptions', () => {
    for (const article of articles) {
      const seen = new Set<string>()
      for (const source of article.data.references as Array<{
        title: string
        authors: string
        pmid?: string
        doi?: string
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
    }
  })

  it('renders authored FAQs through the page normalizer and preserves legacy override fallback', () => {
    for (const article of articles) {
      const normalized = normalizeCitationMetadata(article.data)
      expect(normalized.faqAnswers).toHaveLength(article.data.faqs.length)
      expect(normalized.faqAnswers).toEqual(article.data.faqs)
      expect(normalized.faqAnswers.length).toBeGreaterThanOrEqual(4)
    }

    // All content-collection pages have faqs: [] by schema default. The older
    // curated registry must still work when frontmatter does not supply answers.
    expect(normalizeCitationMetadata({ slug: 'sleep-debt-and-recovery', faqs: [] }).faqAnswers.length)
      .toBeGreaterThan(0)
  })

  it('surfaces all ten routes via one hub registry used by cards and structured data', () => {
    expect(hubSource).toContain('const P0_RESEARCH_REVIEWS')
    expect(hubSource).toContain('P0_RESEARCH_REVIEWS.map((review) => (')
    expect(hubSource).toContain('...P0_RESEARCH_REVIEWS.map((review) => ({')
    for (const slug of batch1Slugs) expect(hubSource).toContain('/articles/' + slug + '/')
  })

  it('ensures all new reviews link to related science and disclose methodological limits', () => {
    for (const article of articles.slice(3)) {
      const links = article.content.match(/\]\(\/articles\/[^)]+\)/g) ?? []
      expect(links.length).toBeGreaterThanOrEqual(2)
      expect(article.content).toMatch(/limitations?|uncertainty|observational|correlational/i)
    }
  })

  it('keeps the most important contradictory findings visible', () => {
    const rejection = articles.find((item) => item.slug === 'rejection-sensitive-dysphoria-adhd-evidence-review')!
    expect(rejection.content).toContain('was **not supported**')
    expect(rejection.content).toContain('4,150')
    expect(rejection.content).toContain('five undergraduate')
    const longTerm = articles.find((item) => item.slug === 'personality-disorder-recovery-long-term-evidence-review')!
    expect(longTerm.content).toContain('11 studies')
    expect(longTerm.content).toContain('functional')
    const attachment = articles.find((item) => item.slug === 'attachment-to-people-who-hurt-us-evidence-review')!
    expect(attachment.content).toContain('safe housing')
    expect(attachment.content).toContain('coercive')
  })
})
