import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareCitations from '../CompareCitations'
import type { CompareItem } from '@/lib/compare'

function item(overrides: Partial<CompareItem>): CompareItem {
  return {
    slug: 'example',
    name: 'Example',
    type: 'compound',
    description: '',
    primaryBenefits: [],
    mechanisms: [],
    canonicalMechanisms: [],
    mechanismCategories: [],
    evidenceLevel: 'unknown',
    sources: [],
    doNotMonetize: false,
    isHarmReduction: false,
    pageUrl: '/compounds/example',
    ...overrides,
  }
}

describe('CompareCitations', () => {
  it('states missing comparison citations explicitly without inventing a review date', () => {
    render(
      <CompareCitations
        item1={item({ slug: 'magnesium', name: 'Magnesium' })}
        item2={item({ slug: 'melatonin', name: 'Melatonin' })}
      />,
    )

    expect(screen.getByText(/No source-level citations are surfaced in this comparison record/i)).toBeInTheDocument()
    expect(screen.queryByText(/Sources forthcoming/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Last reviewed:/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read Magnesium profile/i })).toHaveAttribute('href', '/compounds/example')
  })
})
