#!/usr/bin/env node
// Fail-closed research metadata/visual-integration contract.
// Do NOT promote raw research sources into graded/runtime clinical evidence.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const base = 'ops/enrichment-submissions/reconciliation'
const prefix = '2026-10-07-enrichment-waves-7001-7500'
const read = path => JSON.parse(readFileSync(path, 'utf8'))
const normalize = s => String(s || '').normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const doi = s => String(s || '').trim().toLowerCase()
  .replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)/, '')

const manifest = read(join(base, prefix+'-final-manifest.json'))
const index = read(join(base, prefix+'-pmid-index.json'))
const status = read(join(base, prefix+'-final-status.json'))
const prior = read(join(base, '2026-10-07-enrichment-waves-6501-7000-pmid-index.json'))
assert.equal(index.through_wave, 7500)
assert.equal(index.total_unique_pmids, 7435)
assert.equal(index.pmids.length, 7435)
assert.equal(new Set(index.pmids.map(String)).size, 7435)
assert.equal(prior.total_unique_pmids, 6935)
const archive=read('public/data/research/pmid-register-through-7000.json')
assert.equal(archive.schema_version,1)
assert.equal(archive.through_wave,7000)
assert.equal(archive.inventory_only,true)
assert.equal(archive.prior_unique_pmids,6935)
assert.deepEqual(archive.pmids,prior.pmids,'Published on-demand index must match exact authoritative predecessor')
assert.equal(manifest.research_only, true)
assert.equal(status.research_only, true)
assert.equal(status.published, false)
assert.equal(manifest.admission_policy.published_entities, false)
assert.equal(manifest.admission_policy.runtime_admission, false)
assert.equal(manifest.admission_policy.recommendations, false)
assert.equal(manifest.admission_policy.dosing_claims, false)

const rows = []
assert.equal(manifest.artifact_parts.length, 5)
for (let i = 1; i <= 5; i++) {
  const name = prefix+'-efetch-verified-part-0'+i+'.json'
  const path = join(base, name)
  const bytes = readFileSync(path)
  const sha = createHash('sha1').update('blob '+bytes.byteLength+'\0').update(bytes).digest('hex')
  assert.equal(manifest.artifact_parts[i-1].blob_sha, sha)
  assert.equal(manifest.artifact_parts[i-1].path, base+'/'+name)
  const part = JSON.parse(bytes.toString('utf8'))
  assert.equal(part.exact_verified_rows, 100)
  assert.equal(part.failures.length, 0)
  assert.equal(part.rows.length, 100)
  rows.push(...part.rows)
}
assert.equal(rows.length, 500)
const pmids = rows.map(r => String(r.pmid))
assert.equal(new Set(pmids).size, 500)
const titles = rows.map(r => normalize(r.title))
assert.equal(new Set(titles).size, 500)
const dois = rows.map(r => doi(r.doi)).filter(Boolean)
assert.equal(new Set(dois).size, dois.length)
const indexSet = new Set(index.pmids.map(String))
const priorSet = new Set(prior.pmids.map(String))
const topicCount = new Map()
for (const [i, row] of rows.entries()) {
  assert.equal(row.wave, 7001 + i)
  assert.match(String(row.pmid), /^\d{5,10}$/)
  assert(indexSet.has(String(row.pmid)) && !priorSet.has(String(row.pmid)))
  assert.equal(row.research_only, true)
  assert.equal(row.title_verified, true)
  assert.equal(row.abstract_verified, true)
  assert.equal(normalize(row.title), normalize(row.verified_title))
  assert(row.abstract.length >= 70)
  assert.match(row.category, /^[a-z][a-z0-9_]*$/)
  topicCount.set(row.category, (topicCount.get(row.category) || 0) + 1)
}
assert.equal(topicCount.size, 18)
assert.equal([...topicCount.values()].reduce((a,b)=>a+b,0),500)
assert.equal(indexSet.size - pmids.length, 6935)

const links = {
  'app/research/page.tsx': "/research/source-register/",
  'components/homepage-v2.tsx': "/research/source-register/",
  'app/library/page.tsx': "/research/source-register/",
  'lib/primary-navigation.ts': "/research/source-register",
}
for (const [path, href] of Object.entries(links)) {
  assert(readFileSync(path, 'utf8').includes(href), 'Missing source register link from '+path)
}
const page = readFileSync('app/research/source-register/page.tsx','utf8')
const client = readFileSync('app/research/source-register/SourceRegisterClient.tsx','utf8')
const loader = readFileSync('lib/research-source-register.ts','utf8')
assert(page.includes('robots: { index: false, follow: true }'), 'Noindex gate missing')
assert(page.includes('getResearchSourceRegister()'), 'Route missing authoritative register loader')
assert(!page.includes('previousPmids={data.previousPmids}'),'Historical PMID list must not be serialized on first render')
assert(page.includes('previousCount={data.priorPmidOnly}'),'Historical count must be authoritative')
assert(client.includes("fetch('/data/research/pmid-register-through-7000.json'"),'Historical index must load on demand')
for(const token of ['previousPmids','records','categories','https://pubmed.ncbi.nlm.nih.gov/','query','category','year']) {
  assert(client.includes(token), 'Source-register visual missing: '+token)
}
assert(loader.includes('artifact.blob_sha') && loader.includes('gitBlobSha(content)'), 'Receipt hash gate missing')
assert(!page.includes('getPublicEvidenceDataset()'), 'Register mixed with public graded dataset')
console.log(JSON.stringify({
  passed:true,indexedPmids:7435,sourceVerifiedTitles:500,earlierPmidLookup:6935,
  topics:topicCount.size,doiRecords:dois.length,
  duplicatePmids:0,duplicateTitles:0,duplicateDois:0,priorPmidCollisions:0,
  researchOnly:true,runtimePromotions:0,uiRoutesChecked:Object.keys(links).length+1
},null,2))
