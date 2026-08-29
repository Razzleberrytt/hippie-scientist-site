import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { validateDistributionPack } from '../distribution-pack-contract.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const researchObjects = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../data/distribution/research-objects.json'), 'utf8'))
const researchObject = researchObjects[0]
const canonicalPack = buildDistributionPackFromResearchObject(researchObject, { researchObjects })

const clone = (value) => structuredClone(value)
const messages = (pack) => validateDistributionPack(pack, { researchObjects }).map(({ path, message }) => `${path}: ${message}`).join('\n')

describe('primary distribution validator canonical citation binding', () => {
  it('accepts the exact governed claim/source citation identity', () => {
    expect(validateDistributionPack(canonicalPack, { researchObjects })).toEqual([])
  })

  it('fails closed when the complete citation tuple is omitted', () => {
    const pack = clone(canonicalPack)
    delete pack.source.findingClaimId
    delete pack.source.primarySourceId
    delete pack.source.primarySourceUrl
    expect(messages(pack)).toMatch(/schema: must have required property 'findingClaimId'/i)
    expect(messages(pack)).toMatch(/schema: must have required property 'primarySourceId'/i)
    expect(messages(pack)).toMatch(/schema: must have required property 'primarySourceUrl'/i)
  })

  it.each([
    ['findingClaimId', 'clm_deadbeef', /source\.findingClaimId.*canonical research-object findingClaimId/i],
    ['primarySourceId', 'src_deadbeef', /source\.primarySourceId.*canonical research-object primarySourceId/i],
    ['primarySourceUrl', 'https://example.org/not-the-governed-study', /source\.primarySourceUrl.*canonical research-object primarySourceUrl/i],
  ])('rejects schema-valid drift in source.%s', (field, replacement, expected) => {
    const pack = clone(canonicalPack)
    pack.source[field] = replacement
    expect(messages(pack)).toMatch(expected)
  })
})
