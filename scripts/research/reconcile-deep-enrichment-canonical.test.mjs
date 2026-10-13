import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseDeepEnrichmentDossiers, reconcile } from './reconcile-deep-enrichment-canonical.mjs'

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

test('unknown and invalid source identities do not silently become matched citations', () => {
  const out = reconcile([{ id: 'DE10-01', round: 10, pmids: ['33333333'] }],
    [{ pmid: '333333330' }, { title: 'PMID 33333333' }, { pmid: 'PMID 3333333; 33333333' }], [])
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
