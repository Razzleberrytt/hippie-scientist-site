import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseDeepEnrichmentDossiers, reconcile, readResearchOnlyIndex, reconcileResearchOnlyIndex } from './reconcile-deep-enrichment-canonical.mjs'

test('exact PMID join includes workbook sources and claims but never asserts novelty', () => {
  const dossiers = [
    { round: 10, id: 'DE10-01', title: 'A', pmids: ['12345678', '23456789'] },
    { round: 11, id: 'DE11-01', title: 'B', pmids: ['12345678', '34567890'] },
  ]
  const rows = [
    { pmid: '12345678', source_id: 'src_a' },
    { source_url: 'https://pubmed.ncbi.nlm.nih.gov/23456789/', source_id: 'src_b' },
    { pmid: '1234567890', source_id: 'invalid_id_not_exact' },
  ]
  const claims = [{ PMID: '34567890', claim_id: 'claim_c' }]
  const result = reconcile(dossiers, rows, claims)
  assert.equal(result.summary.distinct_dossier_pmids, 3)
  assert.equal(result.summary.reused_pmids_between_dossiers, 1)
  assert.equal(result.summary.pmids_present_in_workbook_by_exact_id, 3)
  assert.equal(result.summary.pmids_not_found_in_selected_workbook_rows, 0)
  assert.deepEqual(result.source_reuse_within_dossiers[0], {
    pmid: '12345678', investigations: ['DE10-01', 'DE11-01'],
  })
  assert.equal(result.entries.find((x) => x.pmid === '23456789').workbook_source_records[0].row_id, 'src_b')
  assert.equal(result.entries.find((x) => x.pmid === '34567890').workbook_study_claim_records[0].row_id, 'claim_c')
  assert.equal(result.full_doi_novelty_or_clinical_approval_verified, false)
  assert.equal(result.promotes_clinical_claims, false)
})

test('indexes multiple canonical PMIDs in packed Evidence_Register URL and PMID cells', () => {
  const dossiers = [
    { id: 'DE18-01', round: 18, pmids: ['27912875', '15080016', '12345678'] },
  ]
  const evidence = [{
    __audit_sheet: 'Evidence_Register',
    claim_id: 'shared_source_row',
    url_or_source: 'https://pubmed.ncbi.nlm.nih.gov/27912875/; https://pubmed.ncbi.nlm.nih.gov/15080016/',
    PMID: 'PMID 12345678',
  }]
  const out = reconcile(dossiers, [], evidence)
  assert.equal(out.summary.pmids_present_in_workbook_by_exact_id, 3)
  assert.equal(out.summary.pmids_not_found_in_selected_workbook_rows, 0)
  for (const id of ['27912875', '15080016', '12345678']) {
    assert.deepEqual(out.entries.find((e) => e.pmid === id).workbook_study_claim_records, [
      { sheet: 'Evidence_Register', row_id: 'shared_source_row' },
    ])
  }
})

test('matched records preserve per-row worksheet provenance and do not double-count PMID identities', () => {
  const dossiers = [{ round: 10, id: 'DE10-01', pmids: ['12345678', '87654321'] }]
  const sourceRows = [
    { __audit_sheet: 'Source_Register', pmid: '12345678', source_id: 'source_1' },
    { __audit_sheet: 'Source Register', pmid: '12345678', source_id: 'source_2' },
  ]
  const claimRows = [
    { __audit_sheet: 'Study Registry', pmid: '87654321', claim_id: 'study_1' },
    { __audit_sheet: 'Evidence_Register', PMID: '87654321', claim_id: 'study_2' },
  ]
  const audit = reconcile(dossiers, sourceRows, claimRows)
  assert.equal(audit.summary.pmids_present_in_workbook_by_exact_id, 2)
  assert.equal(audit.source_rows_scanned, 2)
  assert.equal(audit.study_rows_scanned, 2)
  assert.deepEqual(audit.entries.find((e) => e.pmid === '12345678').workbook_source_records.map((x) => x.sheet),
    ['Source_Register', 'Source Register'])
  assert.deepEqual(audit.entries.find((e) => e.pmid === '87654321').workbook_study_claim_records.map((x) => x.sheet),
    ['Study Registry', 'Evidence_Register'])
})

