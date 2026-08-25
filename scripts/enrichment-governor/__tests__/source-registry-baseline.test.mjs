import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import { evaluateEntryReadiness } from '../../enrichment/normalize-enrichment-lib.mjs'

const ROOT = process.cwd()

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function readJsonl(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => JSON.parse(line))
}

test('all active approved normalized entries have publication-ready source support', () => {
  const registry = readJson('public/data/source-registry.json')
  const registryById = new Map(registry.map(row => [row.sourceId, row]))
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const activeApproved = entries.filter(row => row.active === true && row.editorialStatus === 'approved')

  const blockedBySource = activeApproved.filter(entry => {
    const readiness = evaluateEntryReadiness(entry, registryById.get(entry.sourceId) || null)
    return readiness.reasons.some(reason =>
      reason === 'missing_source_registry_reference' ||
      reason === 'source_inactive' ||
      reason === 'source_publication_status_withdrawn' ||
      reason === 'source_publication_status_superseded'
    )
  })

  assert.deepEqual([...new Set(blockedBySource.map(row => row.sourceId))].sort(), [])
})

test('baseline registry preserves current and historical identities without conflating readiness', () => {
  const registry = readJson('public/data/source-registry.json')
  const baseline = readJson('data-sources/enrichment-source-registry-baseline.json')
  const registryById = new Map(registry.map(row => [row.sourceId, row]))

  assert.equal(baseline.length, 8)
  const historical = registryById.get('src_fda-epidiolex-label-2021')
  assert.ok(historical)
  assert.equal(historical.active, false)
  assert.equal(historical.publicationStatus, 'superseded')

  const current = registryById.get('src_fda-epidiolex-label-2026')
  assert.ok(current)
  assert.equal(current.active, true)
  assert.equal(current.publicationStatus, 'published')
  assert.equal(current.monographId, 'SPL-8bf27097-4870-43fb-94f0-f3d0871d1eec-20260529')

  for (const expected of baseline) {
    const actual = registryById.get(expected.sourceId)
    assert.ok(actual, `missing baseline source ${expected.sourceId}`)
    assert.equal(actual.active, expected.active, `${expected.sourceId} active-state drift`)
    assert.equal(actual.publicationStatus, expected.publicationStatus, `${expected.sourceId} publication-status drift`)
    assert.equal(actual.sourceClass, expected.sourceClass, `${expected.sourceId} source-class drift`)
    assert.equal(actual.evidenceClass, expected.evidenceClass, `${expected.sourceId} evidence-class drift`)
    assert.equal(actual.doi || null, expected.doi || null, `${expected.sourceId} DOI identity drift`)
    assert.equal(actual.pmid || null, expected.pmid || null, `${expected.sourceId} PMID identity drift`)
    assert.equal(actual.canonicalUrl || null, expected.canonicalUrl || null, `${expected.sourceId} URL identity drift`)
    assert.equal(actual.monographId || null, expected.monographId || null, `${expected.sourceId} monograph identity drift`)
  }
})

test('current CBD provenance anchors remain pinned to verified source identities', () => {
  const registry = readJson('public/data/source-registry.json')
  const registryById = new Map(registry.map(row => [row.sourceId, row]))
  const currentLabel = registryById.get('src_fda-epidiolex-label-2026')
  const nonSeizureReview = registryById.get('src_pubmed-36271316')

  assert.equal(currentLabel?.canonicalUrl, 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8bf27097-4870-43fb-94f0-f3d0871d1eec')
  assert.equal(currentLabel?.publicationYear, 2026)
  assert.equal(nonSeizureReview?.pmid, '36271316')
  assert.equal(nonSeizureReview?.doi, '10.1007/s40290-022-00446-8')
})

test('active CBD claims do not use the superseded 2021 EPIDIOLEX label', () => {
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const cbd = entries.filter(row => row.entityType === 'compound' && row.entitySlug === 'cannabidiol' && row.active === true && row.editorialStatus === 'approved')

  assert.ok(cbd.length > 0)
  assert.equal(cbd.some(row => row.sourceId === 'src_fda-epidiolex-label-2021'), false)
  assert.equal(cbd.find(row => row.enrichmentId === 'enr_cbd-medication-class-caution-cns-depressants')?.sourceId, 'src_fda-epidiolex-label-2026')
  assert.equal(cbd.find(row => row.enrichmentId === 'enr_cbd-enzyme-cyp2c19')?.sourceId, 'src_fda-epidiolex-label-2026')
  assert.equal(cbd.find(row => row.enrichmentId === 'enr_cbd-research-gap-non-epilepsy')?.sourceId, 'src_pubmed-36271316')
})
