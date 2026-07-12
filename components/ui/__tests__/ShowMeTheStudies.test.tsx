import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ShowMeTheStudies from '../ShowMeTheStudies'
import type { Citation } from '../ShowMeTheStudies'

function citation(overrides: Partial<Citation> = {}): Citation {
  return { title: 'A study title', ...overrides }
}

describe('ShowMeTheStudies', () => {
  it('renders nothing when there are no citations', () => {
    const { container } = render(<ShowMeTheStudies citations={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when citations is null/undefined', () => {
    const { container } = render(<ShowMeTheStudies citations={undefined as unknown as Citation[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the citation count in the collapsed summary heading', () => {
    render(<ShowMeTheStudies citations={[citation()]} />)
    expect(screen.getByText(/Clinical Study Summaries \(1\)/)).toBeTruthy()
  })

  it('shows the total count for more than one citation', () => {
    render(<ShowMeTheStudies citations={[citation({ title: 'A' }), citation({ title: 'B' })]} />)
    expect(screen.getByText(/Clinical Study Summaries \(2\)/)).toBeTruthy()
  })

  it('links the study title and "PubMed" cell to PubMed when a pmid is present', () => {
    render(<ShowMeTheStudies citations={[citation({ title: 'Ashwagandha RCT', pmid: '12345678' })]} />)
    const links = screen.getAllByRole('link', { name: /Ashwagandha RCT|PubMed/ })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/12345678/')
    }
  })

  it('links DOI-only studies to the DOI resolver', () => {
    render(<ShowMeTheStudies citations={[citation({ title: 'L-theanine trial', doi: '10.1000/example-doi' })]} />)
    const links = screen.getAllByRole('link', { name: /L-theanine trial|DOI/ })
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link).toHaveAttribute('href', 'https://doi.org/10.1000/example-doi')
    }
  })

  it('uses an explicit source URL when one is provided', () => {
    render(<ShowMeTheStudies citations={[citation({ title: 'Publisher study', url: 'https://example.com/study' })]} />)
    const links = screen.getAllByRole('link', { name: /Publisher study|Source/ })
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link).toHaveAttribute('href', 'https://example.com/study')
    }
  })

  it('shows a plain dash instead of a source link when no identifier is present', () => {
    render(<ShowMeTheStudies citations={[citation({ title: 'No PMID Study' })]} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('shows sample size as "n=<value>" when provided, otherwise a dash', () => {
    render(<ShowMeTheStudies citations={[citation({ title: 'Sized study', sampleSize: 42 })]} />)
    expect(screen.getByText('n=42')).toBeTruthy()
  })

  it('keeps the first 6 citations visible and moves the rest behind a "Show N more" disclosure', () => {
    const citations = Array.from({ length: 9 }, (_, i) => citation({ title: `Study ${i}` }))
    const { container } = render(<ShowMeTheStudies citations={citations} />)

    expect(container.querySelectorAll('tbody tr')).toHaveLength(9)
    expect(screen.getByText('Show 3 more studies')).toBeTruthy()
  })

  it('omits the overflow disclosure entirely when 6 or fewer citations are given', () => {
    const citations = Array.from({ length: 6 }, (_, i) => citation({ title: `Study ${i}` }))
    render(<ShowMeTheStudies citations={citations} />)
    // The whole module is one collapsed <details>; no nested "Show N more" disclosure.
    expect(screen.queryByText(/Show \d+ more/)).toBeNull()
  })
})
