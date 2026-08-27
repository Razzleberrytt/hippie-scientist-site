import { describe, expect, it } from 'vitest'

import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { hashCanonicalField, validateDistributionPack } from '../distribution-pack-contract.mjs'

// Keep this suite as the executable validation anchor for field-level provenance after exact-base refreshes.
const object = {
  id: 'field-provenance-fixture',
  title: 'Field provenance fixture',
  finding: 'A governed human finding with bounded interpretation.',
  evidenceType: 'RCT',
  evidenceGrade: 'B',
  limitation: 'Interpretation remains limited to the studied population and preparation.',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  populationContext: 'Adults enrolled in the cited human trial.',
  formulationContext: 'A specific extract was studied; equivalence across preparations is not established.',
  doseContext: 'Dose values are study context only and are not consumer instructions.',
}

describe('distribution field-level provenance', () => {
  it('binds factual payloads to exact canonical fields and hashes', () => {
    const pack = buildDistributionPackFromResearchObject(object, { researchObjects: [object] })

    expect(pack.provenanceReceipts).toEqual(expect.arrayContaining([
      {
        targetPath: '$.claims[0].publicSafeStatement',
        canonicalField: 'finding',
        sourceRef: 'RESEARCH_OBJECT_001',
        fieldHash: hashCanonicalField(object.finding),
      },
      {
        targetPath: '$.uncertainties[0].statement',
        canonicalField: 'limitation',
        sourceRef: 'RESEARCH_OBJECT_001',
        fieldHash: hashCanonicalField(object.limitation),
      },
      {
        targetPath: '$.claims[0].studyContext.formulation',
        canonicalField: 'formulationContext',
        sourceRef: 'RESEARCH_OBJECT_001',
        fieldHash: hashCanonicalField(object.formulationContext),
      },
    ]))
    expect(pack.provenanceReceipts.some(({ canonicalField }) => canonicalField === 'durationContext')).toBe(false)
    expect(validateDistributionPack(pack, { researchObjects: [object] })).toEqual([])
  })

  it('fails closed when a receipt field path or field hash is tampered', () => {
    const pack = buildDistributionPackFromResearchObject(object, { researchObjects: [object] })

    const wrongHash = structuredClone(pack)
    wrongHash.provenanceReceipts[0].fieldHash = '0'.repeat(64)
    expect(validateDistributionPack(wrongHash, { researchObjects: [object] }))
      .toContainEqual(expect.objectContaining({ path: '$.provenanceReceipts' }))

    const wrongField = structuredClone(pack)
    wrongField.provenanceReceipts[0].canonicalField = 'limitation'
    expect(validateDistributionPack(wrongField, { researchObjects: [object] }))
      .toContainEqual(expect.objectContaining({ path: '$.provenanceReceipts' }))
  })
})
