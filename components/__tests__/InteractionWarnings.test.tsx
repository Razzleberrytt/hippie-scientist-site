import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InteractionWarnings } from '../InteractionWarnings'
import type { InteractionEdge, SlugEntityTypeMap } from '@/types/interactions'

const makeEdges = (count: number): InteractionEdge[] =>
  Array.from({ length: count }, (_, index) => ({
    partner_slug: `partner-${index + 1}`,
    partner_name: `Partner ${index + 1}`,
    risk_mechanism: 'blood_glucose',
    severity: 'moderate',
    weight: 60,
    claim_language: `Partner ${index + 1} shares a blood-glucose caution.`,
    notes: '',
    certainty: 'known',
  }))

const makeSlugTypeMap = (count: number): SlugEntityTypeMap =>
  Object.fromEntries(
    Array.from({ length: count }, (_, index) => [`partner-${index + 1}`, 'herb']),
  )

describe('InteractionWarnings', () => {
  it('does not identify partners from shared warning keywords alone', () => {
    render(<InteractionWarnings edges={makeEdges(2).map(edge => ({ ...edge, certainty: 'theoretical' }))} slugTypeMap={makeSlugTypeMap(2)} />)
    expect(screen.queryByText(/flagged pairings/)).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText(/shared warning keywords do not establish an interaction/)).toBeInTheDocument()
  })
  it('keeps theoretical edges out when reviewed pair evidence also exists', () => {
    const edges = makeEdges(2)
    edges[1] = { ...edges[1], partner_name: 'Unverified black tea pairing', certainty: 'theoretical' }
    render(<InteractionWarnings edges={edges} slugTypeMap={makeSlugTypeMap(2)} />)
    expect(screen.getByText('1 flagged pairings')).toBeInTheDocument()
    expect(screen.queryByText(/Unverified black tea pairing/)).toBeNull()
  })
  it('summarizes large mechanism groups instead of rendering every partner link', () => {
    render(
      <InteractionWarnings
        edges={makeEdges(15)}
        slugTypeMap={makeSlugTypeMap(15)}
      />,
    )

    expect(screen.getByText('15 flagged pairings')).toBeInTheDocument()
    // Partner links now carry their interaction certainty in the label
    // ("Partner 12 - Theoretical interaction certainty"), so compare the link
    // text rather than asking for an exact accessible name.
    const partnerLinks = screen.getAllByRole('link').map((link) => link.textContent?.trim() ?? '')
    expect(partnerLinks.some((label) => label.startsWith('Partner 12'))).toBe(true)
    expect(partnerLinks.some((label) => label.startsWith('Partner 13'))).toBe(false)
    expect(screen.getByText(/\+3 more pairings share this mechanism/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Use the Safety Checker' }).getAttribute('href'))
      .toMatch(/^\/safety-checker\/?$/)
  })
})
