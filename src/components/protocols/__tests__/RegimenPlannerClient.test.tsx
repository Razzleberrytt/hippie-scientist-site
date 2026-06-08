import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RegimenPlannerClient from '../RegimenPlannerClient'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockHerbs = [
  {
    slug: 'kava',
    name: 'Kava Extract',
    dosage: '100 mg',
    safety: 'Caution: Sedative. Drowsiness warning.',
    mechanism: 'GABA-A positive allosteric modulator.',
  },
  {
    slug: 'green-tea',
    name: 'Green Tea Extract',
    dosage: '250 mg',
    safety: 'Contains caffeine. Can act as mild stimulant.',
    mechanism: 'EGCG and mild caffeine stimulant activity.',
  }
]

const mockCompounds = [
  {
    slug: 'caffeine',
    name: 'Caffeine',
    dosage: '150 mg',
    safety: 'Stimulant. Sleep disruption risk.',
    mechanism: 'Adenosine receptor antagonist. Stimulant.',
  },
  {
    slug: 'valerian',
    name: 'Valerian Root',
    dosage: '300 mg',
    safety: 'Caution: Sedative load.',
    mechanism: 'GABAergic.',
  }
]

describe('RegimenPlannerClient', () => {
  it('renders default slots and empty warning', () => {
    render(<RegimenPlannerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    expect(screen.getByText(/Schedule an Ingredient/i)).toBeInTheDocument()
    expect(screen.getByText(/Add ingredients to intervals to trigger cumulative warnings/i)).toBeInTheDocument()
  })

  it('allows scheduling an item to a specific daily interval', () => {
    render(<RegimenPlannerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Add Kava to Morning (default slot is Morning)
    const input = screen.getByPlaceholderText(/Search to add to Morning schedule/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kava' } })
    fireEvent.click(screen.getByText('Kava Extract'))

    expect(screen.getAllByText('Morning').length).toBeGreaterThan(0)
    expect(screen.getByText('Kava Extract')).toBeInTheDocument()
  })

  it('audits and flags late-day stimulant warning if caffeine is placed in Evening/Pre-bed', () => {
    render(<RegimenPlannerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Click "Add to Evening" to change active slot
    fireEvent.click(screen.getByRole('button', { name: /Add to Evening/i }))

    // Add Caffeine
    const input = screen.getByPlaceholderText(/Search to add to Evening schedule/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Caffeine' } })
    fireEvent.click(screen.getAllByText('Caffeine')[0])

    // Expect late-day warning
    expect(screen.getByText(/Sleep Disruption Risk/i)).toBeInTheDocument()
    expect(screen.getByText(/Caffeine is scheduled in the evening/i)).toBeInTheDocument()
  })

  it('audits and flags cumulative caffeine overload (>400mg)', () => {
    render(<RegimenPlannerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Add Caffeine to Morning
    fireEvent.click(screen.getByRole('button', { name: /Add to Morning/i }))
    const inputMorning = screen.getByPlaceholderText(/Search to add to Morning schedule/i)
    fireEvent.focus(inputMorning)
    fireEvent.change(inputMorning, { target: { value: 'Caffeine' } })
    fireEvent.click(screen.getAllByText('Caffeine')[0])

    // Add Caffeine to Afternoon (150mg + 150mg = 300mg)
    fireEvent.click(screen.getByRole('button', { name: /Add to Afternoon/i }))
    const inputAfternoon = screen.getByPlaceholderText(/Search to add to Afternoon schedule/i)
    fireEvent.focus(inputAfternoon)
    fireEvent.change(inputAfternoon, { target: { value: 'Caffeine' } })
    fireEvent.click(screen.getAllByText('Caffeine')[0])

    // Add Caffeine to Evening (300mg + 150mg = 450mg > 400mg limit)
    fireEvent.click(screen.getByRole('button', { name: /Add to Evening/i }))
    const inputEvening = screen.getByPlaceholderText(/Search to add to Evening schedule/i)
    fireEvent.focus(inputEvening)
    fireEvent.change(inputEvening, { target: { value: 'Caffeine' } })
    fireEvent.click(screen.getAllByText('Caffeine')[0])

    expect(screen.getByText(/Caffeine Overload Alert/i)).toBeInTheDocument()
    expect(screen.getByText(/exceeding the recommended daily limit of 400mg/i)).toBeInTheDocument()
  })

  it('clears scheduled items when Clear Schedule is clicked', () => {
    render(<RegimenPlannerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Add Kava to Morning
    const input = screen.getByPlaceholderText(/Search to add to Morning schedule/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kava' } })
    fireEvent.click(screen.getByText('Kava Extract'))

    expect(screen.getByText('Kava Extract')).toBeInTheDocument()

    // Click Clear
    fireEvent.click(screen.getByRole('button', { name: /Clear Schedule/i }))

    expect(screen.queryByRole('link', { name: 'Kava Extract' })).not.toBeInTheDocument()
  })
})
