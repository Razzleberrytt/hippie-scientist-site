import { describe, expect, it } from 'vitest'
import { formatBrowseTitle } from '@/utils/titleDisplay'

describe('formatBrowseTitle', () => {
  it('keeps short titles untouched', () => {
    expect(formatBrowseTitle('Rosmarinic Acid', 58)).toBe('Rosmarinic Acid')
  })

  it('truncates long titles at semantic separators before hard cut', () => {
    const input =
      '2,3,4,5,6,7,8,9-octamethyl-11-(2,4,6-trimethylphenyl)-tricyclo[7.3.1.0]trideca-1,3,5-triene'
    expect(formatBrowseTitle(input, 58)).toBe('2,3,4,5,6,7,8,9-octamethyl-11-(2,4,6-trimethylphenyl)…')
  })
})
