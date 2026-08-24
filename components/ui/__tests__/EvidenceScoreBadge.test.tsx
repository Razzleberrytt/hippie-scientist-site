import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EvidenceScoreBadge from '../EvidenceScoreBadge'

describe('EvidenceScoreBadge', () => {
  it('derives the letter grade from a record when no explicit grade is given', () => {
    const { container } = render(<EvidenceScoreBadge record={{ evidence_tier: 'Strong evidence' }} />)
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('Strong')).toBeTruthy()
    expect(screen.getByText('Profile-wide ·')).toBeTruthy()
    expect(container.querySelector('[data-evidence-scope="profile-wide"]')).toBeTruthy()
  })

  it('prefers an explicit grade prop over the record-derived grade', () => {
    render(<EvidenceScoreBadge record={{ evidence_tier: 'Strong evidence' }} grade="D" />)
    expect(screen.getByText('D')).toBeTruthy()
    expect(screen.getByText('Preliminary')).toBeTruthy()
  })

  it('reports an unassigned grade rather than inventing one', () => {
    // With no record and no grade there is nothing to grade. Defaulting to C
    // published an evidence grade the authored signals do not support, so the
    // badge now says so explicitly instead.
    const { container } = render(<EvidenceScoreBadge />)

    expect(screen.getByText('Unassigned')).toBeTruthy()
    expect(screen.getByText('Profile-wide ·')).toBeTruthy()
    expect(container.querySelector('[data-evidence-grade="Unassigned"]')).toBeTruthy()
    expect(screen.queryByText('C')).toBeNull()
  })

  it('hides the label text when showLabel is false', () => {
    render(<EvidenceScoreBadge grade="A" showLabel={false} />)
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.queryByText('Strong')).toBeNull()
    expect(screen.queryByText('Profile-wide ·')).toBeNull()
  })

  it('renders the circle variant with an accessible profile-wide label describing the full meaning', () => {
    render(<EvidenceScoreBadge grade="B" size="circle" />)
    expect(screen.getByLabelText(/Profile-wide evidence grade B: Moderate Evidence/)).toBeTruthy()
    expect(screen.getByText(/Profile-wide ·/)).toBeTruthy()
  })

  it('sets a title attribute with the full profile-wide grade meaning for all size variants', () => {
    const { container } = render(<EvidenceScoreBadge grade="A" />)
    const badge = container.firstElementChild as HTMLElement
    expect(badge.title).toMatch(/Profile-wide evidence grade A: Strong Evidence/)
  })
})
