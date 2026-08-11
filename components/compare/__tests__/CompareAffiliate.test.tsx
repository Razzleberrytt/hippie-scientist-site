import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareAffiliate from '../CompareAffiliate'
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
    doNotMonetize: false,
    isHarmReduction: false,
    pageUrl: '/compounds/example',
    ...overrides,
  }
}

describe('CompareAffiliate', () => {
  it('does not render a product set for an item flagged doNotMonetize', () => {
    render(
      <CompareAffiliate
        item1={item({ slug: 'ashwagandha', name: 'Ashwagandha', type: 'herb', doNotMonetize: true })}
        item2={item({ slug: 'unlisted-test-compound', name: 'Unlisted Test Compound' })}
        isHR={false}
      />,
    )

    expect(screen.queryByRole('heading', { name: /product options/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/Ashwagandha/i)).not.toBeInTheDocument()
  })
})
