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
  it('separates tasks, wellbeing topics, collections, and featured articles in reading order', async () => {
    render(await HomepageV2())
    const tasks = screen.getByRole('navigation', { name: 'Choose your first step' })
    const topics = screen.getByRole('navigation', { name: 'Browse research by topic' })
    const wellbeing = within(topics).getByRole('region', { name: 'Everyday wellbeing' })
    const collections = within(topics).getByRole('region', { name: 'Research collections' })
    const featured = screen.getByRole('region', { name: 'Attachment & relationships' })
    const intro = screen.getByRole('region', { name: 'Nature, examined.' })

    expect(within(wellbeing).getAllByRole('link')).toHaveLength(4)
    expect(within(collections).getAllByRole('link')).toHaveLength(2)
    expect(within(intro).queryByRole('link', { name: 'Understanding limerence' })).not.toBeInTheDocument()
    expect(within(featured).getByRole('link', { name: 'Understanding limerence' })).toHaveAttribute('href', '/articles/limerence-obsessive-love-evidence-review')
    expect(tasks.compareDocumentPosition(topics) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(topics.compareDocumentPosition(featured) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(featured.compareDocumentPosition(screen.getByRole('heading', { name: /How we read the evidence/ })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('surfaces a real botanical monograph and keeps coverage context together in an expandable disclosure', async () => {
    render(await HomepageV2())
    const feature = screen.getByRole('region', { name: 'Ginkgo biloba' })
    expect(within(feature).getByRole('link', { name: 'Ginkgo biloba' })).toHaveAttribute('href', '/herbs/ginkgo-biloba')
    expect(within(feature).getByRole('img', { name: 'Ginkgo leaves' })).toBeInTheDocument()
    expect(feature.compareDocumentPosition(screen.getByRole('navigation', { name: 'Browse research by topic' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const coverage = screen.getByText('Research coverage & source counts').closest('details')
    expect(coverage).not.toHaveAttribute('open')
    expect(coverage).toHaveTextContent('not independently confirmed clinical trials')
    expect(coverage).toHaveTextContent('research-only identities')
  })

  it('offers distinct topic destinations before the research-count explanation', async () => {
    render(await HomepageV2())
    const topics = screen.getByRole('navigation', { name: 'Browse research by topic' })
    const links = within(topics).getAllByRole('link')
    expect(links).toHaveLength(6)
    expect(new Set(links.map((link) => link.getAttribute('href'))).size).toBe(6)
    expect(within(topics).getByRole('link', { name: /^Stress/ })).toHaveAttribute('href', '/guides/stress')
    expect(within(topics).getByRole('link', { name: /^Anxiety/ })).toHaveAttribute('href', '/guides/anxiety')
    expect(within(topics).getByRole('link', { name: /^Mental health/ })).toHaveAttribute('href', '/guides/mental-health')
    expect(topics.compareDocumentPosition(screen.getByRole('heading', { name: /How we read the evidence/ })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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
