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
  })

  // Generic placeholder prose used to render on every profile that lacked a value.
  // Repeated verbatim across ~300 pages it made the corpus read as near-duplicate
  // content, so an absent value now omits its sentence instead of filling it.
  it('omits the evidence-grade line when neither grade nor confidence is supplied', () => {
    render(<ShowMeTheStudies citations={citations} />)

    expect(screen.queryByText(/Confidence: not separately assigned/i)).toBeNull()
    expect(screen.queryByText(/see the profile grade above/i)).toBeNull()
  })

  it('renders the evidence-grade line from real per-profile values', () => {
    render(<ShowMeTheStudies citations={citations} evidenceGrade="Moderate" confidence="moderate" />)

    expect(screen.getByText(/Profile-wide evidence grade: Moderate/i)).toBeTruthy()
    expect(screen.getByText(/Confidence: moderate/i)).toBeTruthy()
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

    // Stays silent rather than asserting unclassifiable consistency in boilerplate.
    expect(screen.queryByText(/source-to-conclusion relationships are not classified/i)).toBeNull()
    expect(screen.queryByText(/consistency is not yet classifiable/i)).toBeNull()
    expect(screen.queryByText(/0 supporting, 0 mixed, 0 contradicting/i)).toBeNull()
  })

  it('warns against generalizing named-extract findings to every product', () => {
    render(<ShowMeTheStudies citations={citations} />)
    expect(screen.getByText(/should not automatically be generalized to every product/i)).toBeTruthy()
  })

  it('states what evidence could change the conclusion when the profile supplies it', () => {
    render(
      <ShowMeTheStudies
        citations={citations}
        whatWouldChangeConclusion="A replication in adults over 60 using the same standardized extract would materially change this."
      />,
    )
    expect(screen.getByText('What would change our conclusion?')).toBeTruthy()
    expect(screen.getByText(/replication in adults over 60/i)).toBeTruthy()
  })

  it('omits the conclusion-change panel rather than filling it with generic prose', () => {
    render(<ShowMeTheStudies citations={citations} />)
    expect(screen.queryByText('What would change our conclusion?')).toBeNull()
    expect(screen.queryByText(/larger, well-controlled human trials/i)).toBeNull()
  })

  it('surfaces disagreement explicitly instead of averaging it away', () => {
    render(<ShowMeTheStudies citations={citations} />)
    const disagreementHeading = screen.getByText('Where studies disagree')
    const disagreementPanel = disagreementHeading.parentElement

    expect(disagreementPanel).toBeTruthy()
    expect(disagreementPanel?.textContent).toMatch(/1 source relationship supports the conclusion/i)
    expect(disagreementPanel?.textContent).toMatch(/1 contradict it/i)
    expect(disagreementPanel?.textContent).toMatch(/rather than treating the studies as one averaged vote/i)
  })
})
