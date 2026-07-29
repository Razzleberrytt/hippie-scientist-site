import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import ScientificTakeaways from '../ScientificTakeaways'

describe('ScientificTakeaways', () => {
  it('renders atomic claims, confidence, and qualifying context', () => {
    render(
      <ScientificTakeaways
        summary="What the evidence supports."
        items={[
          {
            claim: 'Blotter paper does not establish chemical identity.',
            confidence: 'High',
            context: 'The carrier can contain several potent compounds.',
          },
          {
            claim: 'Case reports cannot estimate the frequency of critical poisoning.',
            confidence: 'Moderate',
          },
        ]}
      />
    )

    expect(screen.getByRole('heading', { name: 'Scientific Takeaways' })).toBeInTheDocument()
    expect(screen.getByText('What the evidence supports.')).toBeInTheDocument()
    expect(screen.getByText('Blotter paper does not establish chemical identity.')).toBeInTheDocument()
    expect(screen.getByText('High confidence')).toBeInTheDocument()
    expect(screen.getByText('The carrier can contain several potent compounds.')).toBeInTheDocument()
  })

  it('uses unique accessible heading IDs for multiple blocks', () => {
    render(
      <>
        <ScientificTakeaways title="Mechanism" items={[{ claim: 'First claim.' }]} />
        <ScientificTakeaways title="Clinical meaning" items={[{ claim: 'Second claim.' }]} />
      </>
    )

    const headings = screen.getAllByRole('heading')
    const headingIds = headings.map((heading) => heading.id)
    const asides = screen.getAllByRole('complementary')

    expect(new Set(headingIds).size).toBe(headingIds.length)
    expect(asides[0]).toHaveAttribute('aria-labelledby', headings[0].id)
    expect(asides[1]).toHaveAttribute('aria-labelledby', headings[1].id)
  })

  it('renders nothing when no takeaways are supplied', () => {
    const { container } = render(<ScientificTakeaways items={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
