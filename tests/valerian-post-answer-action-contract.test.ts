import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const page = fs.readFileSync(
  path.join(process.cwd(), 'app', 'articles', '[slug]', 'page.tsx'),
  'utf8',
)
const article = fs.readFileSync(
  path.join(process.cwd(), 'content', 'articles', 'valerian-root.md'),
  'utf8',
)
const newsletter = fs.readFileSync(
  path.join(process.cwd(), 'components', 'NewsletterCtaBlock.tsx'),
  'utf8',
)
const revenueTracking = fs.readFileSync(
  path.join(process.cwd(), 'lib', 'revenue-tracking.ts'),
  'utf8',
)

describe('Valerian Root post-answer action', () => {
  it('keeps one Valerian-only newsletter action downstream of the complete answer and references', () => {
    const body = page.indexOf('<ArticleMdx code={page.body} />')
    const faq = page.indexOf('{faqAnswers.length > 0 ? (')
    const references = page.indexOf('<References refs={articleReferences} />')
    const valerianCondition = page.indexOf("page.slug === 'valerian-root'")
    const newsletterCta = page.indexOf('<NewsletterCtaBlock')
    const related = page.indexOf('{relatedPages.length > 0 ? (')

    expect(body).toBeGreaterThan(-1)
    expect(faq).toBeGreaterThan(body)
    expect(references).toBeGreaterThan(faq)
    expect(valerianCondition).toBeGreaterThan(references)
    expect(newsletterCta).toBeGreaterThan(valerianCondition)
    expect(related).toBeGreaterThan(newsletterCta)

    expect((page.match(/<NewsletterCtaBlock/g) ?? []).length).toBe(1)
    expect(page).toContain('location="valerian-root-post-answer-newsletter"')
    expect(page).toContain('ctaLabel="Read the newsletter"')
    expect(page).not.toContain('<EmailCapture')
  })

  it('keeps the post-answer action non-commercial and claim-neutral', () => {
    const start = page.indexOf("page.slug === 'valerian-root'")
    const end = page.indexOf('{relatedPages.length > 0 ? (')
    const postAnswer = page.slice(start, end)

    expect(postAnswer).toContain('evidence-first sleep research')
    expect(postAnswer).toContain('supplement evidence, safety')
    expect(postAnswer).not.toMatch(/amazon|affiliate|buy now|shop now|best product|works for insomnia/i)
  })

  it('preserves the current Valerian evidence, safety, verdict, and medical-note boundary', () => {
    expect((article.match(/^\s+- title:/gm) ?? []).length).toBe(18)
    expect(article).toContain('Valerian root is **not an established treatment for insomnia**')
    expect(article).toContain('long-term safety is unknown')
    expect(article).toContain('**Valerian is neither useless nor proven.**')
    expect(article).toContain('Persistent insomnia, severe daytime impairment, breathing pauses during sleep, restless legs')
  })

  it('reuses the accessible consent-governed shared newsletter action', () => {
    expect(newsletter).toContain('min-h-11')
    expect(newsletter).toContain('focus-visible:outline-none')
    expect(newsletter).toContain('focus-visible:ring-2')
    expect(newsletter).toContain('trackRevenueEvent')
    expect(revenueTracking).toContain("import { canTrackAnalytics } from '@/lib/consent'")
    expect(revenueTracking).toContain('if (!canSendAnalytics()) return')
    expect(revenueTracking.indexOf('if (!canSendAnalytics()) return')).toBeLessThan(
      revenueTracking.indexOf('window.dataLayer.push'),
    )
  })
})
