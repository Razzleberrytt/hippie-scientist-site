import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import EvidenceScopeGuide from '../EvidenceScopeGuide'

describe('EvidenceScopeGuide', () => {
  it('explains that ingredient, outcome, study, safety and publication levels are separate', () => {
    const { container } = render(<EvidenceScopeGuide context="profile" />)
    expect(screen.getByText('Why can two evidence grades differ?')).toBeTruthy()
    expect(screen.getByText(/It does not establish the strength of every outcome-specific claim/)).toBeTruthy()
    expect(screen.getByText('Ingredient / profile grade')).toBeTruthy()
    expect(screen.getByText('Outcome-specific claim')).toBeTruthy()
    expect(screen.getByText('Individual study quality')).toBeTruthy()
    expect(screen.getByText('Safety / caution level')).toBeTruthy()
    expect(screen.getByText('Research review and product eligibility')).toBeTruthy()
    expect(container.querySelector('details summary')).toBeTruthy()
    // Next Link may normalize a trailing slash while preserving the canonical destination.
    expect(screen.getByRole('link', { name: 'Read the grading methodology' }).getAttribute('href')).toMatch(/^\/info\/methodology\/?$/)
    expect(screen.getByRole('link', { name: 'Check safety separately' }).getAttribute('href')).toMatch(/^\/safety-checker\/?$/)
  })

  it('does not confuse indexable evidence-report denominator with tracked compounds or PubMed records', () => {
    render(<EvidenceScopeGuide context="report" />)
    expect(screen.getByText('What do the evidence report grades measure?')).toBeTruthy()
    expect(screen.getByText(/indexable ingredient profiles as their denominator—not every tracked compound or every PubMed reference/)).toBeTruthy()
    expect(screen.getByText(/An evidence grade does not confer approval/)).toBeTruthy()
  })
})
