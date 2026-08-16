import { describe, expect, it } from 'vitest'

import {
  extractBracketedIdentityNames,
  extractParentheticalNames,
  levenshteinDistance,
  normalizeEntityName,
  normalizeRouteSlug,
  slugifyEntityName,
  stripBracketedIdentityNotes,
  stripParentheticalName,
} from '@/lib/entity-identity.mjs'

describe('entity identity primitives', () => {
  it('keeps route and entity slug semantics explicit', () => {
    expect(normalizeRouteSlug('St. John’s Wort')).toBe('st-john-s-wort')
    expect(slugifyEntityName('St. John’s Wort')).toBe('st-johns-wort')
    expect(normalizeEntityName('  Lion’s   Mane ')).toBe('lions mane')
  })

  it('extracts and strips identity notes', () => {
    expect(extractParentheticalNames('Garlic (Allium sativum)')).toEqual(['Allium sativum'])
    expect(stripParentheticalName('Garlic (Allium sativum)')).toBe('Garlic')
    expect(extractBracketedIdentityNames('Garlic [Allium sativum]')).toEqual(['Allium sativum'])
    expect(stripBracketedIdentityNotes('Garlic [Allium sativum]')).toBe('Garlic')
  })

  it('provides one edit-distance implementation for identity matching', () => {
    expect(levenshteinDistance('valerian', 'valeriana')).toBe(1)
    expect(levenshteinDistance('kava', 'gaba')).toBe(2)
  })
})