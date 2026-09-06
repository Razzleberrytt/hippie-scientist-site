import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

// Sources cited by approved_for_rollup enrichment submissions whose DOIs are not
// registered with the DOI handle registry and resolve to no PubMed record. They
// are fabricated citations aimed at canonical health evidence. The source
// registry gate already blocks them by absence, but absence is a weak guarantee:
// anything that appends to the registry would silently admit them. This asserts
// they stay out.
//
// Every quarantine record is discovered by glob rather than by pinned filename.
// The first version of this file named ops/audit/fabricated-source-quarantine-2026-09-06.json
// directly, which meant a second batch written under a new date got no
// assertions at all until someone remembered to hand-write another test — the
// same "absence is a weak guarantee" trap the guard exists to close.
const ROOT = process.cwd()
const AUDIT_DIR = path.join(ROOT, 'ops', 'audit')
const QUARANTINE_PREFIX = 'fabricated-source-quarantine-'
const REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const LEDGER_PATH = path.join(ROOT, 'public', 'data', 'enrichment-normalized.jsonl')
const GOVERNED_PATH = path.join(ROOT, 'public', 'data', 'enrichment-governed.json')

function quarantineRecords() {
  const files = fs
    .readdirSync(AUDIT_DIR)
    .filter(name => name.startsWith(QUARANTINE_PREFIX) && name.endsWith('.json'))
    .sort()
  // Discovery returning nothing means the records were renamed or deleted, not
  // that nothing is quarantined. Fail as a governance failure rather than
  // vacuously passing over an empty list.
  assert.ok(files.length > 0, `no ${QUARANTINE_PREFIX}*.json records found in ops/audit`)
  return files.map(name => ({
    name,
    record: JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, name), 'utf8')),
  }))
}

function allFabricated() {
  return quarantineRecords().flatMap(({ name, record }) =>
    record.fabricated.map(entry => ({ ...entry, recordName: name })),
  )
}

function allRetracted() {
  return quarantineRecords().flatMap(({ name, record }) =>
    (record.retracted ?? []).map(entry => ({ ...entry, recordName: name })),
  )
}

test('every fabricated-source quarantine record is populated and well formed', () => {
  for (const { name, record } of quarantineRecords()) {
    assert.ok(Array.isArray(record.fabricated), `${name}: fabricated must be an array`)
    assert.ok(record.fabricated.length > 0, `${name}: quarantine must not be silently emptied`)
    for (const entry of record.fabricated) {
      assert.ok(entry.sourceId, `${name}: each quarantined source needs a sourceId`)
      assert.ok(entry.doi, `${name}: each quarantined source needs the DOI it claimed`)
      // A reason code, not an implied one. Requiring handleStatus === 404 of every
      // entry made an unregistered DOI the only admissible quarantine reason, so a
      // source withdrawn for resolving to a retracted or wrong-entity record could
      // not be recorded here without faking a 404.
      assert.ok(entry.reason, `${name}: ${entry.doi} needs a quarantine reason code`)
      if (entry.reason === 'doi-handle-unregistered') {
        assert.equal(entry.handleStatus, 404, `${name}: ${entry.doi} is quarantined for being unregistered`)
      }
    }
  }
})

test('no fabricated source is present in the canonical source registry', () => {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'))
  const ids = new Set(registry.map(source => source?.sourceId))
  const dois = new Set(registry.map(source => String(source?.doi ?? '').toLowerCase()).filter(Boolean))

  for (const entry of allFabricated()) {
    assert.ok(!ids.has(entry.sourceId), `${entry.sourceId} is a fabricated source and must not be registered`)
    assert.ok(!dois.has(entry.doi.toLowerCase()), `${entry.doi} is not a registered DOI and must not be admitted`)
  }
})

test('no fabricated source reaches the ledger or the governed artifact', () => {
  const ledger = fs.readFileSync(LEDGER_PATH, 'utf8')
  const governed = fs.readFileSync(GOVERNED_PATH, 'utf8')

  for (const entry of allFabricated()) {
    assert.ok(!ledger.includes(entry.sourceId), `${entry.sourceId} must not appear in the normalized ledger`)
    assert.ok(!ledger.includes(entry.doi), `${entry.doi} must not appear in the normalized ledger`)
    assert.ok(!governed.includes(entry.sourceId), `${entry.sourceId} must not appear in the governed artifact`)
    assert.ok(!governed.includes(entry.doi), `${entry.doi} must not appear in the governed artifact`)
  }
})

test('known retracted evidence stays out of canonical enrichment', () => {
  // Retracted PMIDs live in the quarantine records, not in this file. Hardcoding
  // them here meant the guard restated governance instead of reading it, and a
  // newly retracted source stayed uncovered until someone edited the test.
  const retracted = allRetracted()
  assert.ok(retracted.length > 0, 'quarantine records must carry the retracted PMIDs they withhold')

  const registry = fs.readFileSync(REGISTRY_PATH, 'utf8')
  const ledger = fs.readFileSync(LEDGER_PATH, 'utf8')
  const governed = fs.readFileSync(GOVERNED_PATH, 'utf8')

  for (const entry of retracted) {
    assert.ok(entry.pmid, `${entry.recordName}: each retracted entry needs a pmid`)
    assert.ok(entry.reason, `${entry.recordName}: retracted PMID ${entry.pmid} needs a reason code`)
    assert.ok(!registry.includes(entry.pmid), `retracted PMID ${entry.pmid} must not be in the source registry`)
    assert.ok(!ledger.includes(entry.pmid), `retracted PMID ${entry.pmid} must not be in the normalized ledger`)
    assert.ok(!governed.includes(entry.pmid), `retracted PMID ${entry.pmid} must not be in the governed artifact`)
  }
})

test('a quarantine record never contradicts the registry about what was admitted', () => {
  // The 2026-09-06 record carried a verifiedRealButNotAdmitted section asserting
  // nine sources were withheld; they were admitted 35 minutes later and the
  // section was never amended, so the load-bearing audit artifact told a reader
  // the opposite of what the registry said.
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'))
  const byDoi = new Map(registry.map(row => [String(row.doi ?? '').toLowerCase(), row]))

  for (const { name, record } of quarantineRecords()) {
    assert.ok(
      !('verifiedRealButNotAdmitted' in record),
      `${name}: verifiedRealButNotAdmitted goes stale the moment a source is admitted; use verifiedReal with a per-entry admitted flag`,
    )
    for (const entry of record.verifiedReal ?? []) {
      const registered = byDoi.get(entry.doi.toLowerCase()) ?? null
      assert.equal(
        entry.admitted,
        Boolean(registered),
        `${name}: ${entry.doi} claims admitted=${entry.admitted} but the registry says otherwise`,
      )
      if (!registered) continue
      assert.equal(entry.sourceId, registered.sourceId, `${name}: ${entry.doi} records the wrong sourceId`)
      assert.deepEqual(
        entry.editorialAdjudication ?? null,
        registered.editorialAdjudication ?? null,
        `${name}: ${entry.doi} misreports the editorial adjudication hold carried by the registry`,
      )
    }
  }
})
