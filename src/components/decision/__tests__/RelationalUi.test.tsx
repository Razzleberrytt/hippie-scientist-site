import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RelationalUi from '../RelationalUi'

// Mock semantic-relationships
vi.mock('../../../lib/semantic-relationships', () => ({
  scoreRelatedProfile: vi.fn((left, right) => ({
    slug: right.slug,
    name: right.name,
    score: 11,
    sharedEffects: ['stress'],
    sharedMechanisms: ['gaba modulation'],
    sharedGoals: ['anxiety'],
    sharedCategories: [],
    sharedStacks: [],
    reasons: ['1 shared mechanism'],
  })),
  getOverlap: vi.fn((left: any[], right: any[]) =>
    left.filter((item) => right.includes(item))
  ),
}))

// Mock evidence-mapping
vi.mock('../../../lib/evidence-mapping', () => ({
  normalizeEvidence: vi.fn((entity) => ({
    score: 75,
    grade: 'B',
    label: 'Moderate Certainty',
    description: 'Verifiable clinical outcomes exist.',
    metrics: {
      clinicalTrialCount: 2,
      metaAnalysisCount: 0,
      humanStudiesCount: 2,
      animalStudiesCount: 0,
      inVitroCount: 0,
      citationCount: 10,
    },
  })),
}))

// Mock data-sources for comparisons
vi.mock('@/data/generated-comparisons', () => ({
  generatedComparisons: ['ashwagandha-vs-l-theanine'],
}))
vi.mock('@/data/comparisons', () => ({
  supplementComparisons: [],
}))

describe('RelationalUi Component', () => {
  const mockRecord = {
    slug: 'ashwagandha',
    name: 'Ashwagandha',
    type: 'herb',
    pathways: ['Adrenal Axis', 'GABA System'],
    mechanisms: ['cortisol modulation'],
  }

  const mockRelated = [
    {
      slug: 'l-theanine',
      name: 'L-Theanine',
      type: 'compound',
      pathways: ['GABA System'],
      mechanisms: ['gaba modulation'],
    },
  ]

  it('renders successfully with connections', () => {
    render(<RelationalUi record={mockRecord} relatedRecords={mockRelated} />)

    // Check title
    expect(screen.getByText('Biological & Pathway Overlap Explorer')).toBeInTheDocument()

    // Check connected entity link
    const candidateLink = screen.getByRole('link', { name: 'L-Theanine' })
    expect(candidateLink).toBeInTheDocument()
    expect(candidateLink.getAttribute('href')).toBe('/compounds/l-theanine')

    // Check evidence grade badge
    expect(screen.getByText('Evidence Grade B')).toBeInTheDocument()

    // Check overlap score display
    expect(screen.getByText('Overlap score: 12')).toBeInTheDocument()

    // Check shared pathway & mechanism tags
    expect(screen.getAllByText('GABA System')[0]).toBeInTheDocument()
    expect(screen.getByText('gaba modulation')).toBeInTheDocument()

    // Check comparison page link
    const compareLink = screen.getByRole('link', { name: 'Compare Ashwagandha vs L-Theanine →' })
    expect(compareLink).toBeInTheDocument()
    expect(compareLink.getAttribute('href')).toBe('/guides/compare/ashwagandha-vs-l-theanine')
  })

  it('does not render if there are no connections', () => {
    const { container } = render(<RelationalUi record={mockRecord} relatedRecords={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
