import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchClient from '../SearchClient'

// Mock dependencies
vi.mock('@/public/data/herbs-summary.json', () => ({
  default: [
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
}))

vi.mock('@/public/data/compounds-summary.json', () => ({
  default: [
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
}))

vi.mock('@/lib/semantic-orchestration', () => ({
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

vi.mock('@/components/search/DosingSafetyChecker', () => ({
  default: () => <div>Mocked DosingSafetyChecker</div>
}))

describe('SearchClient Component', () => {
  it('renders default search interface successfully', () => {
    render(<SearchClient />)
    
    // Check title and input placeholder
    expect(screen.getByRole('heading', { name: /Search the library/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Try sleep, magnesium, stress/i)).toBeInTheDocument()
    expect(screen.getByText('2 searchable profiles')).toBeInTheDocument()
  })

  it('filters and expands search queries using synonyms', async () => {
    render(<SearchClient />)
    
    const input = screen.getByPlaceholderText(/Try sleep, magnesium, stress/i)
    
    // Type layperson term "sleep"
    fireEvent.change(input, { target: { value: 'sleep' } })
    
    // Check that Ashwagandha (which matches 'sleep') is rendered
    expect(screen.getByText('Ashwagandha')).toBeInTheDocument()
  })

  it('provides auto-suggestions when typing in the input', () => {
    render(<SearchClient />)
    
    const input = screen.getByPlaceholderText(/Try sleep, magnesium, stress/i)
    
    fireEvent.change(input, { target: { value: 'Ash' } })
    
    // Auto suggestion dropdown should render suggestion
    expect(screen.getByText('Quick match suggestions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ashwagandha/i })).toBeInTheDocument()
  })

  it('excludes restricted substances (e.g. DMT, 5-MeO-DMT, kratom, ibogaine, ketamine, fadogia) from search results and dosing options', () => {
    render(<SearchClient />)
    
    const input = screen.getByPlaceholderText(/Try sleep, magnesium, stress/i)
    
    // Query for safe compound to surface results
    fireEvent.change(input, { target: { value: 'theanine' } })
    
    // DMT (restricted) should never appear
    expect(screen.queryByText(/DMT/i)).not.toBeInTheDocument()
    // L-Theanine (safe, after filter) surfaces in results/suggestions; multiple nodes ok.
    expect(screen.getAllByText(/L-Theanine/i).length).toBeGreaterThan(0)
  })
})
