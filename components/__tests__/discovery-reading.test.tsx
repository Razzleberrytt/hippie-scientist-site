import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GuideCardGrid } from '../guides/GuideCardGrid'
import { DecisionRouter } from '../guides/DecisionRouter'
import { HubSectionHeading } from '../guides/HubSectionHeading'
import ArticleLayout from '../articles/ArticleLayout'

describe('shared discovery and reading contracts', () => {
  it('keeps full decision context and canonical destinations in keyboard links', () => {
    const desc = 'Limited evidence; medication interactions require review before combining products.'
    render(<GuideCardGrid cards={[{ href: '/guides/compare/test/', title: 'Compare evidence', desc }]} />)
    const link = screen.getByRole('link', { name: /Compare evidence/ })
    expect(link).toHaveAttribute('href', '/guides/compare/test')
    expect(within(link).getByText(desc)).toBeVisible()
    expect(link).toHaveClass('discovery-link-card')
  })

  it('preserves route order, cautions and CTA text in decision routing', () => {
    render(<DecisionRouter items={[
      { problem: 'First context', why: 'Evidence is uncertain.', cta: 'Review evidence', href: '/learn/evidence/' },
      { problem: 'Second context', why: 'Check safety first.', cta: 'Review safety', href: '/learn/safety/' },
    ]} />)
    expect(screen.getAllByRole('link').map(link => link.getAttribute('href'))).toEqual(['/learn/evidence', '/learn/safety'])
    expect(screen.getByText('Check safety first.')).toBeVisible()
    expect(screen.getByText('Start with Review safety')).toBeVisible()
  })

  it('retains semantic section headings and rich explanatory content', () => {
    render(<HubSectionHeading eyebrow="Evidence" title="Compare options" sub={<>Read <strong>limitations</strong> first.</>} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Compare options')
    expect(screen.getByText('limitations')).toBeVisible()
  })

  it('keeps article content order, anchor targets and safety zone with navigation', () => {
    const { container } = render(<ArticleLayout zone="harm-reduction" toc={<nav><a href="#safety">Safety</a></nav>}>
      <h1>Research context</h1><p>Evidence remains uncertain.</p><h2 id="safety">Safety boundary</h2><p>Do not combine.</p>
    </ArticleLayout>)
    const article = container.querySelector('article')!
    expect(article.textContent).toBe('Research contextEvidence remains uncertain.Safety boundaryDo not combine.')
    expect(container.querySelector('[data-zone="harm-reduction"]')).toHaveClass('reading-shell')
    expect(screen.getByRole('complementary', { name: 'Page navigation' }).querySelector('.reading-shell-toc')).not.toBeNull()
    expect(article.querySelector('#safety')).not.toBeNull()
  })

  it('does not add navigation when an article has none', () => {
    render(<ArticleLayout><h1>Short article</h1></ArticleLayout>)
    expect(screen.queryByRole('complementary')).toBeNull()
  })
})
