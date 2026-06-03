import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RecommendationQuiz from '../RecommendationQuiz'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockHerbs = [
  {
    slug: 'ashwagandha',
    name: 'Ashwagandha',
    description: 'An adaptogen that reduces stress and cortisol.',
    mechanism: 'Modulates HPA axis cortisol secretion.',
    effects: ['stress relief', 'cortisol control'],
    evidence: 'strong evidence',
    safety: 'well tolerated',
  },
  {
    slug: 'valerian',
    name: 'Valerian Root',
    description: 'An herb that promotes sleep.',
    mechanism: 'Enhances GABAergic activity.',
    effects: ['sleep support', 'relaxation'],
    evidence: 'moderate evidence',
    safety: 'drowsiness caution',
  }
]

const mockCompounds = [
  {
    slug: 'caffeine',
    name: 'Caffeine',
    description: 'A stimulant that increases focus and attention.',
    mechanism: 'Adenosine receptor antagonist. Stimulant.',
    effects: ['focus', 'energy boost'],
    evidence: 'strong evidence',
    safety: 'insomnia caution',
  }
]

describe('RecommendationQuiz', () => {
  it('renders primary neurochemical objective step first', () => {
    render(<RecommendationQuiz herbs={mockHerbs} compounds={mockCompounds} />)
    
    expect(screen.getByText(/What is your primary neurochemical objective/i)).toBeInTheDocument()
  })

  it('runs through the full questionnaire and renders sleep matches', () => {
    render(<RecommendationQuiz herbs={mockHerbs} compounds={mockCompounds} />)

    // Step 1: Objective -> Sleep
    fireEvent.click(screen.getByText(/Sleep & Wind-down/i))

    // Step 2: Stimulants -> Yes, Non-Stimulant Only
    expect(screen.getByText(/Do you want to avoid central nervous system stimulants/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Yes, Non-Stimulant Only/i))

    // Step 3: Evidence -> Preliminary & Traditional OK (No strict filter)
    expect(screen.getByText(/What level of scientific evidence do you require/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Include Preliminary & Traditional/i))

    // Step 4: Safety -> Moderate Cautions OK
    expect(screen.getByText(/How strict is your safety requirement/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Moderate Cautions OK/i))

    // Results: Assert sleep items match
    expect(screen.getByText(/Your Top Matches/i)).toBeInTheDocument()
    expect(screen.getByText('Valerian Root')).toBeInTheDocument()
    expect(screen.queryByText('Caffeine')).not.toBeInTheDocument() // Staggered out by goal & stimulant checks
  })

  it('filters out stimulants when non-stimulant is chosen for focus goal', () => {
    render(<RecommendationQuiz herbs={mockHerbs} compounds={mockCompounds} />)

    // Step 1: Objective -> Focus
    fireEvent.click(screen.getByText(/Focus & Cognition/i))

    // Step 2: Stimulants -> Yes, Non-Stimulant Only
    fireEvent.click(screen.getByText(/Yes, Non-Stimulant Only/i))

    // Step 3: Evidence -> Include all
    fireEvent.click(screen.getByText(/Include Preliminary & Traditional/i))

    // Step 4: Safety -> Include cautions
    fireEvent.click(screen.getByText(/Moderate Cautions OK/i))

    // Results: Caffeine is a stimulant, should be filtered out
    expect(screen.getByText(/Your Top Matches/i)).toBeInTheDocument()
    expect(screen.queryByText('Caffeine')).not.toBeInTheDocument()
  })

  it('restarts the quiz when the restart button is clicked', () => {
    render(<RecommendationQuiz herbs={mockHerbs} compounds={mockCompounds} />)

    fireEvent.click(screen.getByText(/Sleep & Wind-down/i))
    fireEvent.click(screen.getByText(/Yes, Non-Stimulant Only/i))
    fireEvent.click(screen.getByText(/Include Preliminary & Traditional/i))
    fireEvent.click(screen.getByText(/Moderate Cautions OK/i))

    // Click restart
    fireEvent.click(screen.getByText(/Restart Quiz/i))
    
    // Assert we are back to Step 1
    expect(screen.getByText(/What is your primary neurochemical objective/i)).toBeInTheDocument()
  })
})
