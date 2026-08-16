import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfileEvidenceLens from '../ProfileEvidenceLens'

describe('ProfileEvidenceLens research maturity', () => {
  it('shows preliminary research distinctly for preclinical-only records', () => {
    const { container } = render(
      <ProfileEvidenceLens
        record={{
          slug: 'example',
          evidence_tier: 'Preclinical animal studies only',
          mechanisms: ['receptor modulation'],
        }}
      />,
    )

    expect(screen.getByText('Preliminary research')).toBeTruthy()
    expect(container.querySelector('[data-research-maturity="preliminary"]')).toBeTruthy()
    expect(container.querySelector('[data-research-visual-weight="muted"]')).toBeTruthy()
  })

  it('shows established research distinctly for strong human evidence', () => {
    const { container } = render(
      <ProfileEvidenceLens record={{ slug: 'example', evidence_tier: 'Strong human clinical trial evidence' }} />,
    )

    expect(screen.getByText('Established research')).toBeTruthy()
    expect(container.querySelector('[data-research-maturity="established"]')).toBeTruthy()
  })
})
