import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const page = fs.readFileSync(
  path.join(process.cwd(), 'app', 'guides', 'sleep', 'glycine-for-sleep', 'page.tsx'),
  'utf8',
)
const newsletter = fs.readFileSync(
  path.join(process.cwd(), 'components', 'NewsletterCtaBlock.tsx'),
  'utf8',
)
const recommendations = fs.readFileSync(
  path.join(process.cwd(), 'components', 'RecommendationSection.tsx'),
  'utf8',
)
const revenueTracking = fs.readFileSync(
  path.join(process.cwd(), 'lib', 'revenue-tracking.ts'),
  'utf8',
)
const leadMagnets = fs.readFileSync(
  path.join(process.cwd(), 'lib', 'lead-magnets.ts'),
  'utf8',
)

describe('Glycine for Sleep post-answer action', () => {
  it('keeps exactly one noncommercial next action between verdict and product sourcing', () => {
    const verdict = page.indexOf('The Hippie Scientist verdict')
    const newsletterCta = page.indexOf('<NewsletterCtaBlock')
    const productNote = page.indexOf('Product-quality note:')
    const recommendation = page.indexOf('<RecommendationSection')

    expect(verdict).toBeGreaterThan(-1)
    expect(newsletterCta).toBeGreaterThan(verdict)
    expect(productNote).toBeGreaterThan(newsletterCta)
    expect(recommendation).toBeGreaterThan(productNote)

    expect((page.match(/<NewsletterCtaBlock/g) ?? []).length).toBe(1)
    expect(page).toContain('location="glycine-sleep-post-answer-newsletter"')
    expect(page).toContain('ctaLabel="Read the newsletter"')
    expect(page).not.toContain('<EmailCapture')
    expect(leadMagnets).toContain("path === '/guides/sleep/glycine-for-sleep/'")
    expect(leadMagnets).toContain("path === '/guides/sleep/glycine-for-sleep'")
  })

  it('keeps the post-answer action claim-neutral and separate from the affiliate boundary', () => {
    const start = page.indexOf('<NewsletterCtaBlock')
    const end = page.indexOf('<section className="space-y-3">', start)
    const postAnswer = page.slice(start, end)

    expect(postAnswer).toContain('evidence-first sleep research')
    expect(postAnswer).toContain('sleep supplements, safety')
    expect(postAnswer).toContain('without turning preliminary findings into prescriptions')
    expect(postAnswer).not.toMatch(/amazon|affiliate|buy now|shop now|best product|works for insomnia|recommended dose|3 g/i)

    expect(recommendations).toContain("<AffiliateDisclosure variant='compact'")
  })

  it('preserves the merged September glycine evidence and safety boundaries', () => {
    expect(page).toContain('Evidence review · 12-source clinical & mechanistic ledger')
    expect(page).toContain("pmid: '42687500'")
    expect(page).toContain('three supplemental-glycine sleep trials')
    expect(page).toContain('cannot be reassigned to isolated glycine because glycine mediation was not directly tested')
    expect(page).toContain('Glycine is not an established treatment for chronic insomnia')
    expect(page).toContain('not a validated minimum, maximum, optimal dose, or personalized prescription')
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
