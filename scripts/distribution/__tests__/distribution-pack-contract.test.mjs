import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateDistributionPack } from '../distribution-pack-contract.mjs'

const __filename = fileURLToPath(import.meta.url)
const schemaPath = path.resolve(path.dirname(__filename), '../../../schemas/distribution-pack-v1.schema.json')
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))

const validPack = {
  schemaVersion: '1.0.0',
  packId: 'ashwagandha-stress-evidence-v1',
  researchObjectIds: ['ashwagandha-stress-evidence'],
  source: {
    url: 'https://thehippiescientist.net/herbs/ashwagandha/',
    title: 'Ashwagandha',
    contentHash: 'a'.repeat(64),
  },
  audience: 'Adults looking for a plain-language evidence summary',
  angle: 'What the human evidence can and cannot establish',
  claims: [
    {
      id: 'CLM_STRESS_001',
      sourceStatement: 'Selected human studies report changes in stress-related outcomes.',
      publicSafeStatement: 'Some human studies report changes in stress-related outcomes, but the evidence does not establish a universal effect.',
      strengthDelta: 'weaker',
      evidenceContext: 'human',
      sourceRefs: ['SRC_RESEARCH_OBJECT', 'SRC_001'],
      consumerInstruction: false,
      studyContext: {
        population: 'Adults enrolled in the cited human study',
        formulation: 'Study-specific extract',
        dose: 'Study-context only',
        duration: 'Study-context only',
      },
    },
  ],
  sources: [
    {
      id: 'SRC_RESEARCH_OBJECT',
      kind: 'research-object',
      identifier: 'ashwagandha-stress-evidence',
      url: 'https://thehippiescientist.net/herbs/ashwagandha/',
    },
    {
      id: 'SRC_001',
      kind: 'site-evidence-record',
      identifier: 'ashwagandha-human-stress-record',
      url: 'https://thehippiescientist.net/herbs/ashwagandha/',
    },
  ],
  safety: [
    {
      id: 'SAFE_001',
      statement: 'Safety considerations and interactions remain part of the source-page context.',
      sourceRefs: ['SRC_RESEARCH_OBJECT'],
    },
  ],
  uncertainties: [
    {
      id: 'UNC_001',
      statement: 'Results should not be generalized beyond the populations and formulations represented by the evidence.',
      sourceRefs: ['SRC_RESEARCH_OBJECT'],
    },
  ],
  forbiddenExtrapolations: [
    'Do not convert study-context doses into consumer dosing instructions.',
    'Do not convert association or limited evidence into guaranteed efficacy.',
  ],
  cta: {
    label: 'Read the evidence summary',
    destinationUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  },
  assetIntents: [
    {
      type: 'infographic',
      objective: 'Summarize the evidence and uncertainty without strengthening the claim.',
      claimIds: ['CLM_STRESS_001'],
    },
    {
      type: 'short-video',
      objective: 'Create a 30-second evidence explainer with a source card.',
      claimIds: ['CLM_STRESS_001'],
    },
  ],
}

function mutate(mutator) {
  const copy = structuredClone(validPack)
  mutator(copy)
  return copy
}

function messages(pack) {
  return validateDistributionPack(pack).map(({ path, message }) => `${path}: ${message}`)
}

