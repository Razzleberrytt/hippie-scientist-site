import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import CompareSummaryTable from '../CompareSummaryTable'
import type { CompareItem } from '@/lib/compare'

function compareItem(overrides: Partial<CompareItem> = {}): CompareItem {
  return {
    slug: 'ashwagandha',
    name: 'Ashwagandha',
    type: 'herb',
    description: 'An adaptogenic herb.',
    primaryBenefits: ['Stress support'],
    mechanisms: ['GABA modulation'],
    canonicalMechanisms: ['GABA modulation'],
    mechanismCategories: ['calming'],
    evidenceGrade: 'B',
    evidenceTier: 'Human evidence',
    evidenceLevel: 'moderate',
    typicalDose: '300 mg',
    onsetTime: '30–60 minutes',
    bestTiming: 'Evening',
    keyInteractions: [],
    sideEffects: [],
    contraindications: [],
    category: 'Adaptogen',
    safety: 'Generally well tolerated.',
    sources: [],
    doNotMonetize: false,
    isHarmReduction: false,
    pageUrl: '/herbs/ashwagandha',
    ...overrides,
  }
}

describe('CompareSummaryTable', () => {
  const item1 = compareItem()
  const item2 = compareItem({
    slug: 'l-theanine',
    name: 'L-theanine',
    type: 'compound',
    primaryBenefits: ['Calm focus'],
    canonicalMechanisms: ['Glutamate modulation'],
    mechanisms: ['Glutamate modulation'],
    evidenceGrade: 'A',
    evidenceLevel: 'strong',
    typicalDose: '200 mg',
    pageUrl: '/compounds/l-theanine',
  })

  it('provides a keyboard-reachable labelled region for the desktop table', () => {
    const { container } = render(<CompareSummaryTable item1={item1} item2={item2} />)

    const region = screen.getByRole('region', {
      name: 'Ashwagandha and L-theanine comparison summary',
    })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toHaveAttribute('aria-describedby')
    expect(container.querySelector('.responsive-table-title')).toBeNull()
  })

  it('uses a real caption and row headers in the desktop table', () => {
    render(<CompareSummaryTable item1={item1} item2={item2} />)

    expect(
      screen.getByRole('table', {
        name: /Core tradeoffs between Ashwagandha and L-theanine/i,
      }),
    ).toBeTruthy()
    expect(screen.getAllByRole('rowheader', { name: 'Best for' })).toHaveLength(2)
  })

  it('exposes the compact mobile grid with table semantics', () => {
    render(<CompareSummaryTable item1={item1} item2={item2} />)

    const mobileTable = screen.getByRole('table', {
      name: 'Ashwagandha and L-theanine comparison summary',
    })
    expect(within(mobileTable).getByRole('columnheader', { name: 'Factor' })).toBeTruthy()
    expect(within(mobileTable).getByRole('columnheader', { name: 'Ashwagandha' })).toBeTruthy()
    expect(within(mobileTable).getByRole('columnheader', { name: 'L-theanine' })).toBeTruthy()
    expect(within(mobileTable).getByRole('rowheader', { name: 'Evidence' })).toBeTruthy()
  })
})
