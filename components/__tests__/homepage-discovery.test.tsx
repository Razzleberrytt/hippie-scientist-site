import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HomepageV2 from '../homepage-v2'

vi.mock('@/lib/public-site-metrics', () => ({
  getPublicSiteMetrics: vi.fn(async () => ({ publishedArticles: 12, publishedHerbs: 20, totalCompounds: 30, structuredStudies: 40 })),
}))
vi.mock('@/lib/research-source-register', () => ({
  getResearchSourceRegisterSummary: vi.fn(() => ({ totalIndexedPmids: 50 })),
}))
vi.mock('@/components/NewsletterSignup', () => ({ default: () => <div>Email signup</div> }))

describe('homepage discovery', () => {
  it('offers distinct topic destinations before the research-count explanation', async () => {
    render(await HomepageV2())
    const topics = screen.getByRole('navigation', { name: 'Browse research by topic' })
    const links = within(topics).getAllByRole('link')
    expect(links).toHaveLength(6)
    expect(new Set(links.map((link) => link.getAttribute('href'))).size).toBe(6)
    expect(within(topics).getByRole('link', { name: /^Stress/ })).toHaveAttribute('href', '/guides/stress')
    expect(within(topics).getByRole('link', { name: /^Anxiety/ })).toHaveAttribute('href', '/guides/anxiety')
    expect(within(topics).getByRole('link', { name: /^Mental health/ })).toHaveAttribute('href', '/guides/mental-health')
    expect(topics.compareDocumentPosition(screen.getByRole('heading', { name: /Human evidence, safety context/ })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps a labeled static search and sends ingredient lookup to both ingredient families', async () => {
    render(await HomepageV2())
    const search = screen.getByRole('search')
    expect(search).toHaveAttribute('action', '/search/')
    expect(search).toHaveAttribute('method', 'get')
    expect(within(search).getByRole('searchbox')).toHaveAttribute('name', 'q')
    expect(screen.getByRole('link', { name: /^Find an ingredient/ })).toHaveAttribute('href', '/search')
    expect(screen.getByRole('link', { name: 'herbs' })).toHaveAttribute('href', '/herbs')
    expect(screen.getByRole('link', { name: 'compounds' })).toHaveAttribute('href', '/compounds')
  })
})
