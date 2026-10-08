#!/usr/bin/env node
/** Deterministic, fail-closed source-ledger integrity audit for research Waves 7501–8000.
 * Direct NCBI title+abstract receipts are SOURCE-VERIFIED CANDIDATES ONLY.
 * They do not establish semantic relevance, clinical recommendations or publication.
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const folder = 'ops/enrichment-submissions/reconciliation';
const prefix = '2026-10-08-enrichment-waves-7501-8000';
const read = name => JSON.parse(readFileSync(join(folder, name), 'utf8'));
const eq = (ok, msg) => { if (!ok) throw new Error(msg); };
const titleNorm = value => String(value ?? '').normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const doiNorm = value => String(value ?? '').trim().toLowerCase()
  .replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)/, '');
const manifest = read(prefix+'-final-manifest.json');
const prior = read('2026-10-07-enrichment-waves-7001-7500-pmid-index.json');
const negative = read('2026-10-07-enrichment-waves-7001-7500-negative-pmid-index.json');
const audit = read(prefix+'-final-audit.json');
const index = read(prefix+'-pmid-index.json');
const status = read(prefix+'-status.json');
const filenames = Array.from({length:5}, (_,i)=>prefix+'-source-verified-part-0'+(i+1)+'.json');
const parts = filenames.map(read);
const rows = parts.flatMap(part=>part.rows);
const pmids = rows.map(r=>String(r.pmid));
const unique = values => new Set(values).size===values.length;
eq(prior.through_wave===7500 && prior.total_unique_pmids===7435 &&
  prior.pmids.length===7435 && unique(prior.pmids.map(String)), 'Predecessor index invalid');
eq(rows.length===500 && unique(pmids), 'Not 500 unique new PMIDs');
eq(rows.every((r,i)=>r.wave===7501+i), 'Wave range/order incorrect');
const previous = new Set(prior.pmids.map(String));
const rejected = new Set(negative.rejected_pmids.map(String));
eq(pmids.every(id=>!previous.has(id)&&!rejected.has(id)), 'Predecessor or rejected-PMID collision');
eq(unique(rows.map(r=>titleNorm(r.title))), 'Duplicate normalized titles');
eq(unique(rows.map(r=>doiNorm(r.doi)).filter(Boolean)), 'Duplicate normalized DOIs');
eq(rows.every(r=>r.title_verified===true&&r.abstract_verified===true&&
  r.verified_title===r.title&&r.abstract.length>=160&&r.research_only===true&&
  r.source==='NCBI PubMed ESearch + direct EFetch XML'&&
  r.state==='exact_source_verified_pending_independent_semantic_review'),
  'Missing source verification or unsafe promotion');
for(let i=0;i<5;i++){
  eq(parts[i].rows.length===100&&parts[i].exact_verified_rows===100 &&
    parts[i].failures.length===0, 'Part count or failure issue');
  const bytes=readFileSync(join(folder,filenames[i]));
  const blob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  eq(manifest.artifact_parts[i].blob_sha===blob, 'Unpinned/changed source receipt part '+(i+1));
}
eq(index.through_wave===8000 && index.total_unique_pmids===7935 &&
  index.pmids.length===7935 && unique(index.pmids.map(String)), 'Invalid cumulative index');
const expected=[...prior.pmids.map(String),...pmids].sort((a,b)=>Number(a)-Number(b));
eq(JSON.stringify(index.pmids.map(String))===JSON.stringify(expected),'Cumulative index not exact union');
eq(audit.row_count===500&&audit.exact_title_verified===500&&
  audit.substantive_abstracts_verified===500&&audit.semantic_review_complete===false,
  'Unverified audit or falsely completed semantic review');
eq(manifest.research_only===true&&manifest.fail_closed===true&&
  manifest.source_verified_candidates===500&&manifest.accepted_new_unique_pmids===0&&
  manifest.admission_policy.published_entities===false&&
  manifest.admission_policy.recommendations===false&&
  manifest.admission_policy.dosing_claims===false&&
  manifest.admission_policy.runtime_admission===false&&
  status.merged===false&&status.published===false,
  'Unsafe evidence admission or incorrect research-only state');
console.log(JSON.stringify({passed:true,source_verified_candidates:500,
  unique_new_pmids:500,prior_pmids:7435,prospective_total:7935,
  duplicate_pmids:0,duplicate_titles:0,duplicate_dois:0,prior_collisions:0,
  published:false,semantic_review:'PENDING',research_only:true},null,2));
