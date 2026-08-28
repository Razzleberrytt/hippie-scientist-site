import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { hashCanonicalField, validateDistributionPack } from '../distribution-pack-contract.mjs'

const root = process.cwd()
const researchObjects = JSON.parse(fs.readFileSync(path.join(root, 'data/distribution/research-objects.json'), 'utf8'))
const ashwagandha = JSON.parse(fs.readFileSync(path.join(root, 'public/data/herbs-detail/ashwagandha.json'), 'utf8'))
const object = researchObjects.find(({ id }) => id === 'ashwagandha-stress-evidence')

// #4457 exact-head validation anchor: governed safety completeness must preserve every approved canonical warning with claim identity intact.
describe('governed distribution safety projection', () => {
  it('preserves all approved Ashwagandha safety warnings with deterministic provenance', () => {
    const canonicalClaims = ashwagandha.claimMap.filter(({ predicate, reviewStatus }) => (
      predicate === 'has_safety_warning' && reviewStatus === 'approved'
    ))

    expect(canonicalClaims.map(({ id }) => id).sort()).toEqual([
      'clm_9318758bf577',
      'clm_d6711d6cd0c9',
    ])
    expect(object.safetyWarnings).toHaveLength(canonicalClaims.length)

    const pack = buildDistributionPackFromResearchObject(object, { researchObjects })
    expect(pack.safety).toHaveLength(2)
    for (const [index, warning] of object.safetyWarnings.entries()) {
      const canonicalClaim = canonicalClaims.find(({ id }) => id === warning.claimId)
      expect(canonicalClaim).toBeTruthy()
      expect(warning.statement).toBe(canonicalClaim.claim)
      expect(pack.safety[index]).toEqual({
        id: `SAFETY_${String(index + 1).padStart(3, '0')}`,
        canonicalClaimId: canonicalClaim.id,
        statement: canonicalClaim.claim,
        sourceRefs: ['RESEARCH_OBJECT_001'],
      })
      expect(pack.provenanceReceipts).toContainEqual({
        targetPath: `$.safety[${index}].statement`,
        canonicalField: `safetyWarnings[${index}].statement`,
        sourceRef: 'RESEARCH_OBJECT_001',
        fieldHash: hashCanonicalField(canonicalClaim.claim),
      })
    }
    expect(validateDistributionPack(pack, { researchObjects })).toEqual([])
  })

  it('fails closed when an approved governed safety warning disappears', () => {
    const incomplete = structuredClone(object)
    incomplete.safetyWarnings.pop()

    expect(() => buildDistributionPackFromResearchObject(incomplete, { researchObjects: [incomplete] }))
      .toThrow('must preserve all approved canonical safety claims (1/2 present)')

    const pack = buildDistributionPackFromResearchObject(object, { researchObjects })
    const downstreamOmission = structuredClone(pack)
    downstreamOmission.safety.pop()
    downstreamOmission.provenanceReceipts = downstreamOmission.provenanceReceipts.filter(({ targetPath }) => targetPath !== '$.safety[1].statement')
    expect(validateDistributionPack(downstreamOmission, { researchObjects }))
      .toContainEqual(expect.objectContaining({ path: '$.safety' }))
  })

  it('fails closed when downstream safety text, claim identity, or order is changed', () => {
    const pack = buildDistributionPackFromResearchObject(object, { researchObjects })

    const changedText = structuredClone(pack)
    changedText.safety[0].statement = 'Ashwagandha is generally safe for everyone.'
    expect(validateDistributionPack(changedText, { researchObjects }))
      .toContainEqual(expect.objectContaining({ path: '$.safety[0].statement' }))

    const changedClaim = structuredClone(pack)
    changedClaim.safety[0].canonicalClaimId = 'clm_deadbeef'
    expect(validateDistributionPack(changedClaim, { researchObjects }))
      .toContainEqual(expect.objectContaining({ path: '$.safety[0].canonicalClaimId' }))

    const reordered = structuredClone(pack)
    reordered.safety.reverse()
    expect(validateDistributionPack(reordered, { researchObjects })).not.toEqual([])
  })

  it('rejects a fabricated safety ID and statement even when the research object supplies a complete-sized set', () => {
    const fabricated = structuredClone(object)
    fabricated.safetyWarnings[0] = {
      claimId: 'clm_deadbeef',
      statement: 'Avoid this herb in every population because severe interactions are established.',
    }

    expect(() => buildDistributionPackFromResearchObject(fabricated, { researchObjects: [fabricated] }))
      .toThrow('must resolve exactly once to an approved has_safety_warning claim on the canonical source page')
  })

  it('does not invent safety for intentionally sparse fixtures with no safety payload', () => {
    const sparse = structuredClone(object)
    delete sparse.safetyWarnings
    const pack = buildDistributionPackFromResearchObject(sparse, { researchObjects: [sparse] })

    expect(pack.safety).toEqual([])
    expect(pack.provenanceReceipts.some(({ canonicalField }) => canonicalField.startsWith('safetyWarnings['))).toBe(false)
    expect(validateDistributionPack(pack, { researchObjects: [sparse] })).toEqual([])
  })
})
