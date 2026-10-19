import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Page from '../guides/compare/psyllium-husk/page'
import { faqs, studies } from '../guides/compare/psyllium-husk/content'

describe('psyllium evidence-first buyer comparison', () => {
  it('keeps eight verified source identities and ten 40–60 word answers', () => {
    expect(studies.map(s => s.pmid)).toEqual(['30239559', '35816465', '21323688', '34074830', '19713235', '9737361', '30321826', '14700444'])
    expect(faqs).toHaveLength(10)
    for (const faq of faqs) {
      expect(faq.answer.trim().split(/\s+/).length).toBeGreaterThanOrEqual(40)
      expect(faq.answer.trim().split(/\s+/).length).toBeLessThanOrEqual(60)
    }
  })
  it('discloses before all four search links and makes no unverified ASIN links', () => {
    const { container } = render(<Page />)
    const links = [...container.querySelectorAll<HTMLAnchorElement>('a[href*="amazon.com"]')]
    expect(links).toHaveLength(4)
    for (const link of links) {
      const url = new URL(link.href)
      expect(url.pathname).toBe('/s')
      expect(url.searchParams.get('tag')).toBe('razzleberr0e2-20')
      expect(link.rel).toContain('sponsored')
      expect(container.innerHTML.indexOf('Affiliate disclosure')).toBeLessThan(container.innerHTML.indexOf(link.getAttribute('href')!.replaceAll('&', '&amp;')))
    }
    expect(screen.getByRole('heading', { level: 2, name: /Who should avoid psyllium/ })).toBeTruthy()
    const region = screen.getByRole('region', { name: 'Psyllium forms comparison table; scroll horizontally on small screens' })
    expect(region.getAttribute('aria-describedby')).toBeTruthy()
    expect(region.textContent).toContain('Use Tab to focus the table region')
  })
  it('renders the same ten answers in FAQ schema without stronger claims', () => {
    const { container } = render(<Page />)
    const nodes = [...container.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent!))
    const faq = nodes.find(n => n['@type'] === 'FAQPage')
    expect(faq.mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text)).toEqual(faqs.map(f => f.answer))
    expect(container.textContent).toContain('No form or brand has demonstrated superiority')
    expect(container.textContent).toContain('quality of life did not differ')
    expect(container.textContent).toContain('did not establish clinically important malabsorption')
  })
})
