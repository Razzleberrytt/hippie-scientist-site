import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EvidenceGradeExplainer from '../EvidenceGradeExplainer'

describe('EvidenceGradeExplainer', () => {
  it('renders all four evidence grades with their labels inside a collapsed disclosure', () => {
    const { container } = render(<EvidenceGradeExplainer />)

    expect(container.querySelector('details')).not.toBeNull()
    expect(container.querySelector('details')?.hasAttribute('open')).toBe(false)

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
