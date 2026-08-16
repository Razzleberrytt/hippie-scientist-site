import { describe, expect, it } from 'vitest'

import {
  collectionHasMeaningfulText,
  hasMeaningfulText,
  isMissingLike,
  normalizeStructuredText,
} from '@/lib/data-quality.mjs'

describe('canonical data quality primitives', () => {
  it('normalizes whitespace consistently', () => {
    expect(normalizeStructuredText('  alpha\n beta  ')).toBe('alpha beta')
  })

  it('recognizes missing-like legacy values', () => {
    expect(isMissingLike('N/A')).toBe(true)
    expect(isMissingLike(' tbd ')).toBe(true)
    expect(isMissingLike('real value')).toBe(false)
  })

  it('rejects generic editorial placeholders', () => {
    expect(hasMeaningfulText('needs review')).toBe(false)
    expect(hasMeaningfulText('research pending')).toBe(false)
    expect(hasMeaningfulText('Avoid in pregnancy.')).toBe(true)
  })

  it('handles arrays through the same predicate', () => {
    expect(collectionHasMeaningfulText(['placeholder', 'Avoid with anticoagulants.'])).toBe(true)
    expect(collectionHasMeaningfulText(['placeholder', 'research-only'])).toBe(false)
  })
})
