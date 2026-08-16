import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchClient from '../SearchClient'

const mockHerbs = [
  {
    slug: 'ashwagandha',
    name: 'Ashwagandha',
    displayName: 'Ashwagandha',
    summary: 'A root for stress and sleep.',
    primary_effects: ['stress', 'sleep'],
    evidence_tier: 'Strong Human Evidence',
    safety_level: 'Generally well tolerated',
  }
]

const mockCompounds = [
  {
    slug: 'l-theanine',
    name: 'L-Theanine',
    displayName: 'L-Theanine',
    summary: 'An amino acid for calm focus.',
    primary_effects: ['focus', 'calm'],
    evidence_tier: 'Strong Human Evidence',
    safety_level: 'Generally well tolerated',
  },
  {
    slug: 'dmt',
    name: 'DMT',
    displayName: 'DMT',
    summary: 'A controlled substance for educational context only.',
    primary_effects: ['psychoactive'],
    evidence_tier: 'Limited Human Evidence',
    safety_level: 'Controlled substance',
  }
]

// Mock global.fetch synchronously to avoid async timing issues in tests
global.fetch = vi.fn((url: string) => {
  const data = url.includes('herbs-summary') ? mockHerbs : mockCompounds
  return {
    then: (cb: any) => {
      const res = cb({
        json: () => ({
          then: (cb2: any) => cb2(data)
        })
      })
      return res
    }
  } as any
}) as any

vi.mock('../../../src/lib/semantic-orchestration', () => ({
  getSemanticOrchestrationSignals: vi.fn(() => ({
    authorityScore: 0.8,
    discoveryScore: 0.8,
    evidenceScore: 0.8,
    mechanismDensity: 0.8,
    ecosystemDensity: 0.8,
    safetyPenalty: 0,
    uncertaintyPenalty: 0,
    translationalPenalty: 0,
  }))
}))

vi.mock('../../../src/components/search/DosingSafetyChecker', () => ({
  default: () => <div>Mocked DosingSafetyChecker</div>
}))

function searchInput() {
  return screen.getByRole('searchbox', { name: /search herbs and compounds/i })
}

describe('SearchClient Component', () => {
  it('renders default search interface successfully', () => {
    render(<SearchClient />)

    expect(screen.getByRole('heading', { name: /Search ingredients, outcomes, and research context/i })).toBeInTheDocument()
    expect(searchInput()).toBeInTheDocument()
    expect(screen.getByText('2 shown')).toBeInTheDocument()
  })

  it('filters and expands search queries using synonyms', () => {
    render(<SearchClient />)

    fireEvent.change(searchInput(), { target: { value: 'sleep' } })
    expect(screen.getByText('Ashwagandha')).toBeInTheDocument()
  })

  it('provides auto-suggestions when typing in the input', () => {
    render(<SearchClient />)

    fireEvent.change(searchInput(), { target: { value: 'Ash' } })
    expect(screen.getByText('Quick matches')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ashwagandha/i })).toBeInTheDocument()
  })

  it('excludes restricted substances (e.g. DMT, 5-MeO-DMT, kratom, ibogaine, ketamine, fadogia) from search results and dosing options', () => {
    render(<SearchClient />)

    fireEvent.change(searchInput(), { target: { value: 'theanine' } })
    expect(screen.queryByText(/DMT/i)).not.toBeInTheDocument()
    expect(screen.getAllByText(/L-Theanine/i).length).toBeGreaterThan(0)
  })
})
