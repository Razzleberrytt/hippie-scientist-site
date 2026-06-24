import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfileCard from '../ProfileCard'

const HERB_PROPS = {
  type: 'herb' as const,
  slug: 'ashwagandha',
  name: 'Ashwagandha',
  summary: 'Adaptogen with strong evidence for stress reduction and cortisol modulation.',
  evidenceTier: 'strong' as const,
  safetyLevel: 'lowCaution' as const,
  signals: ['Stress', 'Cortisol', 'Sleep'],
}

describe('ProfileCard', () => {
  it('renders herb name and summary', () => {
    render(<ProfileCard {...HERB_PROPS} />)
    expect(screen.getByText('Ashwagandha')).toBeTruthy()
    expect(screen.getByText(/Adaptogen with strong evidence/)).toBeTruthy()
  })

  it('links to /herbs/slug by default for herb type', () => {
    render(<ProfileCard {...HERB_PROPS} />)
    const link = screen.getByRole('link', { name: /View profile: Ashwagandha/ })
    expect(link.getAttribute('href')).toBe('/herbs/ashwagandha')
  })

  it('links to /compounds/slug for compound type', () => {
    render(
      <ProfileCard
        type="compound"
        slug="l-theanine"
        name="L-Theanine"
      />
    )
    const link = screen.getByRole('link', { name: /View profile: L-Theanine/ })
    expect(link.getAttribute('href')).toBe('/compounds/l-theanine')
  })

  it('links to /stacks/slug for stack type', () => {
    render(
      <ProfileCard
        type="stack"
        slug="focus-stack"
        name="Focus Stack"
      />
    )
    const link = screen.getByRole('link', { name: /View profile: Focus Stack/ })
    expect(link.getAttribute('href')).toBe('/stacks/focus-stack')
  })

  it('respects explicit href override', () => {
    render(<ProfileCard {...HERB_PROPS} href="/custom-path" />)
    const link = screen.getByRole('link', { name: /View profile: Ashwagandha/ })
    expect(link.getAttribute('href')).toBe('/custom-path')
  })

  it('renders evidence and safety badges when provided', () => {
    render(<ProfileCard {...HERB_PROPS} />)
    expect(screen.getByText('Strong evidence')).toBeTruthy()
    expect(screen.getByText('Caution mapped')).toBeTruthy()
  })

  it('omits unknown evidence and safety badges', () => {
    render(
      <ProfileCard
        type="herb"
        slug="test-herb"
        name="Test Herb"
        evidenceTier="unknown"
        safetyLevel="unknown"
      />
    )
    expect(screen.queryByText('Evidence review')).toBeNull()
    expect(screen.queryByText('Safety review')).toBeNull()
  })

  it('renders up to 3 signal chips and truncates extras', () => {
    render(
      <ProfileCard
        {...HERB_PROPS}
        signals={['Stress', 'Cortisol', 'Sleep', 'Anxiety', 'Focus']}
      />
    )
    expect(screen.getByText('Stress')).toBeTruthy()
    expect(screen.getByText('Cortisol')).toBeTruthy()
    expect(screen.getByText('Sleep')).toBeTruthy()
    expect(screen.queryByText('Anxiety')).toBeNull()
    expect(screen.queryByText('Focus')).toBeNull()
  })

  it('renders featured badge when featured=true', () => {
    render(<ProfileCard {...HERB_PROPS} featured />)
    expect(screen.getByText('Featured')).toBeTruthy()
  })

  it('renders fallback summary when summary is absent', () => {
    render(<ProfileCard type="herb" slug="unknown-herb" name="Unknown Herb" />)
    expect(screen.getByText(/Traditionally used herb/)).toBeTruthy()
  })

  it('truncates long summaries to 130 characters', () => {
    const longSummary = 'A'.repeat(200)
    render(<ProfileCard type="herb" slug="test" name="Test" summary={longSummary} />)
    const el = screen.getByText(/A+…/)
    expect(el.textContent?.length).toBeLessThanOrEqual(131)
  })

  it('renders mechanism note when provided', () => {
    render(
      <ProfileCard
        type="compound"
        slug="berberine"
        name="Berberine"
        mechanismNote="AMPK activator · glucose uptake modulator"
      />
    )
    expect(screen.getByText(/AMPK activator/)).toBeTruthy()
  })
})
