import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SafetyBadge, { normalizeSafetyLevel } from '../SafetyBadge'

describe('normalizeSafetyLevel', () => {
  it('maps well-tolerated / low risk strings to lowCaution', () => {
    expect(normalizeSafetyLevel('generally safe')).toBe('lowCaution')
    expect(normalizeSafetyLevel('well-tolerated')).toBe('lowCaution')
    expect(normalizeSafetyLevel('low risk')).toBe('lowCaution')
    // bare "safe" downgrades to lowCaution, not an overclaim
    expect(normalizeSafetyLevel('safe')).toBe('lowCaution')
  })

  it('maps caution / interaction strings to caution', () => {
    expect(normalizeSafetyLevel('caution with MAOIs')).toBe('caution')
    expect(normalizeSafetyLevel('moderate risk')).toBe('caution')
    expect(normalizeSafetyLevel('drug interaction noted')).toBe('caution')
  })

  it('maps review / limited / unknown strings to review', () => {
    expect(normalizeSafetyLevel('limited data')).toBe('review')
    expect(normalizeSafetyLevel('unknown')).toBe('review')
    expect(normalizeSafetyLevel('under review')).toBe('review')
    expect(normalizeSafetyLevel('unclear')).toBe('review')
  })

  it('returns unknown for null/undefined/empty', () => {
    expect(normalizeSafetyLevel(null)).toBe('unknown')
    expect(normalizeSafetyLevel(undefined)).toBe('unknown')
    expect(normalizeSafetyLevel('')).toBe('unknown')
  })
})

describe('SafetyBadge', () => {
  it('renders lowCaution with Caution mapped label', () => {
    render(<SafetyBadge level="lowCaution" />)
    expect(screen.getByText('Caution mapped')).toBeTruthy()
  })

  it('renders caution with Caution noted label', () => {
    render(<SafetyBadge level="caution" />)
    expect(screen.getByText('Caution noted')).toBeTruthy()
  })

  it('renders review label for review and unknown', () => {
    const { rerender } = render(<SafetyBadge level="review" />)
    expect(screen.getByText('Safety review')).toBeTruthy()

    rerender(<SafetyBadge level="unknown" />)
    expect(screen.getByText('Safety review')).toBeTruthy()
  })

  it('renders custom label override from data', () => {
    render(<SafetyBadge level="caution" label="Avoid with SSRIs" />)
    expect(screen.getByText('Avoid with SSRIs')).toBeTruthy()
  })

  it('never renders the word Safe as a standalone claim', () => {
    const { container } = render(<SafetyBadge level="lowCaution" />)
    // Should not find a text node that is exactly "Safe"
    expect(container.textContent).not.toBe('Safe')
    expect(container.textContent).not.toContain('✓Safe')
  })
})