describe('distribution pack v1 contract', () => {
  it('keeps the JSON schema aligned with the fail-closed v1 boundaries', () => {
    expect(schema.properties.schemaVersion.const).toBe('1.0.0')
    expect(schema.properties.researchObjectIds.minItems).toBe(1)
    expect(schema.$defs.sourceReference.properties.kind.enum).toContain('research-object')
    expect(schema.$defs.claim.properties.strengthDelta.enum).toEqual(['none', 'weaker'])
    expect(schema.$defs.claim.properties.consumerInstruction.const).toBe(false)
    expect(schema.properties.assetIntents.items.properties.type.enum).toContain('short-video')
  })

  it('accepts a traceable claim-safe distribution pack', () => {
    expect(validateDistributionPack(validPack)).toEqual([])
  })

  it('requires every pack and claim to retain canonical research-object lineage', () => {
    const noPackLineage = messages(mutate((pack) => {
      pack.researchObjectIds = []
    }))
    expect(noPackLineage.some((message) => message.includes('canonical research distribution object'))).toBe(true)

    const missingDeclaredSource = messages(mutate((pack) => {
      pack.sources = pack.sources.filter((source) => source.kind !== 'research-object')
      pack.claims[0].sourceRefs = ['SRC_001']
    }))
    expect(missingDeclaredSource.some((message) => message.includes('must declare a research-object source'))).toBe(true)
    expect(missingDeclaredSource.some((message) => message.includes('must retain lineage'))).toBe(true)

    const undeclaredResearchSource = messages(mutate((pack) => {
      pack.sources[0].identifier = 'different-research-object'
    }))
    expect(undeclaredResearchSource.some((message) => message.includes('not declared in researchObjectIds'))).toBe(true)
  })

  it('rejects claim strengthening', () => {
    const result = messages(mutate((pack) => {
      pack.claims[0].strengthDelta = 'stronger'
    }))
    expect(result.some((message) => message.includes('strengthening is never allowed'))).toBe(true)
  })

  it('rejects unknown citation bindings', () => {
    const result = messages(mutate((pack) => {
      pack.claims[0].sourceRefs = ['SRC_RESEARCH_OBJECT', 'SRC_MISSING']
    }))
    expect(result.some((message) => message.includes('references unknown source SRC_MISSING'))).toBe(true)
  })

  it('rejects directive consumer-dose language', () => {
    const result = messages(mutate((pack) => {
      pack.claims[0].publicSafeStatement = 'Take 600 mg daily for stress.'
    }))
    expect(result.some((message) => message.includes('directive consumer-dose language'))).toBe(true)
  })

  it('keeps preclinical claims explicitly preclinical', () => {
    const unlabeled = messages(mutate((pack) => {
      pack.claims[0].evidenceContext = 'preclinical'
      pack.claims[0].publicSafeStatement = 'The compound changed this signaling pathway.'
    }))
    expect(unlabeled.some((message) => message.includes('must remain explicitly labeled'))).toBe(true)

    const humanProjection = messages(mutate((pack) => {
      pack.claims[0].evidenceContext = 'preclinical'
      pack.claims[0].publicSafeStatement = 'Animal evidence suggests this pathway may change, showing efficacy in humans.'
    }))
    expect(humanProjection.some((message) => message.includes('cannot be projected as human efficacy'))).toBe(true)
  })

  it('rejects stale/untraceable source identity inputs', () => {
    const badUrl = messages(mutate((pack) => {
      pack.source.url = 'https://example.com/ashwagandha'
    }))
    expect(badUrl.some((message) => message.includes('canonical TheHippieScientist page URL'))).toBe(true)

    const badHash = messages(mutate((pack) => {
      pack.source.contentHash = 'not-a-sha'
    }))
    expect(badHash.some((message) => message.includes('SHA-256'))).toBe(true)
  })

  it('rejects asset intents that reference missing or duplicate claim IDs', () => {
    const missing = messages(mutate((pack) => {
      pack.assetIntents[0].claimIds = ['CLM_UNKNOWN']
    }))
    expect(missing.some((message) => message.includes('references unknown claim CLM_UNKNOWN'))).toBe(true)

    const duplicate = messages(mutate((pack) => {
      pack.assetIntents[0].claimIds = ['CLM_STRESS_001', 'CLM_STRESS_001']
    }))
    expect(duplicate.some((message) => message.includes('must not duplicate a claim ID'))).toBe(true)
  })

  it('requires globally unique IDs for unambiguous provenance', () => {
    const result = messages(mutate((pack) => {
      pack.safety[0].id = 'CLM_STRESS_001'
    }))
    expect(result.some((message) => message.includes('globally unique within the pack'))).toBe(true)
  })
})
