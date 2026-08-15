import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfileEvidenceLens from '../ProfileEvidenceLens'

describe('ProfileEvidenceLens research maturity', () => {
  it('shows theoretical research distinctly for preclinical-only records', () => {
    const { container } = render(
      <ProfileEvidenceLens
        record={{
          slug: 'example',
          evidence_tier: 'Preclinical animal studies only',
          mechanisms: ['receptor modulation'],
        }}
      />,
    )

    expect(screen.getByText('Theoretical / mechanistic research')).toBeTruthy()
    expect(container.querySelector('[data-research-maturity="theoretical"]')).toBeTruthy()
    expect(container.querySelector('[data-research-visual-weight="research-only"]')).toBeTruthy()
  })

  it('shows established research distinctly for strong human evidence', () => {
    const { container } = render(
      <ProfileEvidenceLens record={{ slug: 'example', evidence_tier: 'Strong human clinical trial evidence' }} />,
    )

    expect(screen.getByText('Established research')).toBeTruthy()
    expect(container.querySelector('[data-research-maturity="established"]')).toBeTruthy()
  })
})
