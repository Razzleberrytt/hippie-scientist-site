import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import StudyDesignSnapshot from '../StudyDesignSnapshot'

async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container)
  const violations = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
  expect(violations).toHaveLength(0)
}

describe('StudyDesignSnapshot', () => {
  it('always shows the practical summary and the grade', () => {
    render(<StudyDesignSnapshot grade="Moderate" summary="A modest, replicated effect." />)
    expect(screen.getByText('A modest, replicated effect.')).toBeTruthy()
    expect(screen.getByText(/Evidence grade: Moderate/)).toBeTruthy()
  })

  it('renders depth (rationale, design factors, limitations) inside a disclosure', () => {
    const { container } = render(
      <StudyDesignSnapshot
        grade="Limited"
        summary="Early signal only."
        gradeRationale="Only one small trial."
        studyType="Single RCT"
        participants="30 adults"
        limitations={['Tiny sample', 'No replication']}
      />,
    )
    // Native <details> disclosure keeps depth optional and keyboard-accessible.
    const details = container.querySelector('details')
    expect(details).not.toBeNull()
    expect(screen.getByText('Only one small trial.')).toBeTruthy()
    expect(screen.getByText('Single RCT')).toBeTruthy()
    expect(screen.getByText('Tiny sample')).toBeTruthy()
  })

  it('omits the disclosure when only a summary is provided', () => {
    const { container } = render(<StudyDesignSnapshot summary="Just the takeaway." />)
    expect(container.querySelector('details')).toBeNull()
  })

  it('exposes the section with an accessible label and has no serious a11y violations', async () => {
    const { container } = render(
      <StudyDesignSnapshot
        grade="Strong"
        summary="Well replicated."
        gradeRationale="Multiple large RCTs."
        limitations={['Describes averages']}
      />,
    )
    expect(screen.getByRole('region', { name: 'Study design snapshot' })).toBeTruthy()
    await checkA11y(container)
  })
})
