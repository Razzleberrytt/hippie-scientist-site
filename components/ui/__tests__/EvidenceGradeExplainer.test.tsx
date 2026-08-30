import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EvidenceGradeExplainer from '../EvidenceGradeExplainer'

describe('EvidenceGradeExplainer', () => {
  it('renders all four evidence grades inside an accessible collapsed disclosure', () => {
    const { container } = render(<EvidenceGradeExplainer />)

    expect(container.querySelector('details')).not.toBeNull()
    expect(container.querySelector('details')?.hasAttribute('open')).toBe(false)

    // Tap sizing and focus treatment come from the shared disclosure primitive
    // (styles/editorial-primitives.css) and the global focus baseline, rather
    // than being restated as utilities on every summary.
    const summary = screen.getByText('How evidence grades work').closest('summary')
    expect(summary).not.toBeNull()
    expect(summary?.closest('details')?.className).toContain('hs-disclosure')

    for (const [grade, label] of [
      ['A', 'Strong'],
      ['B', 'Moderate'],
      ['C', 'Preliminary / Mixed'],
      ['D', 'Traditional / Theoretical'],
    ]) {
      expect(screen.getByText(grade)).toBeTruthy()
      expect(screen.getByText(label)).toBeTruthy()
    }
  })
})
