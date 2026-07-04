import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EvidenceScoreBadge from '../EvidenceScoreBadge'

describe('EvidenceScoreBadge', () => {
  it('derives the letter grade from a record when no explicit grade is given', () => {
    render(<EvidenceScoreBadge record={{ evidence_tier: 'Strong evidence' }} />)
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('Strong')).toBeTruthy()
  })

  it('prefers an explicit grade prop over the record-derived grade', () => {
    render(<EvidenceScoreBadge record={{ evidence_tier: 'Strong evidence' }} grade="D" />)
    expect(screen.getByText('D')).toBeTruthy()
    expect(screen.getByText('Traditional')).toBeTruthy()
  })

  it('defaults to grade C when neither record nor grade is given', () => {
    render(<EvidenceScoreBadge />)
    expect(screen.getByText('C')).toBeTruthy()
    expect(screen.getByText('Preliminary')).toBeTruthy()
  })

  it('hides the label text when showLabel is false', () => {
    render(<EvidenceScoreBadge grade="A" showLabel={false} />)
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.queryByText('Strong')).toBeNull()
  })

  it('renders the circle variant with an accessible label describing the full meaning', () => {
    render(<EvidenceScoreBadge grade="B" size="circle" />)
    expect(screen.getByLabelText(/Evidence grade B: Moderate Evidence/)).toBeTruthy()
  })

  it('sets a title attribute with the full grade meaning for all size variants', () => {
    const { container } = render(<EvidenceScoreBadge grade="A" />)
    const badge = container.firstElementChild as HTMLElement
    expect(badge.title).toMatch(/Strong Evidence/)
  })
})
