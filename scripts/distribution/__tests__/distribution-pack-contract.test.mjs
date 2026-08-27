import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { hashResearchObject, validateDistributionPack } from '../distribution-pack-contract.mjs'

const __filename = fileURLToPath(import.meta.url)
const schemaPath = path.resolve(path.dirname(__filename), '../../../schemas/distribution-pack-v1.schema.json')
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))

const FIXED_BOUNDARIES = [
  'Do not strengthen the canonical research finding.',
  'Do not convert dose/form context into consumer instructions.',
  'Do not project preclinical evidence as human efficacy or benefit.',
]

const canonicalHumanObject = {
  id: 'ashwagandha-stress-evidence',
  title: 'Ashwagandha and stress outcomes in human trials',
  finding: 'Human studies report changes in stress-related outcomes, but results vary by formulation and population.',
  evidenceType: 'RCT',
  evidenceGrade: 'B',
  limitation: 'The evidence is limited by study size, formulation differences, and population differences.',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  primarySourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/31517876/',
  trialCount: 2,
  participants: 120,
  doseContext: 'Study-specific extract and dose context only; not a consumer dosing instruction.',
  populationContext: 'Adults enrolled in the cited human studies.',
  lastVerified: '2026-08-26',
}

function evidenceContextFor(object) {
  if (object.evidenceType === 'preclinical') return 'preclinical'
  if (['mixed', 'narrative-review'].includes(object.evidenceType)) return 'mixed'
  return 'human'
}

function packForResearchObject(object) {
  const sourceUrl = object.sourceUrl.endsWith('/') ? object.sourceUrl : `${object.sourceUrl}/`
  return {
    schemaVersion: '1.0.0',
    packId: `${object.id.replace(/[._]+/g, '-').replace(/-+/g, '-')}-media-v1`,
    researchObjectIds: [object.id],
    source: {
      url: sourceUrl,
      title: object.title,
      contentHash: hashResearchObject(object),
    },
    audience: 'General educational audience',
    angle: 'What the evidence actually says',
    claims: [
      {
        id: 'CLAIM_001',
        sourceStatement: object.finding,
        publicSafeStatement: object.finding,
        strengthDelta: 'none',
        evidenceContext: evidenceContextFor(object),
        sourceRefs: ['RESEARCH_OBJECT_001'],
        consumerInstruction: false,
        studyContext: {
          population: object.populationContext ?? null,
          formulation: null,
          dose: object.doseContext ?? null,
          duration: null,
        },
      },
    ],
    sources: [
      {
        id: 'RESEARCH_OBJECT_001',
        kind: 'research-object',
        identifier: object.id,
        url: sourceUrl,
      },
    ],
    safety: [],
    uncertainties: [
      {
        id: 'UNCERTAINTY_001',
        statement: object.limitation,
        sourceRefs: ['RESEARCH_OBJECT_001'],
      },
    ],
    forbiddenExtrapolations: [...FIXED_BOUNDARIES],
    cta: {
      label: 'Read the evidence',
      destinationUrl: sourceUrl,
    },
    assetIntents: [
      {
        type: 'infographic',
        objective: 'Render the canonical finding without factual rewriting.',
        claimIds: ['CLAIM_001'],
      },
      {
        type: 'short-video',
        objective: 'Render the canonical finding without factual rewriting.',
        claimIds: ['CLAIM_001'],
      },
    ],
  }
}

function mutate(value, mutator) {
  const copy = structuredClone(value)
  mutator(copy)
  return copy
}

function messages(pack, researchObjects = [canonicalHumanObject]) {
  return validateDistributionPack(pack, { researchObjects }).map(({ path, message }) => `${path}: ${message}`)
}