test('unknown and invalid source identities do not silently become matched citations', () => {
  const out = reconcile([{ id: 'DE10-01', round: 10, pmids: ['33333333'] }],
    [{ pmid: '333333330' }, { title: 'PMID 33333333' }, { pmid: 'PMID 3333333; 3333333300' }], [])
  assert.equal(out.summary.pmids_present_in_workbook_by_exact_id, 0)
  assert.equal(out.summary.pmids_not_found_in_selected_workbook_rows, 1)
  assert.match(out.notes, /NOT established/)
})

test('source dossier parser preserves exactly ten investigations per round and excludes trailing governance sources', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-de-audit-'))
  const dir = path.join(root, 'docs', 'research')
  fs.mkdirSync(dir, { recursive: true })
  try {
    const headings = Array.from({ length: 10 }, (_, i) =>
      `## DE10-${String(i + 1).padStart(2, '0')} — Synthetic source\n[PMID 12345678](https://pubmed.ncbi.nlm.nih.gov/12345678/)\n`)
    fs.writeFileSync(path.join(dir, 'deep-enrichment-10-2026-10-13.md'),
      '# Synthetic\n' + headings.join('\n') +
      '\n## Whole-round governance\nThis trailing record is NOT part of DE10-10: https://pubmed.ncbi.nlm.nih.gov/99999999/\n')
    const result = parseDeepEnrichmentDossiers(root)
    assert.equal(result.length, 10)
    assert.equal(result.at(-1).pmids.length, 1)
    assert.deepEqual(result.at(-1).pmids, ['12345678'])
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})


test('cross-ledger categories distinguish exact identity coverage from study novelty', () => {
  const base = reconcile([
    { round: 19, id: 'DE19-01', pmids: ['11111111', '22222222'] },
    { round: 18, id: 'DE18-01', pmids: ['33333333', '44444444'] },
  ], [
    { pmid: '11111111', source_id: 'both' },
    { pmid: '22222222', source_id: 'canonical_only' },
  ], [])
  const result = reconcileResearchOnlyIndex(base, {
    pmids: new Set(['11111111', '33333333']),
    provenance: { through_wave: 7500, total_unique_pmids: 7435 },
  })
  assert.deepEqual([
    result.summary.pmids_in_both_stores,
    result.summary.pmids_in_canonical_only,
    result.summary.pmids_in_research_only_index_only,
    result.summary.pmids_not_found_in_either_by_exact_id,
    result.summary.pmids_in_at_least_one_store,
  ], [1, 1, 1, 1, 3])
  assert.deepEqual(result.unmatched_exact_pmids_for_identity_review, [
    { pmid: '44444444', investigations: ['DE18-01'] },
  ])
  assert.equal(result.no_automatic_admissions, true)
  assert.equal(result.full_doi_novelty_or_clinical_approval_verified, false)
})

test('rejects inconsistent or publishable research index instead of inventing source IDs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-research-index-'))
  const dir = path.join(root, 'ops/enrichment-submissions/reconciliation')
  fs.mkdirSync(dir, { recursive: true })
  const stem = '2026-10-07-enrichment-waves-7001-7500'
  const indexPath = 'ops/enrichment-submissions/reconciliation/' + stem + '-pmid-index.json'
  const manifest = {
    range: '7001-7500',
    research_only: true,
    fail_closed: true,
    accepted_new_unique_pmids: 500,
    previous_unique_pmids: 0,
    cumulative_unique_pmids: 2,
    cumulative_index: indexPath,
    admission_policy: {
      published_entities: false,
      recommendations: false,
      runtime_admission: false,
    },
  }
  const status = { range: '7001-7500', research_only: true, published: false,
    verified_rows: 500, total_unique_pmids: 2 }
  const index = { through_wave: 7500, previous_unique_pmids: 0,
    total_unique_pmids: 2, pmids: ['11111111', '22222222'] }
  try {
    fs.writeFileSync(path.join(dir, stem + '-final-manifest.json'), JSON.stringify(manifest))
    fs.writeFileSync(path.join(dir, stem + '-final-status.json'), JSON.stringify(status))
    fs.writeFileSync(path.join(root, indexPath), JSON.stringify(index))
    assert.equal(readResearchOnlyIndex(root).pmids.size, 2)
    fs.writeFileSync(path.join(root, indexPath), JSON.stringify({ ...index, pmids: ['11111111', '11111111'] }))
    assert.throws(() => readResearchOnlyIndex(root), /disagree/)
    fs.writeFileSync(path.join(root, indexPath), JSON.stringify(index))
    fs.writeFileSync(path.join(dir, stem + '-final-status.json'), JSON.stringify({ ...status, published: true }))
    assert.throws(() => readResearchOnlyIndex(root), /disagree/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
