import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CompareSynergy from '../CompareSynergy'
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

describe('CompareSynergy', () => {
  it('does not infer compatibility or manufacture a combined dosing protocol from mechanisms', () => {
    render(
      <CompareSynergy
        item1={item({
          slug: 'magnesium',
          name: 'Magnesium',
          canonicalMechanisms: ['NMDA modulation'],
          keyInteractions: ['separate from some medications that bind minerals'],
        })}
        item2={item({
          slug: 'melatonin',
          name: 'Melatonin',
          canonicalMechanisms: ['MT1/MT2 signaling'],
          bestTiming: '30–60 minutes before bed',
        })}
      />,
    )

    expect(screen.getByText(/compatibility not established here/i)).toBeInTheDocument()
    expect(screen.getByText(/mechanism matching alone cannot establish/i)).toBeInTheDocument()
    expect(screen.getByText(/magnesium: interaction/i)).toBeInTheDocument()
    expect(screen.getByText('30–60 minutes before bed')).toBeInTheDocument()
    expect(screen.queryByText(/generally compatible/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/reduce dose/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/morning — with or without food/i)).not.toBeInTheDocument()
  })
})
