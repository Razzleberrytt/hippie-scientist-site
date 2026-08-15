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
  it('renders a citation-ready evidence summary even when callers pass only citations', () => {
    render(<ShowMeTheStudies citations={citations} />)

    expect(screen.getByText('What the evidence actually shows')).toBeTruthy()
    expect(screen.getByText(/2 human trials/i)).toBeTruthy()
    expect(screen.getByText(/approximate participant total is 200/i)).toBeTruthy()
    expect(screen.getByText(/1 supporting, 0 mixed, 1 contradicting/i)).toBeTruthy()
    expect(screen.getByText(/Confidence: not separately assigned/i)).toBeTruthy()
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
