import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { hashResearchObject, validateDistributionPack } from '../distribution-pack-contract.mjs'
import { MAX_PUBLICATION_STATUS_AGE_DAYS, validateDistributionPublicationIntegrity } from '../distribution-publication-integrity.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const researchObjects = JSON.parse(fs.readFileSync(path.resolve(here, '../../../data/distribution/research-objects.json'), 'utf8'))
const canonical = researchObjects.find((item) => item.id === 'ashwagandha-stress-evidence')
const FIXED_NOW = new Date('2026-08-29T12:00:00Z')

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

describe('distribution publication integrity', () => {
  it('projects the exact canonical publication-integrity payload', () => {
    const pack = buildDistributionPackFromResearchObject(canonical)
    expect(pack.source.publicationStatus).toBe('published')
    expect(pack.source.publicationStatusCheckedAt).toBe('2026-08-29')
    expect(pack.source.publicationStatusAuthorityUrl).toBe('https://onlinelibrary.wiley.com/doi/abs/10.1002/ptr.7598')
    expect(validateDistributionPublicationIntegrity(pack, canonical, { now: FIXED_NOW })).toEqual([])
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
    expect(validateDistributionPublicationIntegrity(pack, canonical, { now: FIXED_NOW }).join('\n')).toMatch(/must equal canonical/i)
  })

  it.each([
    '2026-02-30',
    '2026-13-01',
  ])('rejects impossible publication verification calendar date %s', (checkedAt) => {
    const researchObject = clone(canonical)
    const pack = buildDistributionPackFromResearchObject(canonical)
    researchObject.publicationStatusCheckedAt = checkedAt
    pack.source.publicationStatusCheckedAt = checkedAt
    expect(validateDistributionPublicationIntegrity(pack, researchObject, { now: FIXED_NOW }).join('\n')).toMatch(/real YYYY-MM-DD calendar date/i)
  })

  it('rejects future-dated publication verification', () => {
    const researchObject = clone(canonical)
    const pack = buildDistributionPackFromResearchObject(canonical)
    researchObject.publicationStatusCheckedAt = '2026-08-30'
    pack.source.publicationStatusCheckedAt = '2026-08-30'
    expect(validateDistributionPublicationIntegrity(pack, researchObject, { now: FIXED_NOW }).join('\n')).toMatch(/future-dated/i)
  })

  it('rejects stale published verification beyond the governed freshness window', () => {
    const researchObject = clone(canonical)
    const pack = buildDistributionPackFromResearchObject(canonical)
    researchObject.publicationStatusCheckedAt = '2026-05-30'
    pack.source.publicationStatusCheckedAt = '2026-05-30'
    expect(MAX_PUBLICATION_STATUS_AGE_DAYS).toBe(90)
    expect(validateDistributionPublicationIntegrity(pack, researchObject, { now: FIXED_NOW }).join('\n')).toMatch(/stale/i)
  })

  it('rejects a stale self-consistent pack/canonical pair at the shared pack-consumption boundary', () => {
    const researchObject = clone(canonical)
    researchObject.publicationStatusCheckedAt = '2026-05-01'
    const pack = buildDistributionPackFromResearchObject(canonical)
    pack.source.publicationStatusCheckedAt = '2026-05-01'
    pack.source.contentHash = hashResearchObject(researchObject)

    expect(validateDistributionPack(pack, {
      researchObjects: [researchObject],
      now: FIXED_NOW,
    }).map(({ message }) => message).join('\n')).toMatch(/stale/i)
  })

  it.each([
    'expression-of-concern',
    'retracted',
    'withdrawn',
  ])('quarantines canonical %s evidence from ordinary distribution-pack generation', (status) => {
    const researchObject = clone(canonical)
    researchObject.publicationStatus = status
    expect(researchObject.publicationStatus).toBe(status)
    expect(() => buildDistributionPackFromResearchObject(researchObject)).toThrow(/not eligible for distribution|schema/i)
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

    expect(validateDistributionPublicationIntegrity(pack, researchObject, { now: FIXED_NOW }).join('\n')).toMatch(/not eligible for distribution/i)
  })

  it.each([
    'expression-of-concern',
    'retracted',
    'withdrawn',
  ])('rejects canonical %s evidence at the shared pack-consumption boundary', (status) => {
    const researchObject = clone(canonical)
    researchObject.publicationStatus = status
    const pack = buildDistributionPackFromResearchObject(canonical)
    pack.source.publicationStatus = status
    pack.source.contentHash = hashResearchObject(researchObject)

    expect(validateDistributionPack(pack, { researchObjects: [researchObject], now: FIXED_NOW }).map(({ message }) => message).join('\n')).toMatch(/schema|not eligible for distribution/i)
  })
})
