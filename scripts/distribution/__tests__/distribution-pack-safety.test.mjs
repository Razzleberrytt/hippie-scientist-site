import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { hashCanonicalField, validateDistributionPack } from '../distribution-pack-contract.mjs'

const root = process.cwd()
const researchObjects = JSON.parse(fs.readFileSync(path.join(root, 'data/distribution/research-objects.json'), 'utf8'))
const ashwagandha = JSON.parse(fs.readFileSync(path.join(root, 'public/data/herbs-detail/ashwagandha.json'), 'utf8'))
const object = researchObjects.find(({ id }) => id === 'ashwagandha-stress-evidence')

describe('governed distribution safety projection', () => {
  it('binds the Ashwagandha safety payload to an approved canonical safety claim', () => {
    const canonicalClaim = ashwagandha.claimMap.find(({ id }) => id === object.safetyClaimId)

    expect(canonicalClaim).toMatchObject({
      id: 'clm_9318758bf577',
      predicate: 'has_safety_warning',
      reviewStatus: 'approved',
    })
    expect(object.safetyStatement).toBe(canonicalClaim.claim)

    const pack = buildDistributionPackFromResearchObject(object, { researchObjects })
    expect(pack.safety).toEqual([{
      id: 'SAFETY_001',
      canonicalClaimId: canonicalClaim.id,
      statement: canonicalClaim.claim,
      sourceRefs: ['RESEARCH_OBJECT_001'],
    }])
    expect(pack.provenanceReceipts).toContainEqual({
      targetPath: '$.safety[0].statement',
      canonicalField: 'safetyStatement',
      sourceRef: 'RESEARCH_OBJECT_001',
      fieldHash: hashCanonicalField(canonicalClaim.claim),
    })
    expect(validateDistributionPack(pack, { researchObjects })).toEqual([])
  })

  it('fails closed when downstream safety text or claim identity is changed', () => {
    const pack = buildDistributionPackFromResearchObject(object, { researchObjects })

    const changedText = structuredClone(pack)
    changedText.safety[0].statement = 'Ashwagandha is generally safe for everyone.'
    expect(validateDistributionPack(changedText, { researchObjects }))
      .toContainEqual(expect.objectContaining({ path: '$.safety[0].statement' }))

    const changedClaim = structuredClone(pack)
    changedClaim.safety[0].canonicalClaimId = 'clm_deadbeef'
    expect(validateDistributionPack(changedClaim, { researchObjects }))
      .toContainEqual(expect.objectContaining({ path: '$.safety[0].canonicalClaimId' }))
  })

  it('rejects a fabricated safety ID and statement even when the research object supplies both', () => {
    const fabricated = structuredClone(object)
    fabricated.safetyClaimId = 'clm_deadbeef'
    fabricated.safetyStatement = 'Avoid this herb in every population because severe interactions are established.'
    const pack = buildDistributionPackFromResearchObject(fabricated, { researchObjects: [fabricated] })
    const errors = validateDistributionPack(pack, { researchObjects: [fabricated] })

    expect(errors).toContainEqual(expect.objectContaining({
      path: '$.researchObjectIds',
      message: expect.stringContaining('must resolve exactly once on the canonical source page'),
    }))
  })

  it('does not invent safety when the canonical research object owns none', () => {
    const sparse = structuredClone(object)
    delete sparse.safetyClaimId
    delete sparse.safetyStatement
    const pack = buildDistributionPackFromResearchObject(sparse, { researchObjects: [sparse] })

    expect(pack.safety).toEqual([])
    expect(pack.provenanceReceipts.some(({ canonicalField }) => canonicalField === 'safetyStatement')).toBe(false)
    expect(validateDistributionPack(pack, { researchObjects: [sparse] })).toEqual([])
  })
})
