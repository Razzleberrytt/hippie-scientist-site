import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RelationalGraphClient from '../RelationalGraphClient'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockHerbs = [
  {
    slug: 'valerian',
    name: 'Valerian Root',
    evidence_tier: 'Moderate Human Evidence',
    mechanism: 'GABAergic receptor facilitator. Calming.',
    safety: 'Mild sedative properties.',
  },
  {
    slug: 'curcumin',
    name: 'Curcumin',
    evidence_tier: 'Strong Human Evidence',
    mechanism: 'Modulates HPA axis stress and cytokine response.',
    safety: 'Generally recognized as safe.',
  }
]

const mockCompounds = [
  {
    slug: 'caffeine',
    name: 'Caffeine',
    evidence_tier: 'Strong Human Evidence',
    mechanism: 'Adenosine receptor antagonist. Dopamine drive booster.',
    safety: 'Stimulant side effects. Jitter risk.',
  },
  {
    slug: 'l-theanine',
    name: 'L-Theanine',
    evidence_tier: 'Strong Human Evidence',
    mechanism: 'Increases GABA and alpha brainwaves. Blocks caffeine jitters.',
    safety: 'Highly tolerable profile.',
  },
  {
    slug: 'piperine',
    name: 'Piperine',
    evidence_tier: 'Moderate Human Evidence',
    mechanism: 'Bioavailability enhancer for curcumin.',
    safety: 'Enhances absorption of other compounds.',
  }
]

describe('RelationalGraphClient', () => {
  it('renders objectives and initial pathway map', () => {
    render(<RelationalGraphClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Focus objective (first GOAL in array) is active by default
    expect(screen.getByText('Focus & Executive Function')).toBeInTheDocument()
    expect(screen.getByText('Dopaminergic Motivation System')).toBeInTheDocument()
    expect(screen.getByText('Cholinergic Memory Network')).toBeInTheDocument()
  })

  it('renders connected ingredients based on objective pathways keywords', () => {
    render(<RelationalGraphClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Under Focus objective pathways (dopamine/acetylcholine):
    // Caffeine mechanism contains "Dopamine drive booster."
    expect(screen.getByRole('button', { name: 'Caffeine' })).toBeInTheDocument()
  })

  it('displays detailed scorecard and GRADE info upon clicking ingredient', () => {
    render(<RelationalGraphClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Caffeine' }))

    expect(screen.getByText('GRADE Evidence score')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument() // Caffeine evidence_tier is Strong/High, so GRADE is High
    expect(screen.getByText('25+ Human RCTs (double-blind)')).toBeInTheDocument()
    expect(screen.getByText('Risk of Bias (GRADE):')).toBeInTheDocument()
    expect(screen.getByText('Low Risk')).toBeInTheDocument()
  })

  it('supports pinning ingredient to workspace and displaying recommendations', () => {
    render(<RelationalGraphClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Caffeine' }))
    
    // Pin button is displayed in detail view
    const pinBtn = screen.getByRole('button', { name: /Pin to Workspace/i })
    fireEvent.click(pinBtn)

    // Pinned count is 1
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    
    // Synergy recommendation is displayed for Caffeine (needs L-Theanine)
    expect(screen.getAllByText('Unlock synergy for Caffeine').length).toBeGreaterThan(0)
    expect(screen.getByText('+ Add L-Theanine to Workspace')).toBeInTheDocument()
  })

  it('triggers active synergy warnings when synergistic partners are both pinned', () => {
    render(<RelationalGraphClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Click Caffeine and Pin it
    fireEvent.click(screen.getByRole('button', { name: 'Caffeine' }))
    fireEvent.click(screen.getByRole('button', { name: /Pin to Workspace/i }))

    // Click on recommendation to pin partner L-Theanine
    fireEvent.click(screen.getByRole('button', { name: /\+ Add L-Theanine to Workspace/i }))

    // Expect active synergy alert
    expect(screen.getByText('✨ Active Synergies')).toBeInTheDocument()
    expect(screen.getByText('Focus & Calm Synergy')).toBeInTheDocument()
  })
})
