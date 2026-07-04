import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SafetyGaugeMeter from '../SafetyGaugeMeter'

describe('SafetyGaugeMeter', () => {
  it('renders the rounded score percentage and label', () => {
    render(<SafetyGaugeMeter score={72.4} label="Generally well tolerated" />)
    expect(screen.getByText('72%')).toBeTruthy()
    expect(screen.getByText('Generally well tolerated')).toBeTruthy()
  })

  it('clamps scores above 100 down to 100', () => {
    render(<SafetyGaugeMeter score={150} label="High" />)
    expect(screen.getByText('100%')).toBeTruthy()
  })

  it('clamps negative scores up to 0', () => {
    render(<SafetyGaugeMeter score={-20} label="Low" />)
    expect(screen.getByText('0%')).toBeTruthy()
  })

  it('exposes an accessible label on the SVG describing the clamped score', () => {
    render(<SafetyGaugeMeter score={45} label="Use caution" />)
    expect(screen.getByRole('img', { name: 'Safety meter: 45 out of 100 — Use caution' })).toBeTruthy()
  })
})
