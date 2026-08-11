import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareHero from '../CompareHero'
import type { CompareItem } from '@/lib/compare'

function item(overrides: Partial<CompareItem>): CompareItem {
  return {
    slug: 'example',
    name: 'Example',
    type: 'compound',
    description: 'Example profile.',
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

describe('CompareHero', () => {
  it('frames profile signals as investigation cues instead of a personal recommendation', () => {
    render(
      <CompareHero
        item1={item({ slug: 'magnesium', name: 'Magnesium', primaryBenefits: ['Sleep quality'] })}
        item2={item({ slug: 'melatonin', name: 'Melatonin', primaryBenefits: ['Sleep onset'] })}
      />,
    )

    expect(screen.getByRole('link', { name: /open decision guide/i })).toHaveAttribute('href', '#compare-decision')
    expect(screen.getByText(/not proof that either option is better for your specific goal/i)).toBeInTheDocument()
    expect(screen.queryByText(/get a personal pick/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/typically chosen/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/tends to be favored/i)).not.toBeInTheDocument()
  })

  it('uses the central evidence scale instead of a hero-specific inflated score', () => {
    render(
      <CompareHero
        item1={item({ name: 'Unknown Example', evidenceLevel: 'unknown' })}
        item2={item({ name: 'Preliminary Example', evidenceLevel: 'preliminary' })}
      />,
    )

    expect(screen.getByLabelText('Evidence unknown (0 of 5)')).toBeInTheDocument()
    expect(screen.getByLabelText('Preliminary evidence (2 of 5)')).toBeInTheDocument()
  })
})
