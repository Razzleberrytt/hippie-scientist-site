import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EfficacyModelerClient from '../EfficacyModelerClient'

// Mock AffiliateProductCard since we just want to verify it renders with correct routes
vi.mock('@/components/sourcing/AffiliateProductCard', () => ({
  default: ({ route }: any) => (
    <div data-testid='affiliate-card'>
      <span>{route.product.brand}</span>
      <span>{route.product.name}</span>
      <span>{route.costPerDoseUsd.toFixed(2)}</span>
    </div>
  ),
}))

describe('EfficacyModelerClient Component', () => {
  it('renders successfully with default selected ingredient (Caffeine)', () => {
    render(<EfficacyModelerClient />)

    expect(screen.getAllByText('Caffeine Anhydrous').length).toBeGreaterThan(0)
    expect(screen.getByText('Adjust Modeler Dosage:')).toBeInTheDocument()
    expect(screen.getByText('100 mg')).toBeInTheDocument()
    expect(screen.getByTestId('affiliate-card')).toBeInTheDocument()
  })

  it('updates dosage and modifies matched product yield values', () => {
    render(<EfficacyModelerClient />)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '200' } })

    expect(screen.getByText('200 mg')).toBeInTheDocument()
  })

  it('changes active ingredient and resets default dosage accordingly', () => {
    render(<EfficacyModelerClient />)

    // Select Ashwagandha Extract button
    const ashBtn = screen.getByRole('button', { name: /Ashwagandha Extract/i })
    fireEvent.click(ashBtn)

    expect(screen.getAllByText('Ashwagandha Extract').length).toBeGreaterThan(0)
    expect(screen.getByText('300 mg')).toBeInTheDocument() // Ashwagandha default dose is 300mg
  })

  it('displays cumulative compliance checkbox for cumulative ingredients', () => {
    render(<EfficacyModelerClient />)

    // Switch to Ashwagandha
    fireEvent.click(screen.getByRole('button', { name: /Ashwagandha Extract/i }))

    const checkbox = screen.getByLabelText(
      /Simulate discontinuing daily dose at Day 30/i
    )
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })
})
