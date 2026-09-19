import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const page = fs.readFileSync(
  path.join(process.cwd(), 'app', 'guides', 'anxiety', 'best-herbs-for-anxiety', 'page.tsx'),
  'utf8',
)
const newsletter = fs.readFileSync(path.join(process.cwd(), 'components', 'NewsletterCtaBlock.tsx'), 'utf8')
const revenueTracking = fs.readFileSync(path.join(process.cwd(), 'lib', 'revenue-tracking.ts'), 'utf8')

describe('best herbs for anxiety post-answer action', () => {
  it('keeps exactly one primary CTA after the answer, safety, references, and FAQ', () => {
    const safety = page.indexOf('id="safety"')
    const references = page.indexOf('<References refs={REFS} />')
    const faq = page.indexOf('<section id="faq"')
    const newsletterCta = page.indexOf('<NewsletterCtaBlock')
    const relatedNav = page.indexOf('<nav className="flex flex-wrap gap-4')

    expect(safety).toBeGreaterThan(-1)
    expect(references).toBeGreaterThan(safety)
    expect(faq).toBeGreaterThan(references)
    expect(newsletterCta).toBeGreaterThan(faq)
    expect(relatedNav).toBeGreaterThan(newsletterCta)

    expect((page.match(/<NewsletterCtaBlock/g) ?? []).length).toBe(1)
    expect(page).not.toContain('<EmailCapture')
    expect(page).not.toContain("from '@/components/EmailCapture'")
    expect(page).toContain('ctaLabel="Read the newsletter"')
  })

  it('does not move a commercial recommendation ahead of evidence or safety', () => {
    const postAnswer = page.slice(page.indexOf('<NewsletterCtaBlock'), page.indexOf('<nav className="flex flex-wrap gap-4'))

    expect(postAnswer).toContain('best-herbs-for-anxiety-newsletter')
    expect(postAnswer).not.toMatch(/amazon|affiliate|buy now|shop now|best product/i)
  })

  it('preserves accessible target sizing and keyboard focus for the remaining CTA', () => {
    expect(newsletter).toContain('min-h-11')
    expect(newsletter).toContain('focus-visible:outline-none')
    expect(newsletter).toContain('focus-visible:ring-2')
  })

  it('keeps analytics behind the consent boundary', () => {
    expect(newsletter).toContain('trackRevenueEvent')
    expect(revenueTracking).toContain("import { canTrackAnalytics } from '@/lib/consent'")
    expect(revenueTracking).toContain('if (!canSendAnalytics()) return')
    expect(revenueTracking.indexOf('if (!canSendAnalytics()) return')).toBeLessThan(
      revenueTracking.indexOf('window.dataLayer.push'),
    )
  })
})
