import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfileEvidenceLens from '../ProfileEvidenceLens'

describe('ProfileEvidenceLens research maturity', () => {
  /**
   * Preclinical, animal or in-vitro evidence with no human evidence is
   * theoretical, not preliminary. `preliminary` is the bucket for early *human*
   * evidence, and research-maturity.ts has always documented mechanism-only as
   * theoretical; this expectation was changed to `preliminary` in b147f0364 to
   * match behaviour that had drifted when evidence-tier reconciliation was
   * refactored, which left src/lib/__tests__/research-maturity-live.test.ts
   * asserting the opposite for the identical record. Labelling animal-only data
   * as preliminary research blurs mechanism into early human evidence, which the
   * evidence rules do not allow.
   */
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
