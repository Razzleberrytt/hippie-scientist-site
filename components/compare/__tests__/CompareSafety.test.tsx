import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareSafety from '../CompareSafety'
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

describe('CompareSafety', () => {
  it('renders missing safety fields as unknown rather than none-known claims', () => {
    render(
      <CompareSafety
        item1={item({ slug: 'magnesium', name: 'Magnesium' })}
        item2={item({ slug: 'melatonin', name: 'Melatonin', keyInteractions: ['sedating medicines'] })}
      />,
    )

    expect(screen.getAllByText(/missing data do not mean that no risk or interaction exists/i).length).toBeGreaterThan(0)
    expect(screen.getByText('sedating medicines')).toBeInTheDocument()
    expect(screen.queryByText(/none commonly reported/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/no major contraindications documented/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/no major interactions documented/i)).not.toBeInTheDocument()
  })
})
