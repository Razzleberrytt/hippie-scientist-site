import { describe, expect, it } from 'vitest'
import { cleanText, splitClean } from '@/lib/sanitize'
import { hasInvalidEntityName, sanitizeCompoundRecord, sanitizeHerbRecord } from '@/utils/sanitizeData'

describe('sanitize text hygiene', () => {
  it('removes object serialization and numeric-only junk', () => {
    expect(cleanText('[object Object]')).toBe('')
    expect(cleanText('12345')).toBe('')
    expect(cleanText('No direct effects data. Contextual inference: nan.')).toBe('')
  })

  it('filters junk list entries deterministically', () => {
    expect(splitClean(['nan', '[object Object]', 'Calming', '123'])).toEqual(['Calming'])
    expect(splitClean('nan; [object Object]; Focus')).toEqual(['Focus'])
  })
})

describe('sanitize entity record validation', () => {
  it('rejects malformed herb display names', () => {
    const malformedNames = ['[object Object]', '123456', '', 'nan']

    malformedNames.forEach(name => {
      const { data, issue } = sanitizeHerbRecord({ id: 'h-1', name })
      expect(hasInvalidEntityName(data)).toBe(true)
      expect(issue?.issues).toContain('Invalid display name')
    })
  })

  it('rejects malformed compound display names', () => {
    const { data, issue } = sanitizeCompoundRecord({ id: 'c-1', name: '9999', herbs: ['Mint'] })
    expect(hasInvalidEntityName(data)).toBe(true)
    expect(issue?.issues).toContain('Invalid display name')
  })

  it('accepts valid records with clean names', () => {
    const { data, issue } = sanitizeCompoundRecord({ id: 'c-2', name: 'Quercetin', herbs: ['Mint'] })
    expect(hasInvalidEntityName(data)).toBe(false)
    expect(issue?.issues ?? []).not.toContain('Invalid display name')
  })
})
