import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SubstitutionEnginePanel from '../SubstitutionEnginePanel'

// Mock AffiliateProductCard since we just want to verify it renders with correct routes
vi.mock('../AffiliateProductCard', () => ({
  default: ({ route }: any) => (
    <div data-testid='affiliate-card'>
      <span>{route.product.brand}</span>
      <span>{route.product.name}</span>
    </div>
  ),
}))

describe('SubstitutionEnginePanel Component', () => {
  it('renders successfully with default Caffeine selection', () => {
    render(<SubstitutionEnginePanel />)

    expect(screen.getByText('1. Select Ingredient to Replace')).toBeInTheDocument()
    expect(screen.getByText('Caffeine / Stimulants')).toBeInTheDocument()
    expect(screen.getByText('Stimulant Sensitivity / Jitters')).toBeInTheDocument()
    expect(screen.getByText(/Caffeine acts as a non-selective adenosine antagonist/i).textContent).toBeDefined()
    expect(screen.getAllByTestId('affiliate-card').length).toBeGreaterThan(0)
  })

  it('updates alternative recommendations when choosing a different reason', () => {
    render(<SubstitutionEnginePanel />)

    // Switch to sleep disorders reason
    const sleepBtn = screen.getByText('Sleep Disorders / Insomnia')
    fireEvent.click(sleepBtn)

    expect(screen.getByText('Substitute: Rhodiola Rosea')).toBeInTheDocument()
  })

  it('updates alternative recommendations when choosing a different ingredient', () => {
    render(<SubstitutionEnginePanel />)

    // Switch to Ashwagandha
    const ashBtn = screen.getByText('Ashwagandha')
    fireEvent.click(ashBtn)

    expect(screen.getByText('Thyroid Disorders / Hyperthyroidism')).toBeInTheDocument()
    expect(screen.getByText('Substitute: L-Theanine')).toBeInTheDocument()
  })
})
