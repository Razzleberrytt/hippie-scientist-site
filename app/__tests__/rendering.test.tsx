import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

import HerbsIndexClient from '../herbs/HerbsIndexClient'
import { collapseRepeatedNouns } from '../../lib/display-utils'
import type { RuntimeRecord } from '../../src/types/content'

// Mock next/link since it is used in the component
import { vi } from 'vitest'
vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: any) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  }
})

// Mock the CSS file import in HerbsIndexClient
vi.mock('../../styles/premium-cards.css', () => ({}))

describe('Rendering and Content Quality Tests', () => {
  const mockHerbs: RuntimeRecord[] = [
    {
      slug: 'ashwagandha',
      name: 'Ashwagandha',
      displayName: 'Ashwagandha',
      profile_status: 'complete',
      evidence_tier: 'Strong evidence',
      safety_level: 'Generally well tolerated',
      primary_effects: ['stress'],
      mechanisms: ['cortisol'],
      shortEarthySummary: 'Ashwagandha is a popular adaptogen.',
    },
    {
      slug: 'rhodiola',
      name: 'Rhodiola',
      displayName: 'Rhodiola',
      profile_status: 'strong',
      evidence_tier: 'Moderate evidence',
      safety_level: 'Generally well tolerated',
      primary_effects: ['fatigue'],
      mechanisms: ['monoamine'],
      shortEarthySummary: 'Rhodiola supports energy levels.',
    },
  ]

  it('HerbsIndexClient renders its section header as an h2 (not h1)', () => {
    render(
      <HerbsIndexClient
        herbs={mockHerbs}
        allHerbs={mockHerbs}
        paginated={false}
      />
    )
    
    // The main title in the client component must be an h2, since the server page page.tsx renders the h1
    const heading = screen.getByRole('heading', { name: /Herbal research library/i })
    expect(heading.tagName).toBe('H2')
  })

  it('collapseRepeatedNouns correctly collapses duplicate contiguous words', () => {
    expect(collapseRepeatedNouns('limited human evidence evidence')).toBe('limited human evidence')
    expect(collapseRepeatedNouns('safety safety interaction')).toBe('safety interaction')
    expect(collapseRepeatedNouns('interaction interaction risk')).toBe('interaction risk')
    expect(collapseRepeatedNouns('no duplicates here')).toBe('no duplicates here')
  })

  it('renders correct profiles count when not paginated', () => {
    const tenHerbs = Array.from({ length: 10 }, (_, i) => ({
      slug: `herb-${i}`,
      name: `Herb ${i}`,
      displayName: `Herb ${i}`,
      profile_status: 'complete',
      evidence_tier: 'Moderate evidence',
      safety_level: 'Generally well tolerated',
      shortEarthySummary: `Summary for herb ${i}`,
    })) as RuntimeRecord[]

    render(
      <HerbsIndexClient
        herbs={tenHerbs}
        allHerbs={tenHerbs}
        paginated={false}
      />
    )
    // Should display the count of base herbs (10 profiles)
    expect(screen.getByText(/10 profiles/i)).toBeInTheDocument()
  })

  it('renders paginated showing X-Y of Z counts correctly', () => {
    // Make a larger set of herbs to test pagination showing ranges
    const tenHerbs = Array.from({ length: 40 }, (_, i) => ({
      slug: `herb-${i}`,
      name: `Herb ${i}`,
      displayName: `Herb ${i}`,
      profile_status: 'complete',
      evidence_tier: 'Moderate evidence',
      safety_level: 'Generally well tolerated',
      shortEarthySummary: `Summary for herb ${i}`,
    })) as RuntimeRecord[]

    // Render page 1
    const { rerender } = render(
      <HerbsIndexClient
        herbs={tenHerbs.slice(0, 36)} // First page items
        allHerbs={tenHerbs}
        paginated={true}
        page={1}
        totalPages={2}
      />
    )

    // Expected: Showing 1–36 of 40 profiles
    expect(screen.getByText(/Showing 1–36 of 40 profiles/i)).toBeInTheDocument()

    // Rerender page 2
    rerender(
      <HerbsIndexClient
        herbs={tenHerbs.slice(36, 40)} // Second page items
        allHerbs={tenHerbs}
        paginated={true}
        page={2}
        totalPages={2}
      />
    )

    // Expected: Showing 37–40 of 40 profiles
    expect(screen.getByText(/Showing 37–40 of 40 profiles/i)).toBeInTheDocument()
  })
})
