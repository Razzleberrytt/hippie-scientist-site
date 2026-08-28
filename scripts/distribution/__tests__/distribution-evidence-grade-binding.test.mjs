import { describe, expect, it } from 'vitest'

import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { assertDistributionEvidenceGradeBinding } from '../distribution-evidence-grade-binding.mjs'

const object = {
  id: 'evidence-grade-fixture',
  title: 'Governed evidence grade fixture',
  finding: 'Human evidence reports a measured outcome, with limitations that constrain interpretation.',
  evidenceType: 'meta-analysis',
  evidenceGrade: 'B',
  limitation: 'The evidence remains heterogeneous and should not be generalized beyond the governed finding.',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
}

describe('distribution evidence-grade binding', () => {
  it('projects the canonical evidence grade exactly', () => {
    const pack = buildDistributionPackFromResearchObject(object, { researchObjects: [object] })
    expect(pack.claims[0].evidenceGrade).toBe('B')
    expect(assertDistributionEvidenceGradeBinding(pack, object)).toBe(pack)
  })

  it('fails closed when a downstream asset strengthens or weakens the grade', () => {
    const pack = buildDistributionPackFromResearchObject(object, { researchObjects: [object] })

    for (const substitutedGrade of ['A', 'C', 'Avoid/Insufficient']) {
      const changed = structuredClone(pack)
      changed.claims[0].evidenceGrade = substitutedGrade
      expect(() => assertDistributionEvidenceGradeBinding(changed, object)).toThrow(/exactly equal canonical research-object evidenceGrade B/)
    }
  })

  it('rejects unknown canonical grades rather than inventing a projection', () => {
    expect(() => buildDistributionPackFromResearchObject({ ...object, evidenceGrade: 'High' }, { researchObjects: [{ ...object, evidenceGrade: 'High' }] }))
      .toThrow(/unsupported evidenceGrade/)
  })
})
