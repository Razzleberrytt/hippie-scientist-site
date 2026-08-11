import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareEvidenceMatrix from '../CompareEvidenceMatrix'
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

describe('CompareEvidenceMatrix', () => {
  it('shows profile evidence signals without declaring a head-to-head winner', () => {
    render(
      <CompareEvidenceMatrix
        item1={item({ name: 'Magnesium', evidenceLevel: 'moderate' })}
        item2={item({ name: 'Melatonin', evidenceLevel: 'strong' })}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Evidence Signals Side by Side' })).toBeInTheDocument()
    expect(screen.getByText(/without treating them as a head-to-head efficacy ranking/i)).toBeInTheDocument()
    expect(screen.queryByText(/Stronger evidence/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Similar evidence base/i)).not.toBeInTheDocument()
  })
})
