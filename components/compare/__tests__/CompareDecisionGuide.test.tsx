import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareDecisionGuide from '../CompareDecisionGuide'
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

describe('CompareDecisionGuide', () => {
  it('compares evidence and safety coverage without selecting or dosing an option', () => {
    render(
      <CompareDecisionGuide
        item1={item({
          slug: 'magnesium',
          name: 'Magnesium',
          evidenceLevel: 'moderate',
          primaryBenefits: ['Sleep quality'],
          keyInteractions: ['some mineral-binding medications'],
        })}
        item2={item({
          slug: 'melatonin',
          name: 'Melatonin',
          evidenceLevel: 'strong',
          primaryBenefits: ['Sleep onset'],
          bestTiming: '30–60 minutes before bed',
        })}
        isHarmReduction={false}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Compare the evidence before choosing' })).toBeInTheDocument()
    expect(screen.getByText(/does not pick a supplement for you/i)).toBeInTheDocument()
    expect(screen.getByText('30–60 minutes before bed')).toBeInTheDocument()
    expect(screen.getByText(/No structured interactions surfaced here/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open safety checker/i })).toHaveAttribute('href', '/safety-checker')
    expect(screen.queryByText(/our suggestion/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/reasonable starting point/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/take .* morning/i)).not.toBeInTheDocument()
  })
})
