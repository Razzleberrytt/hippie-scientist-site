import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PathwayExplorerClient from '../PathwayExplorerClient'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockHerbs = [
  {
    slug: 'ashwagandha',
    name: 'Ashwagandha',
    mechanism: 'Acts as a GABA-A receptor positive allosteric modulator.',
    evidence_tier: 'A',
  },
  {
    slug: 'rhodiola-rosea',
    name: 'Rhodiola Rosea',
    mechanism: 'Inhibits monoamine oxidase A and monoamine oxidase B.',
    evidence_tier: 'B',
  }
]

const mockCompounds = [
  {
    slug: 'caffeine',
    name: 'Caffeine',
    mechanism: 'Adenosine A1 and A2A receptor antagonist.',
    evidence_tier: 'A',
  }
]

describe('PathwayExplorerClient', () => {
  it('renders list of target receptors and default selected item details', () => {
    render(<PathwayExplorerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Default selected receptor is GABA-A
    expect(screen.getByText(/GABA Target Network/i)).toBeInTheDocument()
    expect(screen.getByText(/γ-Aminobutyric Acid Type A Receptor/i)).toBeInTheDocument()
  })

  it('matches and displays connected herbs/compounds for selected receptor', () => {
    render(<PathwayExplorerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // GABA-A receptor should match Ashwagandha
    expect(screen.getByText('Ashwagandha')).toBeInTheDocument()
    expect(screen.getAllByText(/A-Tier/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/positive allosteric modulator/i).length).toBeGreaterThan(0)
  })

  it('allows selecting another receptor target to update display', () => {
    render(<PathwayExplorerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Click on Adenosine Receptors
    const targetBtn = screen.getByText('Adenosine Receptors')
    fireEvent.click(targetBtn)

    // Details should update
    expect(screen.getByText(/Adenosine Target Network/i)).toBeInTheDocument()
    expect(screen.getByText('Caffeine')).toBeInTheDocument()
    expect(screen.queryByText('Ashwagandha')).not.toBeInTheDocument() // Not matching adenosine
  })

  it('filters receptors list by query search input', () => {
    render(<PathwayExplorerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    const input = screen.getByPlaceholderText(/Search targets/i)
    fireEvent.change(input, { target: { value: 'MAO' } })

    // Should only display MAO-B and MAO-A targets
    expect(screen.getByText('MAO-B Enzyme')).toBeInTheDocument()
    expect(screen.getByText('MAO-A Enzyme')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /GABA-A Receptor/i })).not.toBeInTheDocument()
  })
})
