import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EvidenceGradeExplainer from '../EvidenceGradeExplainer'

describe('EvidenceGradeExplainer', () => {
  it('renders all four evidence grades inside an accessible collapsed disclosure', () => {
    const { container } = render(<EvidenceGradeExplainer />)

    expect(container.querySelector('details')).not.toBeNull()
    expect(container.querySelector('details')?.hasAttribute('open')).toBe(false)

    const summary = screen.getByText('How evidence grades work').closest('summary')
    expect(summary).not.toBeNull()
    expect(summary?.className).toContain('min-h-11')
    expect(summary?.className).toContain('focus-visible:ring-2')
    expect(summary?.className).toContain('focus-visible:ring-brand-500')

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
