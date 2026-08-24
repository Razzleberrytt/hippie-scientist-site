import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ShowMeTheStudies from '../ShowMeTheStudies'

const citations = [
  {
    title: 'Trial one',
    pmid: '12345678',
    studyType: 'randomized controlled trial',
    evidenceClass: 'randomized_controlled_trial' as const,
    sampleSize: 120,
    relationship: 'supports' as const,
    extractName: 'Standardized extract A',
  },
  {
    title: 'Trial two',
    pmid: '23456789',
    studyType: 'randomized controlled trial',
    evidenceClass: 'randomized_controlled_trial' as const,
    sampleSize: 80,
    relationship: 'contradicts' as const,
  },
]

describe('ShowMeTheStudies default evidence snapshot', () => {
  it('separates human evidence-source count from human-trial count', () => {
    render(<ShowMeTheStudies citations={[
      ...citations,
      {
        title: 'Systematic review',
        doi: '10.1000/review',
        studyType: 'systematic review',
        evidenceClass: 'systematic_review' as const,
        relationship: 'background' as const,
      },
    ]} />)

    expect(screen.getAllByText(/3 human evidence sources/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/2 human trials/i).length).toBeGreaterThan(0)
  })

  it('renders a citation-ready evidence summary even when callers pass only citations', () => {
    render(<ShowMeTheStudies citations={citations} />)

    expect(screen.getByText('What the evidence actually shows')).toBeTruthy()
    expect(screen.getAllByText(/2 human evidence sources/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/2 human trials/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/approximate participant total is 200/i)).toBeTruthy()
    expect(screen.getByText(/1 supports the conclusion, 0 are mixed, 1 contradict it/i)).toBeTruthy()
    expect(screen.getByText(/Confidence: not separately assigned/i)).toBeTruthy()
  })

  it('does not invent directional consistency when relationships are unclassified', () => {
    render(<ShowMeTheStudies citations={[
      {
        title: 'Background review',
        doi: '10.1000/background',
        studyType: 'systematic review',
        evidenceClass: 'systematic_review' as const,
      },
    ]} />)

    expect(screen.getByText(/source-to-conclusion relationships are not classified/i)).toBeTruthy()
    expect(screen.getAllByText(/consistency is not yet classifiable/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/0 supporting, 0 mixed, 0 contradicting/i)).toBeNull()
  })

  it('warns against generalizing named-extract findings to every product', () => {
    render(<ShowMeTheStudies citations={citations} />)
    expect(screen.getByText(/should not automatically be generalized to every product/i)).toBeTruthy()
  })

  it('always states what evidence could change the conclusion', () => {
    render(<ShowMeTheStudies citations={citations} />)
    expect(screen.getByText('What would change our conclusion?')).toBeTruthy()
    expect(screen.getByText(/larger, well-controlled human trials/i)).toBeTruthy()
  })

  it('surfaces disagreement explicitly instead of averaging it away', () => {
    render(<ShowMeTheStudies citations={citations} />)
    expect(screen.getByText('Where studies disagree')).toBeTruthy()
    expect(screen.getByText(/1 source relationship supports the conclusion/i)).toBeTruthy()
    expect(screen.getByText(/1 contradict it/i)).toBeTruthy()
    expect(screen.getByText(/rather than treating the studies as one averaged vote/i)).toBeTruthy()
  })
})
