import { describe, expect, it } from 'vitest'

import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { validateDistributionPack } from '../distribution-pack-contract.mjs'

const object = {
  id: 'study-context-fixture',
  title: 'Governed study context fixture',
  finding: 'Human trials report a measured outcome, but interpretation remains limited by study context.',
  evidenceType: 'RCT',
  evidenceGrade: 'B',
  limitation: 'Results should not be generalized beyond the studied preparation, population, or study period.',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  populationContext: 'Adults enrolled in the cited human trial.',
  formulationContext: 'A specific standardized extract was studied; this does not establish equivalence across preparations.',
  doseContext: 'The reported dose is study context only and is not a consumer dosing instruction.',
  durationContext: 'The reported outcome was measured over the defined study period; this is not an onset claim.',
}

describe('distribution study-context provenance', () => {
  it('projects canonical formulation and duration context losslessly', () => {
    const pack = buildDistributionPackFromResearchObject(object, { researchObjects: [object] })

    expect(pack.claims[0].studyContext).toEqual({
      population: object.populationContext,
      formulation: object.formulationContext,
      dose: object.doseContext,
      duration: object.durationContext,
    })
    expect(validateDistributionPack(pack, { researchObjects: [object] })).toEqual([])
  })

  it('fails closed when formulation or duration context is rewritten downstream', () => {
    const pack = buildDistributionPackFromResearchObject(object, { researchObjects: [object] })

    const changedFormulation = structuredClone(pack)
    changedFormulation.claims[0].studyContext.formulation = 'Any product is equivalent.'
    expect(validateDistributionPack(changedFormulation, { researchObjects: [object] })
      .some(({ message }) => message.includes('canonical formulationContext'))).toBe(true)

    const changedDuration = structuredClone(pack)
    changedDuration.claims[0].studyContext.duration = 'Works within 30 minutes.'
    expect(validateDistributionPack(changedDuration, { researchObjects: [object] })
      .some(({ message }) => message.includes('canonical durationContext'))).toBe(true)
  })

  it('preserves null when canonical formulation or duration context is unknown', () => {
    const sparse = { ...object, formulationContext: undefined, durationContext: undefined }
    const pack = buildDistributionPackFromResearchObject(sparse, { researchObjects: [sparse] })

    expect(pack.claims[0].studyContext.formulation).toBeNull()
    expect(pack.claims[0].studyContext.duration).toBeNull()
    expect(validateDistributionPack(pack, { researchObjects: [sparse] })).toEqual([])
  })
})
