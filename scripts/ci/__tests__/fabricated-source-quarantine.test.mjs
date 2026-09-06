import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

// Six sources cited by approved_for_rollup enrichment submissions carry DOIs that
// are not registered with the DOI handle registry and resolve to no PubMed record.
// They are fabricated citations aimed at canonical health evidence. The source
// registry gate already blocks them by absence, but absence is a weak guarantee:
// anything that appends to the registry would silently admit them. This asserts
// they stay out.
const ROOT = process.cwd()
const QUARANTINE_PATH = path.join(ROOT, 'ops', 'audit', 'fabricated-source-quarantine-2026-09-06.json')
const REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const LEDGER_PATH = path.join(ROOT, 'public', 'data', 'enrichment-normalized.jsonl')
const GOVERNED_PATH = path.join(ROOT, 'public', 'data', 'enrichment-governed.json')

const quarantine = JSON.parse(fs.readFileSync(QUARANTINE_PATH, 'utf8'))

test('the fabricated-source quarantine record is populated and well formed', () => {
  assert.ok(Array.isArray(quarantine.fabricated), 'fabricated must be an array')
  assert.ok(quarantine.fabricated.length > 0, 'quarantine must not be silently emptied')
  for (const entry of quarantine.fabricated) {
    assert.ok(entry.sourceId, 'each quarantined source needs a sourceId')
    assert.ok(entry.doi, 'each quarantined source needs the DOI it claimed')
    assert.equal(entry.handleStatus, 404, `${entry.doi} is quarantined for being unregistered`)
  }
})

test('no fabricated source is present in the canonical source registry', () => {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'))
  const ids = new Set(registry.map(source => source?.sourceId))
  const dois = new Set(registry.map(source => String(source?.doi ?? '').toLowerCase()).filter(Boolean))

  for (const entry of quarantine.fabricated) {
    assert.ok(!ids.has(entry.sourceId), `${entry.sourceId} is a fabricated source and must not be registered`)
    assert.ok(!dois.has(entry.doi.toLowerCase()), `${entry.doi} is not a registered DOI and must not be admitted`)
  }
})

test('no fabricated source reaches the ledger or the governed artifact', () => {
  const ledger = fs.readFileSync(LEDGER_PATH, 'utf8')
  const governed = fs.readFileSync(GOVERNED_PATH, 'utf8')

  for (const entry of quarantine.fabricated) {
    assert.ok(!ledger.includes(entry.sourceId), `${entry.sourceId} must not appear in the normalized ledger`)
    assert.ok(!ledger.includes(entry.doi), `${entry.doi} must not appear in the normalized ledger`)
    assert.ok(!governed.includes(entry.sourceId), `${entry.sourceId} must not appear in the governed artifact`)
    assert.ok(!governed.includes(entry.doi), `${entry.doi} must not appear in the governed artifact`)
  }
})

test('known retracted evidence stays out of canonical enrichment', () => {
  // PMID 42527229 is the retraction notice for the aged-garlic blood-pressure
  // meta-analysis (original PMID 39437887). Neither may back canonical efficacy.
  const registry = fs.readFileSync(REGISTRY_PATH, 'utf8')
  const ledger = fs.readFileSync(LEDGER_PATH, 'utf8')
  const governed = fs.readFileSync(GOVERNED_PATH, 'utf8')

  for (const pmid of ['42527229', '39437887']) {
    assert.ok(!registry.includes(pmid), `retracted PMID ${pmid} must not be in the source registry`)
    assert.ok(!ledger.includes(pmid), `retracted PMID ${pmid} must not be in the normalized ledger`)
    assert.ok(!governed.includes(pmid), `retracted PMID ${pmid} must not be in the governed artifact`)
  }
})
