import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import { evaluateEntryReadiness } from '../../enrichment/normalize-enrichment-lib.mjs'

const ROOT = process.cwd()
const EXPECTED_REMAINING_SOURCE_DEBT = ['src_fda-epidiolex-label-2021']

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function readJsonl(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => JSON.parse(line))
}

test('governed readiness leaves superseded or missing sources visible as debt', () => {
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

  const unresolvedSourceIds = [...new Set(blockedBySource.map(row => row.sourceId))].sort()
  assert.deepEqual(unresolvedSourceIds, EXPECTED_REMAINING_SOURCE_DEBT)
})

test('legacy baseline registry identities remain explicit and reviewable', () => {
  const registry = readJson('public/data/source-registry.json')
  const baseline = readJson('data-sources/enrichment-source-registry-baseline.json')
  const registryById = new Map(registry.map(row => [row.sourceId, row]))

  assert.equal(baseline.length, 5)
  assert.equal(registryById.has('src_fda-epidiolex-label-2021'), false, 'superseded FDA 2021 label must remain unresolved until current-source migration')

  for (const expected of baseline) {
    const actual = registryById.get(expected.sourceId)
    assert.ok(actual, `missing baseline source ${expected.sourceId}`)
    assert.equal(actual.active, true, `${expected.sourceId} must remain active while used as current support`)
    assert.equal(actual.publicationStatus, 'published', `${expected.sourceId} must be currently publishable support`)
    assert.equal(actual.doi || null, expected.doi || null, `${expected.sourceId} DOI identity drift`)
    assert.equal(actual.pmid || null, expected.pmid || null, `${expected.sourceId} PMID identity drift`)
    assert.equal(actual.canonicalUrl || null, expected.canonicalUrl || null, `${expected.sourceId} URL identity drift`)
    assert.equal(actual.monographId || null, expected.monographId || null, `${expected.sourceId} monograph identity drift`)
  }
})
