import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfileEvidenceLens from '../ProfileEvidenceLens'

describe('ProfileEvidenceLens', () => {
  it('shows the strong-evidence meter and label for a strong-evidence record', () => {
    render(<ProfileEvidenceLens record={{ slug: 'test', evidence_tier: 'Strong evidence' }} />)
    expect(screen.getByText('Strong')).toBeTruthy()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('falls back to the "limited" meter for an unrecognized tier', () => {
    render(<ProfileEvidenceLens record={{ slug: 'test' }} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  })

  it('flags human clinical evidence as present when the record signals it', () => {
    render(<ProfileEvidenceLens record={{ slug: 'test', evidence_tier: 'Strong human clinical trial evidence' }} />)
    expect(screen.getByText('Present in source signals')).toBeTruthy()
  })

  it('flags human clinical evidence as absent for animal/preclinical-only records', () => {
    render(<ProfileEvidenceLens record={{ slug: 'test', evidence_tier: 'Preclinical animal studies only' }} />)
    expect(screen.getByText('Not the primary signal')).toBeTruthy()
  })

  it('lists cleaned mechanism labels when mechanisms are present', () => {
    render(<ProfileEvidenceLens record={{ slug: 'test', mechanisms: ['gaba_modulation', 'cortisol_reduction'] }} />)
    expect(screen.getByText(/Gaba Modulation/)).toBeTruthy()
  })

  it('uses singular "study" wording for exactly one citation', () => {
    render(<ProfileEvidenceLens record={{ slug: 'test' }} citationsCount={1} />)
    expect(screen.getByText('This profile cites 1 human study.')).toBeTruthy()
  })

  it('uses plural "studies" wording for more than one citation', () => {
    render(<ProfileEvidenceLens record={{ slug: 'test' }} citationsCount={4} />)
    expect(screen.getByText('This profile cites 4 human studies.')).toBeTruthy()
  })

  it('omits the citation count line entirely when citationsCount is 0', () => {
    render(<ProfileEvidenceLens record={{ slug: 'test' }} citationsCount={0} />)
    expect(screen.queryByText(/human stud/)).toBeNull()
  })
})
