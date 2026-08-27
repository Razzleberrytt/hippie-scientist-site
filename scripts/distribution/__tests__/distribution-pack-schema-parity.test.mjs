import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const root = path.resolve(path.dirname(__filename), '../../..')
const schema = JSON.parse(readFileSync(path.join(root, 'schemas/distribution-pack-v1.schema.json'), 'utf8'))
const validatorSource = readFileSync(path.join(root, 'scripts/distribution/distribution-pack-contract.mjs'), 'utf8')

describe('distribution pack schema/validator parity', () => {
  it('keeps safety-critical enum contracts synchronized', () => {
    const assetTypes = schema.properties.assetIntents.items.properties.type.enum
    const contexts = schema.$defs.claim.properties.evidenceContext.enum
    const sourceKinds = schema.$defs.sourceReference.properties.kind.enum

    for (const value of assetTypes) expect(validatorSource).toContain(`'${value}'`)
    for (const value of contexts) expect(validatorSource).toContain(`'${value}'`)
    for (const value of sourceKinds) expect(validatorSource).toContain(`'${value}'`)
  })

  it('keeps the non-strengthening and no-consumer-instruction invariants explicit in both layers', () => {
    expect(schema.$defs.claim.properties.strengthDelta.enum).toEqual(['none', 'weaker'])
    expect(schema.$defs.claim.properties.consumerInstruction.const).toBe(false)
    expect(validatorSource).toContain("['none', 'weaker']")
    expect(validatorSource).toContain('consumerInstruction !== false')
  })
})
