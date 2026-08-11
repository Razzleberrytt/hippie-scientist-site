import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareFAQ from '../CompareFAQ'

describe('CompareFAQ', () => {
  it('routes readers back to a neutral decision guide instead of promising a personal pick', () => {
    render(
      <CompareFAQ
        faqs={[{ question: 'Which is better?', answer: 'It depends on the evidence and safety tradeoffs.' }]}
      />,
    )

    expect(screen.getByText('Need a clearer next step?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /review decision guide/i })).toHaveAttribute('href', '#compare-decision')
    expect(screen.queryByText(/personal pick/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/preference quiz/i)).not.toBeInTheDocument()
  })
})
