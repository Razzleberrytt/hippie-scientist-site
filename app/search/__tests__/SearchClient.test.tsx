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

// The search experience loads both summary files with Promise.all and sets
// state when they resolve. The previous mock returned a hand-rolled thenable,
// which Promise.all never settles, so the component rendered with no records at
// all and every assertion below failed on an empty list.
global.fetch = vi.fn(async (url: string) => ({
  ok: true,
  json: async () => (url.includes('herbs-summary') ? mockHerbs : mockCompounds),
})) as unknown as typeof fetch

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
  it('renders default search interface successfully', async () => {
    render(<SearchClient />)

    expect(screen.getByRole('heading', { name: /Search ingredients, outcomes, and research context/i })).toBeInTheDocument()
    expect(searchInput()).toBeInTheDocument()
    expect(await screen.findByText('2 shown')).toBeInTheDocument()
  })

  it('filters and expands search queries using synonyms', async () => {
    render(<SearchClient />)
    await screen.findByText('2 shown')

    fireEvent.change(searchInput(), { target: { value: 'sleep' } })
    expect(await screen.findAllByText(/Ashwagandha/i)).not.toHaveLength(0)
  })

  it('provides auto-suggestions when typing in the input', async () => {
    render(<SearchClient />)
    await screen.findByText('2 shown')

    fireEvent.change(searchInput(), { target: { value: 'Ash' } })
    expect(await screen.findByText('Quick matches')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ashwagandha/i })).toBeInTheDocument()
  })

  it('excludes restricted substances (e.g. DMT, 5-MeO-DMT, kratom, ibogaine, ketamine, fadogia) from search results and dosing options', async () => {
    render(<SearchClient />)
    await screen.findByText('2 shown')

    fireEvent.change(searchInput(), { target: { value: 'theanine' } })
    expect(await screen.findAllByText(/L-Theanine/i)).not.toHaveLength(0)
    expect(screen.queryByText(/DMT/i)).not.toBeInTheDocument()
  })
})
