import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareMechanisms from '../CompareMechanisms'
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

describe('CompareMechanisms', () => {
  it('shows mechanism context without manufacturing a pathway to a benefit', () => {
    render(
      <CompareMechanisms
        item1={item({ name: 'Magnesium', mechanisms: ['NMDA modulation'], primaryBenefits: ['Sleep quality'] })}
        item2={item({ name: 'Melatonin', mechanisms: ['MT1/MT2 signaling'], primaryBenefits: ['Sleep onset'] })}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Proposed Mechanisms Side by Side' })).toBeInTheDocument()
    expect(screen.getAllByText(/do not by themselves prove a clinical benefit/i)).toHaveLength(2)
    expect(screen.queryByText(/NMDA modulation.*Sleep quality/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Pathway$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/How Magnesium Works/i)).not.toBeInTheDocument()
  })
})
