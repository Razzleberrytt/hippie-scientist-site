import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InteractionWarnings } from '../InteractionWarnings'
import type { InteractionEdge, SlugEntityTypeMap } from '@/src/types/interactions'

const makeEdges = (count: number): InteractionEdge[] =>
  Array.from({ length: count }, (_, index) => ({
    partner_slug: `partner-${index + 1}`,
    partner_name: `Partner ${index + 1}`,
    risk_mechanism: 'blood_glucose',
    severity: 'moderate',
    weight: 60,
    claim_language: `Partner ${index + 1} shares a blood-glucose caution.`,
    notes: '',
  }))

const makeSlugTypeMap = (count: number): SlugEntityTypeMap =>
  Object.fromEntries(
    Array.from({ length: count }, (_, index) => [`partner-${index + 1}`, 'herb']),
  )

describe('InteractionWarnings', () => {
  it('summarizes large mechanism groups instead of rendering every partner link', () => {
    render(
      <InteractionWarnings
        edges={makeEdges(15)}
        slugTypeMap={makeSlugTypeMap(15)}
      />,
    )

    expect(screen.getByText('15 flagged pairings')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Partner 12' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Partner 13' })).not.toBeInTheDocument()
    expect(screen.getByText(/\+3 more pairings share this mechanism/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Use the Safety Checker' })).toHaveAttribute(
      'href',
      '/safety-checker',
    )
  })
})