describe('distribution pack v1 contract', () => {
  it('keeps v1 intentionally narrow and deterministic', () => {
    expect(schema.properties.schemaVersion.const).toBe('1.0.0')
    expect(schema.properties.researchObjectIds.maxItems).toBe(1)
    expect(schema.$defs.sourceReference.properties.kind.const).toBe('research-object')
    expect(schema.$defs.claim.properties.strengthDelta.const).toBe('none')
    expect(schema.$defs.claim.properties.consumerInstruction.const).toBe(false)
    expect(schema.properties.safety.maxItems).toBe(0)
    expect(schema.properties.assetIntents.items.properties.type.enum).toContain('short-video')
  })

  it('accepts a deterministic projection of a canonical research object', () => {
    const pack = packForResearchObject(canonicalHumanObject)
    expect(messages(pack)).toEqual([])
  })

  it('enforces the declared JSON schema before semantic validation', () => {
    const pack = packForResearchObject(canonicalHumanObject)
    const wrongStudyContext = messages(mutate(pack, (copy) => {
      copy.claims[0].studyContext = 'Take 600 mg daily'
    }))
    expect(wrongStudyContext.some((message) => message.includes('schema:'))).toBe(true)

    const undeclaredProperty = messages(mutate(pack, (copy) => {
      copy.claims[0].secretInstruction = 'Take 600 mg daily'
    }))
    expect(undeclaredProperty.some((message) => message.includes('schema:'))).toBe(true)
  })

  it('resolves research-object identity against the canonical registry, not the pack itself', () => {
    const fabricated = {
      ...canonicalHumanObject,
      id: 'invented-object',
    }
    const pack = packForResearchObject(fabricated)
    const result = messages(pack, [canonicalHumanObject])
    expect(result.some((message) => message.includes('does not resolve to canonical research object invented-object'))).toBe(true)
  })

  it('derives source identity, title, destination, and content hash from the canonical object', () => {
    const pack = packForResearchObject(canonicalHumanObject)

    const badHash = messages(mutate(pack, (copy) => {
      copy.source.contentHash = 'a'.repeat(64)
    }))
    expect(badHash.some((message) => message.includes('deterministic hash'))).toBe(true)

    const badSource = messages(mutate(pack, (copy) => {
      copy.sources[0].identifier = 'invented-object'
    }))
    expect(badSource.some((message) => message.includes('must resolve to canonical research object'))).toBe(true)

    const badDestination = messages(mutate(pack, (copy) => {
      copy.cta.destinationUrl = 'https://thehippiescientist.net/guides/sleep/'
    }))
    expect(badDestination.some((message) => message.includes('canonical research-object sourceUrl'))).toBe(true)
  })

  it('does not trust self-attested strengthDelta or free-form factual rewrites', () => {
    const pack = packForResearchObject(canonicalHumanObject)
    const stronger = messages(mutate(pack, (copy) => {
      copy.claims[0].publicSafeStatement = 'Ashwagandha is proven to cure stress and insomnia.'
    }))
    expect(stronger.some((message) => message.includes('forbids free-form factual rewriting'))).toBe(true)

    const changedSource = messages(mutate(pack, (copy) => {
      copy.claims[0].sourceStatement = 'A different claim.'
    }))
    expect(changedSource.some((message) => message.includes('canonical research-object finding'))).toBe(true)

    const selfAttestedWeaker = messages(mutate(pack, (copy) => {
      copy.claims[0].strengthDelta = 'weaker'
    }))
    expect(selfAttestedWeaker.some((message) => message.includes('schema:'))).toBe(true)
  })

  it('rejects common directive consumer-dose language even when it exists upstream', () => {
    for (const directive of [
      'Take 600 mg daily for stress.',
      'Use 600 mg daily for stress.',
      'Take one 600 mg capsule daily.',
      'Take 2 capsules daily.',
      'Use 3 tablets nightly.',
      'Take four capsules daily.',
      'Use twelve drops nightly.',
      'Take four pills daily for sleep.',
      'Take two gummies daily for sleep.',
      'Use one softgel nightly.',
      'Use one capsule nightly.',
      'Start with 300 mg before bed.',
      'Begin with 2 capsules.',
      'Begin with four capsules.',
      'You should use this supplement before bed.',
      'Use this supplement daily.',
    ]) {
      const unsafeObject = { ...canonicalHumanObject, finding: directive }
      const result = messages(packForResearchObject(unsafeObject), [unsafeObject])
      expect(result.some((message) => message.includes('directive consumer-dose language')), directive).toBe(true)
    }
  })

  it('keeps preclinical findings explicit and requires every human-directed clause to be bounded', () => {
    for (const projected of [
      'Animal evidence suggests this pathway may change, showing efficacy in humans.',
      'Animal evidence suggests people may experience better memory.',
      'Preclinical research suggests adults could benefit from better sleep.',
      'Animal studies suggest you may sleep better.',
      'Animal studies do not establish benefits in humans, but they prove efficacy for patients.',
      'Animal studies do not establish benefits in humans and prove efficacy for patients.',
      'Animal studies do not establish benefits in humans while showing efficacy for patients.',
    ]) {
      const unsafeObject = { ...canonicalHumanObject, evidenceType: 'preclinical', finding: projected }
      const result = messages(packForResearchObject(unsafeObject), [unsafeObject])
      expect(result.some((message) => message.includes('cannot be projected as a human or second-person benefit')), projected).toBe(true)
    }

    const unlabeledObject = {
      ...canonicalHumanObject,
      evidenceType: 'preclinical',
      finding: 'The compound changed this signaling pathway.',
    }
    expect(messages(packForResearchObject(unlabeledObject), [unlabeledObject]).some((message) => message.includes('must remain explicitly labeled'))).toBe(true)

    const boundedObject = {
      ...canonicalHumanObject,
      evidenceType: 'preclinical',
      finding: 'Animal evidence suggests a signaling change; it does not establish benefits in humans.',
    }
    expect(messages(packForResearchObject(boundedObject), [boundedObject])).toEqual([])
  })

  it('locks study context and uncertainty to canonical research-object fields', () => {
    const pack = packForResearchObject(canonicalHumanObject)

    const changedDose = messages(mutate(pack, (copy) => {
      copy.claims[0].studyContext.dose = 'Take 600 mg daily.'
    }))
    expect(changedDose.some((message) => message.includes('canonical doseContext'))).toBe(true)

    const changedPopulation = messages(mutate(pack, (copy) => {
      copy.claims[0].studyContext.population = 'Everyone'
    }))
    expect(changedPopulation.some((message) => message.includes('canonical populationContext'))).toBe(true)

    const changedLimitation = messages(mutate(pack, (copy) => {
      copy.uncertainties[0].statement = 'No meaningful limitations.'
    }))
    expect(changedLimitation.some((message) => message.includes('canonical research-object limitation'))).toBe(true)
  })

  it('does not allow the pack to invent safety facts, source facts, or weaker guardrails', () => {
    const pack = packForResearchObject(canonicalHumanObject)

    const inventedSafety = messages(mutate(pack, (copy) => {
      copy.safety.push({ id: 'SAFE_001', statement: 'Safe for everyone.', sourceRefs: ['RESEARCH_OBJECT_001'] })
    }))
    expect(inventedSafety.some((message) => message.includes('schema:'))).toBe(true)

    const extraSource = messages(mutate(pack, (copy) => {
      copy.sources.push({ id: 'SRC_002', kind: 'research-object', identifier: canonicalHumanObject.id, url: canonicalHumanObject.sourceUrl })
    }))
    expect(extraSource.some((message) => message.includes('schema:'))).toBe(true)

    const weakenedBoundary = messages(mutate(pack, (copy) => {
      copy.forbiddenExtrapolations[0] = 'Try not to overstate things.'
    }))
    expect(weakenedBoundary.some((message) => message.includes('complete fixed v1'))).toBe(true)
  })
})
