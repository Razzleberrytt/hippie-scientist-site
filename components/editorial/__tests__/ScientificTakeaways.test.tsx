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

  it('renders nothing when no takeaways are supplied', () => {
    const { container } = render(<ScientificTakeaways items={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
