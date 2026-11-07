import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Page, { metadata } from '../guides/compare/vitamin-b12/page'
import { faqs, forms, studies } from '../guides/compare/vitamin-b12/content'

describe('vitamin B12 evidence-first comparison', () => {
  it('keeps verified source identities and 12 bounded FAQ answers shared with schema', () => {
    expect(studies.map(s => s.pmid)).toEqual(['25820384', '29543316', '14616423', '29499976', '15911731', '33513879', '20488910', '24327038', '28829668', '11282797', '30499135', '28594082', '18606874', '24942828', '33809274', '32819927'])
    expect(faqs).toHaveLength(12)
    const { container } = render(<Page />)
    const schemas = [...container.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent!))
    const faqSchema = schemas.find(s => s['@type'] === 'FAQPage')
    expect(faqSchema.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => ({ question: q.name, answer: q.acceptedAnswer.text }))).toEqual(faqs)
    for (const faq of faqs) {
      expect(faq.answer.trim().split(/\s+/).length, faq.question).toBeGreaterThanOrEqual(40)
      expect(faq.answer.trim().split(/\s+/).length, faq.question).toBeLessThanOrEqual(60)
      expect(container.querySelector('[data-visible-faq]')?.textContent).toContain(faq.answer)
      expect(faq.answer).toMatch(/PMIDs? \d+/)
    }
  })

  it('places safety and disclosure before four form searches, without invented ASINs', () => {
    const { container } = render(<Page />)
    const links = [...container.querySelectorAll<HTMLAnchorElement>('a[href*="amazon.com"]')]
    expect(links).toHaveLength(4)
    const safety = container.querySelector('#safety')!
    const disclosure = [...container.querySelectorAll('section')].find(s => s.querySelector('h2')?.textContent === 'Affiliate disclosure')!
    for (const link of links) {
      const url = new URL(link.href)
      expect(url.pathname).toBe('/s')
      expect(url.searchParams.get('tag')).toBe('razzleberr0e2-20')
      expect(url.searchParams.get('k')).not.toMatch(/inject/i)
      expect(link.textContent).toMatch(/Search Amazon:.*affiliate/)
      expect(link.rel).toContain('sponsored')
      expect(safety.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(disclosure.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
    expect(forms.map(f => f.name)).toEqual(['Cyanocobalamin', 'Methylcobalamin', 'Hydroxocobalamin', 'Adenosylcobalamin'])
    expect(container.querySelectorAll('table')).toHaveLength(1)
    expect(metadata.alternates?.canonical).toContain('/guides/compare/vitamin-b12/')
  })

  it('preserves cancer, folate, interaction, acne and null-evidence boundaries', () => {
    const { container } = render(<Page />)
    const safety = container.querySelector('#safety')!.textContent!
    expect(safety).toContain('Folate can mask')
    expect(safety).toContain('metformin')
    expect(safety).toContain('PPIs and H2 blockers')
    expect(safety).toContain('Acneiform eruptions')
    expect(safety).toContain('55 mcg/day')
    expect(safety).toContain('HR 1.98, 95% CI 1.32–2.97')
    expect(safety).toContain('ATBC randomized vitamin E and beta-carotene, not B12')
    expect(safety).toContain('no significant association between serum B12 and lung cancer')
    expect(safety).toContain('avoid unnecessary high-dose')
    expect(container.querySelector('#routes')!.textContent).toContain('Oral non-inferiority was not established at one year')
    expect(container.querySelector('#who-needs-it')!.textContent).toContain('no preventive dose')
    expect(container.textContent).not.toMatch(/bypasses conversion|methylcobalamin is (the )?best|guaranteed energy/i)
    for (const citation of container.querySelectorAll('a[href^="#ref-"]')) {
      expect(container.querySelector(citation.getAttribute('href')!)).toBeTruthy()
    }
  })
})
