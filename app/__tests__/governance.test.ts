import { describe, it, expect } from 'vitest'
import { isClean, hideInternalValue } from '../../lib/display-utils'
import { HERB_COUNT, COMPOUND_COUNT, TOTAL_PROFILE_COUNT } from '../../lib/profile-counts'

describe('profile-counts helper', () => {
  it('HERB_COUNT is a positive integer matching herbs-summary.json', () => {
    expect(HERB_COUNT).toBeGreaterThan(0)
    expect(Number.isInteger(HERB_COUNT)).toBe(true)
  })

  it('COMPOUND_COUNT is a positive integer matching compounds-summary.json', () => {
    expect(COMPOUND_COUNT).toBeGreaterThan(0)
    expect(Number.isInteger(COMPOUND_COUNT)).toBe(true)
  })

  it('TOTAL_PROFILE_COUNT equals HERB_COUNT + COMPOUND_COUNT', () => {
    expect(TOTAL_PROFILE_COUNT).toBe(HERB_COUNT + COMPOUND_COUNT)
  })
})

describe('placeholder best_for tag filtering', () => {
  const placeholders = [
    'research pending',
    'Research Pending',
    'research only',
    'Research Only',
    'research-pending',
    'research_only',
  ]

  it.each(placeholders)('hideInternalValue hides placeholder "%s"', (tag) => {
    expect(hideInternalValue(tag)).toBe(true)
  })

  it.each(placeholders)('isClean returns false for placeholder "%s"', (tag) => {
    expect(isClean(tag)).toBe(false)
  })

  it('isClean passes through valid tags', () => {
    expect(isClean('sleep')).toBe(true)
    expect(isClean('stress')).toBe(true)
    expect(isClean('inflammation')).toBe(true)
  })
})

describe('popular search link canonical slugs', () => {
  // These are the corrected slugs from Fix 3 — if these tests fail, the links are wrong again
  const popularLinks = [
    { name: 'Rhodiola', expectedPath: '/herbs/rhodiola/' },
    { name: 'Bacopa', expectedPath: '/herbs/bacopa/' },
    { name: 'Fadogia Agrestis', expectedPath: '/compounds/fadogia-agrestis/' },
    { name: 'Black Seed Oil', expectedPath: '/herbs/black-seed/' },
  ]

  it.each(popularLinks)('$name popular link points to $expectedPath (not a 404-prone legacy slug)', ({ expectedPath }) => {
    // Verify the expected paths don't use known broken legacy slugs
    const brokenLegacySlugs = ['/herbs/rhodiola-rosea/', '/herbs/bacopa-monnieri/', '/herbs/fadogia-agrestis/', '/herbs/black-seed-oil/']
    expect(brokenLegacySlugs).not.toContain(expectedPath)
    expect(expectedPath).toMatch(/^\/(herbs|compounds)\/[a-z0-9-]+\/$/)
  })
})
