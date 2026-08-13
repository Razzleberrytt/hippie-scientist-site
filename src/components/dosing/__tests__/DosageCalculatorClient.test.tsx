import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DosageCalculatorClient from '../DosageCalculatorClient'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockHerbs = [
  {
    slug: 'ashwagandha',
    name: 'Ashwagandha',
    dosage: '300 - 600 mg',
    cycling: 'Cycle: 8 weeks on, 2 weeks off.',
    administration: 'Take with fat-soluble meal.',
  },
]

const mockCompounds = [
  {
    slug: 'l-theanine',
    name: 'L-Theanine',
    dosage: '100 - 200 mg',
  },
  {
    slug: 'unknown-compound',
    name: 'Unknown Compound',
  },
]

describe('DosageCalculatorClient', () => {
  it('shows recorded source context without personalized weight scaling or protocol advice', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)

    expect(screen.getByLabelText(/Select ingredient/i)).toBeInTheDocument()
    expect(screen.getByText(/300 - 600 mg/i)).toBeInTheDocument()
    expect(screen.getByText(/300 – 600 mg/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Body Weight/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Customized Dosage/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Cycling Recommendations/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Take with fat-soluble meal/i)).not.toBeInTheDocument()
  })

  it('calculates active-marker arithmetic only after the user supplies a label percentage', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)

    expect(screen.getByText(/Set the label percentage to calculate/i)).toBeInTheDocument()

    const slider = screen.getByLabelText(/Active marker on your label/i)
    fireEvent.change(slider, { target: { value: 5 } })

    expect(screen.getByText(/15 – 30 mg/i)).toBeInTheDocument()
  })

  it('does not fabricate a fallback range when a profile has no recorded dose', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)

    fireEvent.change(screen.getByLabelText(/Select ingredient/i), {
      target: { value: 'unknown-compound' },
    })

    expect(screen.getByText(/No dose range is recorded for this profile/i)).toBeInTheDocument()
    expect(screen.getByText(/No safe automatic conversion available/i)).toBeInTheDocument()
    expect(screen.queryByText(/300 – 600 mg/i)).not.toBeInTheDocument()
  })
})
