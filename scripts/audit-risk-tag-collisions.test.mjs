import { describe, expect, it } from 'vitest'
import { findSuspectMatches } from './audit-risk-tag-collisions.mjs'

describe('findSuspectMatches', () => {
  it('flags a keyword matched as a substring of an unrelated word (the real bug it guards against)', () => {
    const suspects = findSuspectMatches('caution around cesarean delivery')
    expect(suspects).toHaveLength(1)
    expect(suspects[0]).toMatchObject({ mech: 'hepatic', key: 'liver', prefix: 'de' })
  })

  it('does not flag a keyword at the start of a phrase', () => {
    expect(findSuspectMatches('liver disease caution')).toEqual([])
  })

  it('does not flag a keyword glued to a known-safe medical prefix', () => {
    expect(findSuspectMatches('interaction concern with antidiabetic medicines')).toEqual([])
    expect(findSuspectMatches('caution with antihypertensive medications')).toEqual([])
    expect(findSuspectMatches('hyperthyroidism or hypothyroidism caution')).toEqual([])
  })

  it('flags a keyword glued to an unrecognized prefix', () => {
    const suspects = findSuspectMatches('unrenal finding of no clinical relevance')
    expect(suspects).toHaveLength(1)
    expect(suspects[0]).toMatchObject({ mech: 'renal', key: 'renal', prefix: 'un' })
  })

  it('returns no suspects for a phrase with no keyword matches at all', () => {
    expect(findSuspectMatches('generally well tolerated at typical doses')).toEqual([])
  })
})
