import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MentalHealthResearchDirectory } from '@/components/guides/MentalHealthResearchDirectory'
import { P0_RESEARCH_REVIEWS } from '@/lib/mental-health-research-directory'

afterEach(cleanup)

describe('mental-health research discovery', () => {
  it('combines keyword search and topic selection, then clears an empty result', () => {
    render(<MentalHealthResearchDirectory reviews={P0_RESEARCH_REVIEWS} />)
    expect(screen.getAllByRole('link')).toHaveLength(40)
    const search = screen.getByRole('searchbox', { name: 'Search the mental health library' })
    fireEvent.change(search, { target: { value: 'Bipolar II vs BPD' } })
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link').getAttribute('href')?.replace(/\/$/, '')).toBe('/articles/bipolar-ii-versus-bpd-evidence-review')
    fireEvent.click(screen.getByRole('button', { name: 'Relationships & attachment' }))
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.getByText('No matching reviews yet')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getAllByRole('link')).toHaveLength(40)
    expect(screen.getByRole('button', { name: 'All topics' }).getAttribute('aria-pressed')).toBe('true')
    expect((search as HTMLInputElement).value).toBe('')
  })
})
