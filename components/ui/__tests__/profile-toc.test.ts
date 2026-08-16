import { describe, expect, it } from 'vitest'
import { getActiveTocLabel } from '../ProfileTOC'

describe('profile table of contents', () => {
  const items = [
    { id: 'overview', label: 'Overview' },
    { id: 'safety', label: 'Safety' },
    { id: 'evidence', label: 'Evidence' },
  ]

  it('shows the active section in the collapsed mobile control', () => {
    expect(getActiveTocLabel(items, 'safety')).toBe('Safety')
  })

  it('falls back to the first section before intersection state is available', () => {
    expect(getActiveTocLabel(items, null)).toBe('Overview')
    expect(getActiveTocLabel(items, 'missing')).toBe('Overview')
    expect(getActiveTocLabel([], null)).toBe('')
  })
})
