#!/usr/bin/env node
/**
 * Fail-closed integrity check for research-only enrichment Waves 7001–7500.
 * Run: node scripts/data/audit-enrichment-waves-7001-7500.mjs
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const directory = 'ops/enrichment-submissions/reconciliation';
const prefix = '2026-10-07-enrichment-waves-7001-7500';
const read = filename => JSON.parse(readFileSync(join(directory, filename), 'utf8'));
const normalizeTitle = value => String(value ?? '')
  .toLowerCase().replace(/\((\d+[a-z]*)\)/g, '$1')
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ').trim();
const normalizeDoi = value => String(value ?? '')
  .trim().toLowerCase()
  .replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)/, '');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const noDuplicates = (values, label) => {
  assert(new Set(values).size === values.length, 'Duplicate ' + label);
};
const blobSha = filename => {
  const data = readFileSync(join(directory, filename));
  return createHash('sha1')
    .update('blob ' + data.length + '\0')
    .update(data)
    .digest('hex');
};

const predecessor = read('2026-10-07-enrichment-waves-6501-7000-pmid-index.json');
const manifest = read(prefix + '-final-manifest.json');
const index = read(prefix + '-pmid-index.json');
const audit = read(prefix + '-final-audit.json');
const repairs = read(prefix + '-replacement-receipt.json');
const rejected = read(prefix + '-negative-pmid-index.json');
const status = read(prefix + '-final-status.json');
const files = Array.from({length: 5}, (_, i) => prefix + '-efetch-verified-part-0' + (i + 1) + '.json');
const parts = files.map(read);
const rows = parts.flatMap(part => part.rows).sort((a, b) => a.wave - b.wave);
const priorPmids = predecessor.pmids.map(String);
const newPmids = rows.map(row => String(row.pmid));

assert(predecessor.through_wave === 7000, 'Incorrect predecessor wave');
assert(priorPmids.length === 6935, 'Incorrect predecessor count');
noDuplicates(priorPmids, 'predecessor PMIDs');
assert(rows.length === 500, 'Expected exactly 500 rows');
assert(new Set(newPmids).size === 500, 'Expected 500 distinct PMIDs');
assert(rows.every((r, i) => r.wave === 7001 + i), 'Missing/duplicate/out-of-order waves');
const previous = new Set(priorPmids);
assert(newPmids.every(id => !previous.has(id)), 'Prior PMID collision');
assert(newPmids.every(id => !rejected.rejected_pmids.includes(id)), 'Recycled rejected PMID');
noDuplicates(rows.map(r => normalizeTitle(r.title)), 'normalized titles');
noDuplicates(rows.map(r => normalizeDoi(r.doi)).filter(Boolean), 'normalized DOIs');
assert(rows.every(r => r.title_verified === true && r.abstract_verified === true &&
  r.abstract?.length >= 70 && normalizeTitle(r.verified_title) === normalizeTitle(r.title)),
  'Missing or inconsistent source verification');
for (const [i, filename] of files.entries()) {
  assert(parts[i].exact_verified_rows === parts[i].rows.length && parts[i].failures.length === 0, 'Part count mismatch: ' + filename);
  assert(manifest.artifact_parts[i]?.blob_sha === blobSha(filename),
    'Manifest SHA mismatch: ' + filename);
}
const combined = [...priorPmids, ...newPmids].sort((a,b) => Number(a) - Number(b));
noDuplicates(combined, 'cumulative PMIDs');
assert(index.through_wave === 7500 && index.total_unique_pmids === 7435 &&
  index.pmids.length === 7435, 'Incorrect cumulative index metadata');
assert(JSON.stringify(index.pmids.map(String)) === JSON.stringify(combined),
  'Cumulative index is not identical to verified source rows plus predecessor');
const repaired = rows.filter(r => r.semantic_replacement_for);
assert(repaired.length === repairs.replacements.length && repaired.length === 8,
  'Semantic replacement receipt count mismatch');
assert(manifest.accepted_new_unique_pmids === 500 &&
  manifest.cumulative_unique_pmids === 7435 && manifest.research_only === true &&
  manifest.admission_policy?.recommendations === false &&
  manifest.admission_policy?.dosing_claims === false &&
  manifest.admission_policy?.runtime_admission === false,
  'Manifest is inconsistent or inappropriately promotable');
assert(audit.row_count === 500 && audit.exact_title_verified === 500 &&
  audit.substantive_abstracts_verified === 500 &&
  audit.predecessor_pmid_collisions === 0, 'Audit count mismatch');
assert(status.verified_rows === 500 && status.total_unique_pmids === 7435 &&
  status.research_only === true && status.published === false,
  'Status receipt mismatch');
console.log(JSON.stringify({
  passed: true, research_only: true, retained_rows: rows.length,
  unique_new_pmids: newPmids.length, cumulative_pmids: combined.length,
  duplicate_pmids: 0, duplicate_dois: 0, duplicate_titles: 0,
  predecessor_pmid_collisions: 0, semantic_repairs: repaired.length
}, null, 2));
