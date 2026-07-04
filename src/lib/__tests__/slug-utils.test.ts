import { describe, it, expect } from 'vitest'
import { normalizeSlug, isCanonicalSlug } from '../../../lib/slug-utils'

describe('normalizeSlug', () => {
  it('lowercases and hyphenates spaces/punctuation', () => {
    expect(normalizeSlug('Ashwagandha Root Extract')).toBe('ashwagandha-root-extract')
  })

  it('collapses consecutive non-alphanumeric characters into a single hyphen', () => {
    expect(normalizeSlug('L-Theanine  /  GABA')).toBe('l-theanine-gaba')
  })

  it('strips leading and trailing hyphens', () => {
    expect(normalizeSlug('  -Rhodiola Rosea- ')).toBe('rhodiola-rosea')
  })

  it('returns an empty string for null/undefined input', () => {
    expect(normalizeSlug(undefined)).toBe('')
    expect(normalizeSlug(null)).toBe('')
  })

  it('coerces non-string input to a string first', () => {
    expect(normalizeSlug(12345)).toBe('12345')
  })
})

describe('isCanonicalSlug', () => {
  it('is true when both slugs normalize to the same value', () => {
    expect(isCanonicalSlug('Ashwagandha', 'ashwagandha')).toBe(true)
    expect(isCanonicalSlug('l_theanine', 'l-theanine')).toBe(true)
  })

  it('is false when normalized slugs differ', () => {
    expect(isCanonicalSlug('rhodiola', 'ashwagandha')).toBe(false)
  })
})
