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
    cycling: 'No cycle required.',
    administration: 'Take with caffeine to balance stimulation.',
  },
]

describe('DosageCalculatorClient', () => {
  it('renders ingredient selection and conservative default calculations', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)

    expect(screen.getByLabelText(/Select Ingredient/i)).toBeInTheDocument()
    expect(screen.getByText(/300 – 600 mg/i)).toBeInTheDocument()
    expect(screen.queryByText(/Beginner/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Intermediate/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Advanced/i)).not.toBeInTheDocument()
  })

  it('calculates molecular yields based on extract slider concentration changes', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)

    // Ashwagandha default is 5% withanolides.
    // Standard reference dose: 300 - 600 mg.
    // 5% of 300 is 15. 5% of 600 is 30.
    expect(screen.getByText(/15 – 30 mg/i)).toBeInTheDocument()

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: 10 } })

    expect(screen.getByText(/30 – 60 mg/i)).toBeInTheDocument()
  })

  it('adjusts dosage calculations based on weight scale bounds', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)

    const weightInput = screen.getByLabelText(/Body Weight/i)
    fireEvent.change(weightInput, { target: { value: 100 } })

    expect(screen.getByText(/240 – 480 mg/i)).toBeInTheDocument()
  })
})
