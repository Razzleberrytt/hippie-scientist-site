import { describe, expect, it } from 'vitest'
import {
  MEDICATION_CLASSES,
  buildSafetyShareSearch,
  collectSafetySignalMatches,
  parseSafetyShareSearch,
  screenSafetySelection,
  type SafetyToolItem,
} from '../safety-checker-engine'

const item = (overrides: Partial<SafetyToolItem>): SafetyToolItem => ({
  slug: 'example',
  name: 'Example',
  type: 'herb',
  ...overrides,
})

describe('safety checker engine', () => {
  it('keeps mechanism-only overlap explicitly theoretical', () => {
    const alerts = screenSafetySelection([
      item({ slug: 'one', name: 'One', mechanisms: ['GABAergic sedative activity'] }),
      item({ slug: 'two', name: 'Two', mechanism: 'GABA-A modulation' }),
    ], [])

    expect(alerts).toHaveLength(1)
    expect(alerts[0].signal).toBe('Sedation')
    expect(alerts[0].evidenceClass).toBe('theoretical-additive')
    expect(alerts[0].mechanismClass).toBe('pharmacodynamic')
  })

  it('does not call a structured flag documented without explicit documentation metadata', () => {
    const alerts = screenSafetySelection([
      item({ slug: 'one', name: 'One', safety_flags: ['sedative'] }),
      item({ slug: 'two', name: 'Two', safety: 'May cause drowsiness' }),
    ], [])

    expect(alerts[0].evidenceClass).toBe('structured-signal')
  })

  it('honors explicit documented interaction metadata and source provenance', () => {
    const med = MEDICATION_CLASSES.find((candidate) => candidate.id === 'hormonal-contraceptive')!
    const alerts = screenSafetySelection([
      item({
        slug: 'sjw',
        name: "St. John's Wort",
        safety_flags: ['drug metabolism'],
        interaction_evidence: 'documented clinical interaction',
        interaction_type: 'pharmacokinetic',
        mechanisms: ['CYP3A4 enzyme induction'],
        sources: ['PMID:14616430'],
      }),
    ], [med])

    expect(alerts[0].evidenceClass).toBe('documented')
    expect(alerts[0].mechanismClass).toBe('pharmacokinetic')
    expect(alerts[0].sources).toContain('PMID:14616430')
  })

  it('normalizes direct safety flags into canonical screening signals', () => {
    expect(collectSafetySignalMatches(item({ safety_flags: ['serotonergic', 'bleeding risk'] })).map((match) => match.signal)).toEqual(expect.arrayContaining(['Serotonergic', 'Bleeding']))
  })

  it('serializes only public entity slugs and medication-class IDs', () => {
    const med = MEDICATION_CLASSES.find((candidate) => candidate.id === 'ssri-snri')!
    const search = buildSafetyShareSearch([
      item({ slug: 'ashwagandha', name: 'Ashwagandha' }),
      item({ slug: 'l-theanine', name: 'L-Theanine', type: 'compound' }),
    ], [med])

    expect(search).toContain('ashwagandha')
    expect(search).toContain('ssri-snri')
    expect(search).not.toContain('Ashwagandha')
    expect(search).not.toContain('diagnosis')
  })

  it('rejects malformed or free-text share state', () => {
    const parsed = parseSafetyShareSearch('?items=herb:ashwagandha,diagnosis:private,herb:bad%20slug&meds=ssri-snri,free-text')
    expect(parsed.items).toEqual(['herb:ashwagandha'])
    expect(parsed.meds).toEqual(['ssri-snri'])
  })
})
