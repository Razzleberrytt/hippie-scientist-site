import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'
import { P0_RESEARCH_REVIEWS } from '@/lib/mental-health-research-directory'
import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const slugs = [
  'ocpd-versus-ocd-perfectionism-evidence-review',
  'paranoid-personality-mistrust-evidence-review',
  'schizoid-versus-avoidant-personality-evidence-review',
  'histrionic-personality-diagnostic-validity-evidence-review',
  'antisocial-personality-psychopathy-sociopathy-evidence-review',
  'cyclothymia-mood-instability-evidence-review',
  'autistic-burnout-versus-depression-evidence-review',
  'pmdd-premenstrual-mood-evidence-review',
  'maladaptive-daydreaming-evidence-review',
  'childhood-emotional-neglect-adult-outcomes-evidence-review',
]
const articles = slugs.map(slug => ({ slug, ...matter(readFileSync(join(process.cwd(), 'content/articles', slug + '.md'), 'utf8')) }))
describe('P0 Batch 4 editorial release boundaries', () => {
  it('publishes ten distinct substantive reviews with attributed evidence and matching directory links', () => {
    expect(articles).toHaveLength(10)
    for (const { slug, data, content } of articles) {
      expect(data.slug).toBe(slug)
      expect(content.trim().split(/\s+/).length).toBeGreaterThan(1150)
      expect(content).toContain('not a new statistical meta-analysis')
      expect(content).toContain('/guides/mental-health/#research-directory')
      expect(P0_RESEARCH_REVIEWS.filter(review => review.href === '/articles/' + slug + '/')).toHaveLength(1)
      expect(new Set(data.references.map((r: { pmid: string }) => r.pmid)).size).toBe(data.references.length)
      for (const r of data.references) {
        expect(r.authors.length).toBeGreaterThan(5)
        expect(r.url).toBe('https://pubmed.ncbi.nlm.nih.gov/' + r.pmid + '/')
        expect(r.sourceType.length).toBeGreaterThan(15)
        expect(r.evidenceLevel.length).toBeGreaterThan(15)
      }
      for (const takeaway of data.keyTakeaways) expect(takeaway).toMatch(/\[\d/)
      expect(normalizeCitationMetadata(data).faqAnswers).toHaveLength(4)
    }
  })
  it('retains the exact non-generalization boundaries on high-risk conclusions', () => {
    const bySlug = (name: string) => articles.find(article => article.slug.startsWith(name))!.content
    expect(bySlug('antisocial')).toContain('not independent replication')
    expect(bySlug('antisocial')).toContain('not a percentage reduction')
    expect(bySlug('pmdd')).toContain('should not copy an intermittent research schedule')
    expect(bySlug('maladaptive')).toContain('not perfectly internally aligned')
    expect(bySlug('autistic')).toContain('not to estimate prevalence')
    expect(bySlug('childhood')).toContain('not a scan that diagnoses neglect')
    expect(bySlug('cyclothymia')).toContain('not an instruction to stop an antidepressant abruptly')
  })
})
