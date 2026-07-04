import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdditiveRiskPanel from '../AdditiveRiskPanel'
import type { MechanismRisk } from '@/lib/interaction-risk'

function risk(overrides: Partial<MechanismRisk> = {}): MechanismRisk {
  return {
    mechanism: 'serotonergic',
    label: 'Serotonergic activity',
    severity: 'severe',
    partnerCount: 2,
    topPartners: [
      { slug: 'herb-b', name: 'Herb B' },
      { slug: 'herb-c', name: 'Herb C' },
    ],
    ...overrides,
  }
}

describe('AdditiveRiskPanel', () => {
  it('renders nothing when there are no risks', () => {
    const { container } = render(<AdditiveRiskPanel risks={[]} displayName="Ashwagandha" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the mechanism label, severity, and display name in the caution copy', () => {
    render(<AdditiveRiskPanel risks={[risk()]} displayName="Ashwagandha" />)

    expect(screen.getByText('Serotonergic activity')).toBeTruthy()
    expect(screen.getByText('severe')).toBeTruthy()
    expect(screen.getAllByText(/Ashwagandha/).length).toBeGreaterThan(0)
  })

  it('uses singular "supplement" wording when only one partner shares the flag', () => {
    const { container } = render(
      <AdditiveRiskPanel risks={[risk({ partnerCount: 1, topPartners: [{ slug: 'herb-b', name: 'Herb B' }] })]} displayName="Herb A" />,
    )
    expect(container.querySelector('.text-xs.text-muted')?.textContent).toMatch(/1\s*other supplement\s*share this flag/)
  })

  it('uses plural "supplements" wording when multiple partners share the flag', () => {
    const { container } = render(<AdditiveRiskPanel risks={[risk({ partnerCount: 2 })]} displayName="Herb A" />)
    expect(container.querySelector('.text-xs.text-muted')?.textContent).toMatch(/2\s*other supplements\s*share this flag/)
  })

  it('lists up to 3 example partners and appends a "+N more" count beyond that', () => {
    render(
      <AdditiveRiskPanel
        risks={[
          risk({
            partnerCount: 5,
            topPartners: [
              { slug: 'a', name: 'Herb A' },
              { slug: 'b', name: 'Herb B' },
              { slug: 'c', name: 'Herb C' },
            ],
          }),
        ]}
        displayName="Test Herb"
      />,
    )

    expect(screen.getByText(/Herb A, Herb B, Herb C/)).toBeTruthy()
    expect(screen.getByText(/\+2 more/)).toBeTruthy()
  })

  it('falls back to empty description text for an unrecognized mechanism', () => {
    render(<AdditiveRiskPanel risks={[risk({ mechanism: 'unknown_mechanism', label: 'Unknown Mechanism' })]} displayName="Test Herb" />)
    expect(screen.getByText('Unknown Mechanism')).toBeTruthy()
  })

  it('renders one card per risk mechanism', () => {
    render(
      <AdditiveRiskPanel
        risks={[risk({ mechanism: 'serotonergic', label: 'Serotonergic activity' }), risk({ mechanism: 'anticoagulant', label: 'Anticoagulant / bleeding' })]}
        displayName="Test Herb"
      />,
    )

    expect(screen.getByText('Serotonergic activity')).toBeTruthy()
    expect(screen.getByText('Anticoagulant / bleeding')).toBeTruthy()
  })
})
