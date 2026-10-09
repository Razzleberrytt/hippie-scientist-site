import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const source = path.join(root, 'data-sources/runtime-enrichment')
const correction = JSON.parse(fs.readFileSync(path.join(source, 'corrections/2026-10-09-waves-01-50-admission-reconciliation-v1.json'), 'utf8'))
const manifestPath = path.join(root, correction.historical.manifest_path)
const ledgerPath = path.join(root, correction.historical.ledger_path)
const manifestBytes = fs.readFileSync(manifestPath)
const ledgerBytes = fs.readFileSync(ledgerPath)
const manifest = JSON.parse(manifestBytes.toString('utf8'))
const ledger = JSON.parse(ledgerBytes.toString('utf8'))

const gitBlobId = (bytes) => createHash('sha1')
  .update(Buffer.concat([Buffer.from('blob ' + bytes.byteLength + '\0'), bytes]))
  .digest('hex')

test('published Waves 01–50 ledger/manifest remain byte-for-byte immutable', () => {
  assert.equal(gitBlobId(manifestBytes), correction.historical.manifest_git_blob_sha)
  assert.equal(gitBlobId(ledgerBytes), correction.historical.ledger_git_blob_sha)
  assert.equal(createHash('sha256').update(ledgerBytes).digest('hex'), manifest.ledger.sha256)
  assert.equal(correction.historical.ledger_sha256, manifest.ledger.sha256)
  assert.equal(ledgerBytes.byteLength, manifest.ledger.bytes)
  assert.equal(correction.historical.ledger_bytes, manifest.ledger.bytes)
  assert.deepEqual(correction.historical.manifest_counts, manifest.counts)
  assert.deepEqual(manifest.counts, { entity_context_rows: 0, evidence_rows: 123, source_rows: 93, relationship_rows: 0 })
})

test('append-only correction accounts for every identity once without rewriting source rows', () => {
  const spec = [
    ['evidence', 'record_id', 'admitted_evidence_record_ids', 'already_covered_evidence_record_ids', 85, 38],
    ['sources', 'source_id', 'admitted_source_ids', 'already_covered_source_ids', 79, 14],
  ]
  for (const [kind, idField, keptField, duplicatesField, keptN, duplicateN] of spec) {
    const sourceIds = ledger[kind].map((row) => row[idField])
    const kept = correction.identity_disposition[keptField]
    const duplicates = correction.identity_disposition[duplicatesField]
    assert.equal(new Set(sourceIds).size, sourceIds.length, kind + ': duplicate source ID')
    assert.equal(new Set(kept).size, kept.length, kind + ': duplicate admitted ID')
    assert.equal(new Set(duplicates).size, duplicates.length, kind + ': duplicate already-covered ID')
    assert.equal(kept.length, keptN)
    assert.equal(duplicates.length, duplicateN)
    assert.deepEqual([...kept, ...duplicates].sort(), [...sourceIds].sort())
    assert.equal(kept.filter((id) => duplicates.includes(id)).length, 0)
  }
  const accepted = new Set(correction.identity_disposition.admitted_evidence_record_ids)
  const corrections = ledger.evidence.filter((e) => accepted.has(e.record_id) && e.corrects_evidence_key)
  assert.equal(corrections.length, 2)
  assert.equal(correction.adjudication.evidence_corrections, 2)
  assert.equal(correction.adjudication.evidence_additions, accepted.size - 2)
  assert.equal(correction.adjudication.source_additions, 79)
  assert.equal(correction.adjudication.duplicate_preexisting_evidence, 38)
  assert.equal(correction.adjudication.duplicate_preexisting_sources, 14)
  assert.equal(correction.type, 'append_only_published_manifest_correction')
  assert.equal(correction.historical.manifest_path.includes('/corrections/'), false, 'historic manifest may not be replaced by correction')
  assert.equal(correction.adjudication.total_effective_evidence, accepted.size)
  assert.equal(correction.adjudication.total_effective_sources, correction.identity_disposition.admitted_source_ids.length)
  assert.equal(correction.invariants.public_approval_conferred, false)
  assert.equal(correction.invariants.evidence_source_clinical_promotion, false)
  assert.equal(correction.invariants.runtime_dedupe_preserved, true)
  assert.equal(correction.invariants.historical_files_untouched, true)
})

test('canonical workbook and previous batches independently substantiate the 38/14 no-op classifications', () => {
  // This is the same real admission audit used to reject the historical overcount.
  // Unlike the rejected PR #6204, the original ledger/manifest stay immutable.
  const result = spawnSync(process.execPath, [
    path.join(root, 'scripts/data/audit-runtime-enrichment-admission.mjs'),
    '--manifest', path.basename(manifestPath),
  ], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 180000 })
  assert.equal(result.status, 0, result.stderr || result.error?.message || 'audit exited nonzero')
  // The workbook reader can emit a diagnostic before the audit's JSON report.
  // Parse the actual report envelope rather than assuming pure JSON stdout.
  const reportField = result.stdout.indexOf('"manifest":')
  assert.ok(reportField >= 0, 'missing structured audit report in stdout: ' + result.stdout.slice(-500))
  const reportStart = result.stdout.lastIndexOf('{', reportField)
  assert.ok(reportStart >= 0, 'missing opening brace of admission audit report')
  const report = JSON.parse(result.stdout.slice(reportStart))
  assert.deepEqual(report.raw, { evidence: 123, sources: 93 })
  assert.deepEqual(report.accepted, {
    evidence_additions: 83,
    evidence_corrections: 2,
    source_additions: 79,
    source_corrections: 0,
  })
  assert.equal(report.invalid_corrections.length, 0)
  assert.deepEqual(
    report.duplicates.evidence.map((r) => r.record_id).sort(),
    correction.identity_disposition.already_covered_evidence_record_ids,
  )
  assert.deepEqual(
    report.duplicates.sources.map((r) => r.source_id).sort(),
    correction.identity_disposition.already_covered_source_ids,
  )
})
