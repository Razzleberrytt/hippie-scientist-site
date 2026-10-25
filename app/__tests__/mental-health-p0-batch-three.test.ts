import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'

import { P0_RESEARCH_REVIEWS } from '@/lib/mental-health-research-directory'

import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const batch3Slugs = [
  "alexithymia-emotional-awareness-evidence-review",
  "anger-dysregulation-regulation-evidence-review",
  "chronic-emptiness-bpd-depression-evidence-review",
  "dissociation-depersonalization-derealization-evidence-review",
  "emotional-numbness-anhedonia-blunting-evidence-review",
  "shame-versus-guilt-evidence-review",
  "splitting-dichotomous-thinking-evidence-review",
  "bipolar-ii-versus-bpd-evidence-review",
  "adhd-versus-trauma-ptsd-evidence-review",
  "persistent-depressive-disorder-dysthymia-evidence-review"
] as const

const articles = batch3Slugs.map((slug) => ({
  slug,
  ...matter(readFileSync(join(process.cwd(), 'content', 'articles', slug + '.md'), 'utf8')),
}))

const hub = readFileSync(join(process.cwd(), 'app/guides/mental-health/page.tsx'), 'utf8')

describe('THS mental health P0 Batch 3 completeness and science integrity', () => {
  it('contains exactly ten distinct substantial evidence reviews with correct release dates', () => {
    expect(articles).toHaveLength(10)
    expect(new Set(batch3Slugs).size).toBe(10)
    expect(new Set(articles.map(({ data }) => data.title)).size).toBe(10)
    for (const article of articles) {
      expect(article.data.slug).toBe(article.slug)
      expect(article.data.category).toBe('Mental Health')
      expect(article.data.date).toBe('2026-10-25')
      expect(article.data.factualUpdated).toBe('2026-10-25')
      expect(article.content.trim().split(/\s+/).length).toBeGreaterThan(1500)
      expect(article.data.description.length).toBeGreaterThanOrEqual(90)
      expect(article.data.keyTakeaways.length).toBeGreaterThanOrEqual(4)
      for (const takeaway of article.data.keyTakeaways as string[]) {
        const citations = takeaway.match(/\[([\d,]+)\]/g) ?? []
        expect(citations.length).toBeGreaterThan(0)
        for (const citation of citations) for (const id of citation.match(/\d+/g) ?? []) {
          expect(Number(id)).toBeGreaterThan(0)
          expect(Number(id)).toBeLessThanOrEqual(article.data.references.length)
        }
      }
      expect(article.content).not.toMatch(/\(Batch \d+ draft\)|\(staged for this batch\)/i)
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

  it('adds every Batch 3 article to the existing public-hub registry without duplicate routes', () => {
    expect(hub).toContain("from '@/lib/mental-health-research-directory'")
    expect(hub).toContain('<MentalHealthResearchDirectory reviews={P0_RESEARCH_REVIEWS} />')
    expect(hub).toContain('...P0_RESEARCH_REVIEWS.map((review) => ({')
    for (const slug of batch3Slugs) {
      const href = '/articles/' + slug + '/'
      expect(P0_RESEARCH_REVIEWS.filter((review) => review.href === href)).toHaveLength(1)
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
    const differential = articles.find(({ slug }) => slug === 'bipolar-ii-versus-bpd-evidence-review')!
    expect(differential.content).toContain('bipolar-II-only')
    const chronic = articles.find(({ slug }) => slug === 'persistent-depressive-disorder-dysthymia-evidence-review')!
    expect(chronic.content).toContain('protocol itself reports methods')
  })
})
