import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HerbList from '../components/HerbList'
import type { Herb } from '../types'

const validHerb: Herb = {
  id: 'test',
  name: 'Test Herb',
  slug: 'test-herb',
  category: 'Test',
  effects: ['Calm'],
  tags: [],
  legalStatus: 'Legal',
  affiliateLink: '',
  activeConstituents: [],
  mechanismOfAction: '',
}

describe('HerbList', () => {
  it('renders fallback on invalid data', () => {
    // @ts-expect-error
    render(<HerbList herbs={[{ id: 'x' } as any]} />)
    expect(screen.getByText(/error loading herb entries/i)).toBeInTheDocument()
  })

  it('handles empty list gracefully', () => {
    render(<HerbList herbs={[]} />)
    expect(screen.getByText(/no herbs match/i)).toBeInTheDocument()
  })

  it('renders valid herbs', () => {
    render(<HerbList herbs={[validHerb]} />)
    expect(screen.getByText('Test Herb')).toBeInTheDocument()
  })
})
