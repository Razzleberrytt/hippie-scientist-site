import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareDosing from '../CompareDosing'
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

describe('CompareDosing', () => {
  it('shows missing source data as missing instead of manufacturing generic timing and onset guidance', () => {
    render(
      <CompareDosing
        item1={item({ slug: 'magnesium', name: 'Magnesium', typicalDose: 'chelated mineral capsule or powder' })}
        item2={item({ slug: 'melatonin', name: 'Melatonin', bestTiming: '30–60 minutes before bed' })}
      />,
    )

    expect(screen.getAllByText('Dose / Form in Source Data')).toHaveLength(2)
    expect(screen.getAllByText('Onset in Source Data')).toHaveLength(2)
    expect(screen.getAllByText('Not reported in the comparison source data').length).toBeGreaterThan(0)
    expect(screen.getByText('chelated mineral capsule or powder')).toBeInTheDocument()
    expect(screen.getByText('30–60 minutes before bed')).toBeInTheDocument()
    expect(screen.queryByText(/2–4 weeks for adaptogens/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/with or without food/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Effective Dose')).not.toBeInTheDocument()
  })
})
