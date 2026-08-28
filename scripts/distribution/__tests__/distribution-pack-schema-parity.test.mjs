import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const root = path.resolve(path.dirname(__filename), '../../..')
const schema = JSON.parse(readFileSync(path.join(root, 'schemas/distribution-pack-v1.schema.json'), 'utf8'))
const validatorSource = readFileSync(path.join(root, 'scripts/distribution/distribution-pack-contract.mjs'), 'utf8')

describe('distribution pack schema/validator parity', () => {
  it('uses the published v1 JSON Schema as the runtime structural validator', () => {
    expect(schema.properties.assetIntents.items.properties.type.enum).toEqual([
      'infographic',
      'carousel',
      'short-video',
      'social-card',
      'pinterest',
    ])
    expect(schema.$defs.claim.properties.evidenceContext.enum).toEqual([
      'human',
      'preclinical',
      'mixed',
    ])
    expect(schema.$defs.sourceReference.properties.kind.const).toBe('research-object')
    expect(validatorSource).toContain("const distributionPackSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))")
    expect(validatorSource).toContain('const validateSchema = ajv.compile(distributionPackSchema)')
    expect(validatorSource).toContain('if (!validateSchema(pack))')
  })

  it('keeps v1 no-rewrite, governed-safety, and no-consumer-instruction invariants explicit in both layers', () => {
    expect(schema.$defs.claim.properties.strengthDelta.const).toBe('none')
    expect(schema.$defs.claim.properties.consumerInstruction.const).toBe(false)
    expect(schema.properties.safety.maxItems).toBe(1)
    expect(schema.$defs.safetyStatement.required).toEqual(['id', 'canonicalClaimId', 'statement', 'sourceRefs'])
    expect(schema.properties.assetIntents.items.properties.objective.const).toBe('Render the canonical finding without factual rewriting.')
    expect(validatorSource).toContain("claim.strengthDelta !== 'none'")
    expect(validatorSource).toContain('distribution packs never authorize consumer instructions')
    expect(validatorSource).toContain('v1 forbids free-form factual rewriting')
    expect(validatorSource).toContain('must resolve exactly once on the canonical source page')
    expect(validatorSource).toContain('must resolve to an approved has_safety_warning claim')
    expect(validatorSource).toContain('safetyStatement must exactly equal approved canonical claim')
  })
})
