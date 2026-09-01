import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DecisionToProductEndpoint from '../DecisionToProductEndpoint'
import { getCompounds, getHerbs } from '@/lib/runtime-data'

vi.mock('@/lib/runtime-data', () => ({
  getHerbs: vi.fn(),
  getCompounds: vi.fn(),
}))

const candidates = [
  {
    slug: 'magnesium',
    label: 'Magnesium',
    fit: 'A plausible relaxation option with limited-to-moderate evidence.',
    safetyCheck: 'Kidney impairment changes the safety picture.',
    qualitySignals: ['Clear elemental-magnesium labeling', 'Third-party quality verification'],
    profileHref: '/compounds/magnesium/',
  },
  {
    slug: 'l-theanine',
    label: 'L-Theanine',
    fit: 'Promising subjective sleep-quality evidence.',
    safetyCheck: 'Review sedative stacking and blood-pressure context.',
    qualitySignals: ['Single-ingredient labeling', 'Transparent serving size'],
    profileHref: '/compounds/l-theanine/',
  },
]

describe('DecisionToProductEndpoint', () => {
  beforeEach(() => {
    vi.mocked(getHerbs).mockResolvedValue([] as never)
    vi.mocked(getCompounds).mockResolvedValue([
      { slug: 'magnesium', monetization_allowed: true },
      { slug: 'l-theanine', monetization_allowed: false },
    ] as never)
  })

  it('shows commerce only for a runtime-governed eligible record and preserves tracking/disclosure', async () => {
    render(await DecisionToProductEndpoint({ candidates, trackingLocation: 'sleep-decision-endpoint' }))

    expect(screen.getByText(/affiliate disclosure/i)).toBeInTheDocument()

    const affiliateLinks = screen.getAllByRole('link', { name: /review on amazon/i })
    expect(affiliateLinks).toHaveLength(1)
    expect(affiliateLinks[0]).toHaveAttribute('data-ingredient', 'magnesium')
    expect(affiliateLinks[0]).toHaveAttribute('data-tracking-location', 'sleep-decision-endpoint')
    expect(affiliateLinks[0]).toHaveAttribute('rel', 'nofollow sponsored noopener noreferrer')

    expect(screen.getByText('L-Theanine').closest('article')).toHaveTextContent(/no governed product action is shown/i)
    expect(screen.getByRole('link', { name: /review evidence and safety/i })).toHaveAttribute('href', '/compounds/l-theanine')
  })

  it('renders no affiliate disclosure or sponsored anchor when every runtime record is blocked', async () => {
    vi.mocked(getCompounds).mockResolvedValue([
      { slug: 'magnesium', monetization_allowed: false },
      { slug: 'l-theanine', monetization_allowed: false },
    ] as never)

    render(await DecisionToProductEndpoint({ candidates, trackingLocation: 'sleep-decision-endpoint' }))

    expect(screen.queryByText(/affiliate disclosure/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /review on amazon/i })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /review evidence and safety/i })).toHaveLength(2)
  })
})
