import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { assertDistributionEvidenceGradeBinding } from '../distribution-evidence-grade-binding.mjs'

const root = process.cwd()
const researchObjects = JSON.parse(fs.readFileSync(path.join(root, 'data/distribution/research-objects.json'), 'utf8'))
const canonical = researchObjects.find(({ id }) => id === 'ashwagandha-stress-evidence')
const object = {
  ...canonical,
  id: 'evidence-grade-fixture',
  title: 'Governed evidence grade fixture',
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