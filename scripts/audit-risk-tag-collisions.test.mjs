import { describe, expect, it } from 'vitest'
import { findSuspectMatches, findWeakCorroborationMatches } from './audit-risk-tag-collisions.mjs'

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

describe('findWeakCorroborationMatches', () => {
  it('flags the real production bug: "surgery" cited for a non-bleeding reason', () => {
    const suspects = findWeakCorroborationMatches(
      'discontinue before scheduled surgery due to an unstudied interaction with anesthesia'
    )
    expect(suspects).toHaveLength(1)
    expect(suspects[0]).toMatchObject({ mech: 'anticoagulant', key: 'surgery' })
  })

  it('does not flag "surgery" when the clause corroborates the bleeding-risk mechanism', () => {
    expect(
      findWeakCorroborationMatches('discontinue before surgery due to increased bleeding risk')
    ).toEqual([])
    expect(
      findWeakCorroborationMatches('may increase bleeding risk with anticoagulants/antiplatelets')
    ).toEqual([])
  })

  it('does not flag a bare "surgery" flag token with no stated reason (the dataset\'s normal shorthand)', () => {
    expect(findWeakCorroborationMatches('pre-surgery')).toEqual([])
    expect(findWeakCorroborationMatches('upcoming surgery')).toEqual([])
    expect(findWeakCorroborationMatches('planned surgery')).toEqual([])
    expect(findWeakCorroborationMatches('scheduled surgery')).toEqual([])
  })

  it('returns no suspects for a phrase with no weak-keyword matches at all', () => {
    expect(findWeakCorroborationMatches('generally well tolerated at typical doses')).toEqual([])
  })
})
