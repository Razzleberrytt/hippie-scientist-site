import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ProfileSafetyLine from '@/components/ui/ProfileSafetyLine'

/**
 * This line is the first safety information a reader sees on a monograph, so
 * the cases that matter are the ones where it could reassure without cause.
 */

describe('ProfileSafetyLine', () => {
  it('leads with the tone and the first sentence of the summary', () => {
    render(
      <ProfileSafetyLine
        tone="Standard caution"
        summary="Generally well tolerated at studied doses. Longer-term data is limited."
      />,
    )
    expect(screen.getByText('Standard caution')).toBeInTheDocument()
    expect(screen.getByText(/Generally well tolerated at studied doses\./)).toBeInTheDocument()
  })

  it('shows only the first sentence, not the whole summary', () => {
    render(
      <ProfileSafetyLine
        tone="Standard caution"
        summary="First sentence here. Second sentence should stay in the safety section."
      />,
    )
    expect(screen.queryByText(/Second sentence/)).not.toBeInTheDocument()
  })

  it('always links to the full safety section rather than implying completeness', () => {
    render(<ProfileSafetyLine tone="Standard caution" summary="Some caution applies." />)
    expect(screen.getByRole('link', { name: /details/i })).toHaveAttribute('href', '#safety')
  })

  it('renders nothing when there is no safety text', () => {
    // An empty chip would read as reassurance; absence of data is not safety.
    const { container } = render(<ProfileSafetyLine tone="Standard caution" summary="" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('treats an unrecognised tone as elevated, not neutral', () => {
    // A new or misspelled tone must fail toward more caution. Amber, not green.
    const { container } = render(<ProfileSafetyLine tone="Higher caution" summary="Interacts with anticoagulants." />)
    const box = container.firstElementChild
    expect(box?.className).toContain('amber')
    expect(box?.className).not.toContain('emerald')
  })

  it('uses the neutral treatment only for the exact standard tone', () => {
    const { container } = render(<ProfileSafetyLine tone="Standard caution" summary="Generally well tolerated." />)
    expect(container.firstElementChild?.className).toContain('emerald')
  })
})
