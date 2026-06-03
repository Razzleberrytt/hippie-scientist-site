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
  }
]

const mockCompounds = [
  {
    slug: 'l-theanine',
    name: 'L-Theanine',
    dosage: '100 - 200 mg',
    cycling: 'No cycle required.',
    administration: 'Take with caffeine to balance stimulation.',
  }
]

describe('DosageCalculatorClient', () => {
  it('renders select element and default calculations', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    expect(screen.getByLabelText(/Select Ingredient/i)).toBeInTheDocument()
    expect(screen.getByText(/300 – 600 mg/i)).toBeInTheDocument() // Default intermediate dose for Ashwagandha
  })

  it('calculates beginner dosage (50% reduction)', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Toggle to Beginner
    const beginnerBtn = screen.getByText('Beginner')
    fireEvent.click(beginnerBtn)

    // Range should be halved: 150 – 300 mg
    expect(screen.getByText(/150 – 300 mg/i)).toBeInTheDocument()
  })

  it('calculates advanced dosage (30% increase)', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Toggle to Advanced
    const advancedBtn = screen.getByText('Advanced')
    fireEvent.click(advancedBtn)

    // Range should be multiplied by 1.3: 390 – 780 mg
    expect(screen.getByText(/390 – 780 mg/i)).toBeInTheDocument()
  })

  it('calculates molecular yields based on extract slider concentration changes', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Ashwagandha default is 5% withanolides.
    // Standard intermediate dose: 300 - 600 mg.
    // 5% of 300 is 15. 5% of 600 is 30.
    expect(screen.getByText(/15 – 30 mg/i)).toBeInTheDocument()

    // Change slider value to 10%
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: 10 } })

    // Yield at 10%: 30 - 60 mg
    expect(screen.getByText(/30 – 60 mg/i)).toBeInTheDocument()
  })

  it('adjusts dosage calculations based on weight scale bounds', () => {
    render(<DosageCalculatorClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Input light weight (under 120 lbs) -> reduces dose by 20%
    const weightInput = screen.getByLabelText(/Body Weight/i)
    fireEvent.change(weightInput, { target: { value: 100 } })

    // Standard intermediate: 300 - 600 mg. Reduced by 20%: 240 – 480 mg
    expect(screen.getByText(/240 – 480 mg/i)).toBeInTheDocument()
  })
})
