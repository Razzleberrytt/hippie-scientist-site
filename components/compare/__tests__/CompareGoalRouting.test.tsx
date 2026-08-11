import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareGoalRouting from '../CompareGoalRouting'
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

describe('CompareGoalRouting', () => {
  it('uses keyword matches as navigation signals instead of efficacy winners', () => {
    render(
      <CompareGoalRouting
        item1={item({ slug: 'magnesium', name: 'Magnesium', mechanisms: ['oxidative stress modulation'] })}
        item2={item({ slug: 'melatonin', name: 'Melatonin', description: 'Supports sleep timing.' })}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Where the Profile Data Mention Each Goal' })).toBeInTheDocument()
    expect(screen.getByText(/not to rank efficacy or declare a winner/i)).toBeInTheDocument()
    expect(screen.getByText('Melatonin profile signal')).toBeInTheDocument()
    expect(screen.queryByText(/Melatonin wins/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^TIE$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/directly targets/i)).not.toBeInTheDocument()
  })
})
