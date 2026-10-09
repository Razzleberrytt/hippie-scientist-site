#!/usr/bin/env node
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join, basename } from 'node:path'

const base='ops/enrichment-submissions/reconciliation'
const read=p=>JSON.parse(readFileSync(p,'utf8'))
const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
const doi=s=>String(s||'').trim().toLowerCase().replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)/,'')
const candidates=readdirSync(base).filter(n=>n.endsWith('-final-manifest.json')).flatMap(name=>{try{const manifest=read(join(base,name));const m=String(manifest.range||'').match(/^(\d+)-(\d+)$/);if(!m||Number(m[2])-Number(m[1])+1!==500||manifest.research_only!==true||manifest.accepted_new_unique_pmids!==500)return[];const indexName=manifest.cumulative_index?basename(manifest.cumulative_index):name.replace(/-final-manifest\.json$/,'-pmid-index.json');const statusName=name.replace(/-final-manifest\.json$/,'-final-status.json');const index=read(join(base,indexName)),status=read(join(base,statusName));if(index.through_wave!==Number(m[2])||index.total_unique_pmids!==manifest.cumulative_unique_pmids||status.research_only!==true||status.published!==false||status.verified_rows!==500)return[];return[{name,manifest,index,status,start:Number(m[1]),end:Number(m[2])}]}catch{return[]}}).sort((a,b)=>b.end-a.end)
assert(candidates.length>0,'No valid merged 500-record research batch')
const latest=candidates[0],{manifest,index,start,end}=latest
assert.equal(index.pmids.length,index.total_unique_pmids)
assert.equal(new Set(index.pmids.map(String)).size,index.total_unique_pmids)
assert.equal(manifest.admission_policy.published_entities,false)
assert.equal(manifest.admission_policy.runtime_admission,false)
assert.equal(manifest.admission_policy.recommendations,false)
assert.equal(manifest.admission_policy.dosing_claims,false)

const rows=[]
for(const artifact of manifest.artifact_parts){
 assert.equal(artifact.rows>0,true)
 assert(artifact.path.startsWith(base+'/')&&!artifact.path.slice(base.length+1).includes('/'),'Unsafe artifact path')
 const bytes=readFileSync(artifact.path)
 const sha=createHash('sha1').update('blob '+bytes.byteLength+'\0').update(bytes).digest('hex')
 assert.equal(artifact.blob_sha,sha)
 const part=JSON.parse(bytes.toString('utf8'))
 assert.equal(part.exact_verified_rows,artifact.rows)
 assert.equal(part.failures.length,0)
 assert.equal(part.rows.length,artifact.rows)
 rows.push(...part.rows)
}
assert.equal(rows.length,500)
const pmids=rows.map(r=>String(r.pmid)),titles=rows.map(r=>normalize(r.title)),dois=rows.map(r=>doi(r.doi)).filter(Boolean)
assert.equal(new Set(pmids).size,500)
assert.equal(new Set(titles).size,500)
assert.equal(new Set(dois).size,dois.length)
const indexSet=new Set(index.pmids.map(String)),topicCount=new Map()
for(const [i,row] of rows.entries()){
 assert.equal(row.wave,start+i);assert.match(String(row.pmid),/^\d{5,10}$/);assert(indexSet.has(String(row.pmid)))
 assert.equal(row.research_only,true);assert.equal(row.title_verified,true);assert.equal(row.abstract_verified,true)
 assert.equal(normalize(row.title),normalize(row.verified_title));assert(row.abstract.length>=70);assert.match(row.category,/^[a-z][a-z0-9_]*$/)
 topicCount.set(row.category,(topicCount.get(row.category)||0)+1)
}
const prior=index.pmids.map(String).filter(x=>!new Set(pmids).has(x))
assert.equal(prior.length,index.total_unique_pmids-500)
const archivePath='public/data/research/pmid-register-through-'+(start-1)+'.json'
const archive=read(archivePath)
assert.equal(archive.schema_version,1);assert.equal(archive.through_wave,start-1);assert.equal(archive.inventory_only,true)
assert.equal(archive.prior_unique_pmids,prior.length);assert.deepEqual(archive.pmids,prior)

const links={'app/research/page.tsx':'/research/source-register/','components/homepage-v2.tsx':'/research/source-register/','app/library/page.tsx':'/research/source-register/','lib/primary-navigation.ts':'/research/source-register'}
for(const [p,href] of Object.entries(links))assert(readFileSync(p,'utf8').includes(href),'Missing source register link from '+p)
const page=readFileSync('app/research/source-register/page.tsx','utf8'),client=readFileSync('app/research/source-register/SourceRegisterClient.tsx','utf8'),loader=readFileSync('lib/research-source-register.ts','utf8')
assert(page.includes('robots: { index: false, follow: true }'))
assert(page.includes('priorIndexHref={data.priorIndexHref}')&&page.includes('throughWave={data.throughWave}'),'Rolling source props missing')
assert(client.includes('fetch(priorIndexHref')&&client.includes('data.through_wave !== throughWave'),'Rolling client integrity gate missing')
assert(loader.includes('latestBatch()')&&loader.includes('artifact.blob_sha')&&loader.includes('gitBlobSha(content)'),'Dynamic receipt loader missing')
const graphRoute=readFileSync('app/research/source-register/semantic-network.json/route.ts','utf8')
assert(graphRoute.includes("export const dynamic = 'force-static'")&&graphRoute.includes('buildResearchSemanticNetwork(')&&graphRoute.includes('research_only: true'))
assert(!page.includes('publicEvidence.metrics')&&!page.includes('buildPublicEvidenceDatasetFromRecords('),'Research intake must remain separate from graded evidence')
console.log(JSON.stringify({passed:true,throughWave:end,indexedPmids:index.total_unique_pmids,sourceVerifiedTitles:500,earlierPmidLookup:prior.length,topics:topicCount.size,doiRecords:dois.length,researchOnly:true,runtimePromotions:0},null,2))
