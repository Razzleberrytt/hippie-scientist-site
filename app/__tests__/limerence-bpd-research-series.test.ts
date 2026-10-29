import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'

import { P0_RESEARCH_REVIEWS } from '@/lib/mental-health-research-directory'
import { primaryNavigation } from '@/lib/primary-navigation'

const slugs = [
  'limerence-obsessive-love-evidence-review',
  'limerence-borderline-partner-evidence-review',
  'loving-a-partner-with-bpd-evidence-review',
] as const

const articles = slugs.map((slug) => {
  const raw = readFileSync(join(process.cwd(), 'content', 'articles', slug + '.md'), 'utf8')
  return { slug, ...matter(raw) }
})

describe('limerence and BPD evidence review series', () => {
  it('has three distinct, substantial article inputs with honest review dates', () => {
    expect(new Set(articles.map(({ data }) => data.title)).size).toBe(3)
    for (const article of articles) {
      expect(article.data.slug).toBe(article.slug)
      expect(article.data.date).toBe('2026-10-24')
      expect(article.data.factualUpdated).toBe('2026-10-24')
      expect(article.data.category).toBe('Mental Health')
      expect(article.content.trim().split(/\s+/).length).toBeGreaterThan(1500)
      expect(article.data.references.length).toBeGreaterThanOrEqual(6)
      expect(article.data.faqs.length).toBeGreaterThanOrEqual(4)
      expect(article.content.toLowerCase()).toContain('not a new')
    }
  })

  it('keeps direct limerence findings distinct from BPD correlations', () => {
    const intersection = articles[1].content
    expect(intersection).toContain('no direct controlled evidence')
    expect(intersection).toContain('r=0.48')
    expect(intersection).toContain('r=0.39')
    expect(articles[0].content).toContain('1,647')
    expect(articles[0].content).toContain('51')
    expect(articles[2].content).toContain('204 adults')
    expect(articles[2].content).toContain('not a guarantee')
  })

  it('provides unique traceable references and the corrected randomized-trial review PMID', () => {
    for (const article of articles) {
      const seen = new Set<string>()
      for (const ref of article.data.references as Array<{ pmid?: string; doi?: string; url?: string; title: string }>) {
        expect(ref.title.length).toBeGreaterThan(12)
        expect(ref.url).toMatch(/^https:\/\//)
        const key = ref.pmid ? 'pmid:' + ref.pmid : ref.doi ? 'doi:' + ref.doi : 'url:' + ref.url
        expect(seen.has(key)).toBe(false)
        seen.add(key)
      }
    }
    const treatmentReference = articles[2].data.references.find((ref: { doi?: string }) =>
      ref.doi === '10.1001/jamapsychiatry.2016.4287'
    )
    expect(treatmentReference?.pmid).toBe('28249086')
  })

  it('shows all three reviews in the Guides menu and mental-health hub', () => {
    const guides = primaryNavigation.find((item) => item.label === 'Guides')
    const destinations = new Set((guides?.children ?? []).map((child) => child.href))
    const hub = readFileSync(join(process.cwd(), 'app', 'guides', 'mental-health', 'page.tsx'), 'utf8')
    expect(hub).toContain('<MentalHealthResearchDirectory reviews={P0_RESEARCH_REVIEWS} />')
    for (const slug of slugs) {
      expect(destinations.has('/articles/' + slug)).toBe(true)
      expect(P0_RESEARCH_REVIEWS.some((review) => review.href === '/articles/' + slug + '/')).toBe(true)
    }
  })

  it('cross-links the series without equating BPD with abusive behavior', () => {
    for (const article of articles) {
      for (const slug of slugs) {
        if (slug !== article.slug) expect(article.content).toContain('/articles/' + slug + '/')
      }
    }
    expect(articles[2].content).toContain('BPD is not synonymous with abuse')
  })
})
