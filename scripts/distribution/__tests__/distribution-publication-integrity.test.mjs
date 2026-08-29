import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { validateDistributionPublicationIntegrity } from '../distribution-publication-integrity.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const researchObjects = JSON.parse(fs.readFileSync(path.resolve(here, '../../../data/distribution/research-objects.json'), 'utf8'))
const canonical = researchObjects.find((item) => item.id === 'ashwagandha-stress-evidence')

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

describe('distribution publication integrity', () => {
  it('projects the exact canonical publication-integrity payload', () => {
    const pack = buildDistributionPackFromResearchObject(canonical)
    expect(pack.source.publicationStatus).toBe('published')
    expect(pack.source.publicationStatusCheckedAt).toBe('2026-08-29')
    expect(pack.source.publicationStatusAuthorityUrl).toBe('https://onlinelibrary.wiley.com/doi/abs/10.1002/ptr.7598')
    expect(validateDistributionPublicationIntegrity(pack, canonical)).toEqual([])
  })

  it.each([
    'publicationStatus',
    'publicationStatusCheckedAt',
    'publicationStatusAuthorityUrl',
  ])('fails pack generation when canonical %s is missing', (field) => {
    const researchObject = clone(canonical)
    delete researchObject[field]
    expect(() => buildDistributionPackFromResearchObject(researchObject)).toThrow(/publication/i)
  })

  it.each([
    ['publicationStatus', 'expression-of-concern'],
    ['publicationStatusCheckedAt', '2026-08-28'],
    ['publicationStatusAuthorityUrl', 'https://example.org/not-the-canonical-authority'],
  ])('rejects schema-valid drift in %s', (field, value) => {
    const pack = buildDistributionPackFromResearchObject(canonical)
    pack.source[field] = value
    expect(validateDistributionPublicationIntegrity(pack, canonical).join('\n')).toMatch(/must equal canonical/i)
  })

  it.each([
    'expression-of-concern',
    'retracted',
    'withdrawn',
  ])('quarantines canonical %s evidence from ordinary distribution-pack generation', (status) => {
    const researchObject = clone(canonical)
    researchObject.publicationStatus = status
    expect(researchObject.publicationStatus).toBe(status)
    expect(() => buildDistributionPackFromResearchObject(researchObject)).toThrow(/not eligible for distribution/i)
  })

  it.each([
    'expression-of-concern',
    'retracted',
    'withdrawn',
  ])('rejects a self-consistent pack/canonical pair when publication status is %s', (status) => {
    const researchObject = clone(canonical)
    researchObject.publicationStatus = status
    const pack = buildDistributionPackFromResearchObject(canonical)
    pack.source.publicationStatus = status

    expect(validateDistributionPublicationIntegrity(pack, researchObject).join('\n')).toMatch(/not eligible for distribution/i)
  })
})
