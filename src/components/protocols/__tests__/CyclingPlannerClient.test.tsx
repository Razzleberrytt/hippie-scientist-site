import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CyclingPlannerClient from '../CyclingPlannerClient'

describe('CyclingPlannerClient Component', () => {
  it('renders with default selected ingredient (Caffeine)', () => {
    render(<CyclingPlannerClient />)

    expect(screen.getByText('1. Select Stack Components')).toBeInTheDocument()
    expect(screen.getByText('Caffeine Protocol')).toBeInTheDocument()
    expect(screen.getByText('Mon - Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat - Sun (weekly washout) or 1 full week')).toBeInTheDocument()
  })

  it('allows toggling stack ingredients to update protocol lists', () => {
    render(<CyclingPlannerClient />)

    // Initially Ashwagandha is not active
    expect(screen.queryByText('Ashwagandha Protocol')).not.toBeInTheDocument()

    // Select Ashwagandha to add it to planner
    const ashToggle = screen.getByText('Ashwagandha')
    fireEvent.click(ashToggle)

    expect(screen.getByText('Ashwagandha Protocol')).toBeInTheDocument()
    expect(screen.getByText('8 - 12 weeks')).toBeInTheDocument()
  })

  it('generates checkable tasks that can be crossed off', () => {
    render(<CyclingPlannerClient />)

    // There should be a task about caffeine washout
    const checkbox = screen.getByLabelText(/Schedule a 2-day weekend washout/i)
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })
})
