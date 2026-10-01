import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ContentCards from '../content/ContentCards'

describe('article section cards', () => {
  it('keeps nested MDX intro and sections in their owning body without moving a sibling CTA', () => {
    const { container } = render(
      <ContentCards>
        <div data-article-body>
          <p>Compound introduction</p>
          <h2>Human evidence</h2><p>No isolated efficacy trial.</p>
          <h2>Pharmacology</h2><p>Laboratory evidence.</p>
        </div>
        <aside>Article CTA</aside>
      </ContentCards>,
    )
    const body = container.querySelector('[data-article-body]')!
    expect(body.querySelector('.article-intro-card')).toHaveTextContent('Compound introduction')
    expect(body.querySelectorAll(':scope > .article-section-card')).toHaveLength(3)
    expect(screen.getByText('Article CTA').parentElement).toHaveClass('content-prose')
    expect(screen.getByRole('heading', { name: 'Human evidence' })).toBeVisible()
  })

  it('preserves direct-child content and self-contained editorial sections', () => {
    const { container } = render(
      <ContentCards>
        <p>Direct introduction</p>
        <h2>Safety</h2><p>Uncertain safety.</p>
        <section className="not-prose"><h2>Editorial verdict</h2><p>Evidence remains limited.</p></section>
      </ContentCards>,
    )
    expect(container.querySelector('.article-intro-card')).toHaveTextContent('Direct introduction')
    expect(screen.getByRole('heading', { name: 'Editorial verdict' }).parentElement).toHaveClass('not-prose')
    expect(container.querySelector('.article-section-card:not(.article-intro-card)')).not.toHaveTextContent('Editorial verdict')
  })
})
