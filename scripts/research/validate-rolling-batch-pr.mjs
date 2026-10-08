import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {normalizeTitle,normalizeDoi} from './rolling-coordinator.mjs';

const DIR='ops/enrichment-submissions/reconciliation';
const REVIEW_DIR='ops/research-coordinator/reviews';
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));

const allManifests=fs.readdirSync(DIR).filter(n=>n.endsWith('-final-manifest.json')).flatMap(name=>{
 try{
  const m=read(path.join(DIR,name)),range=String(m.range||'').match(/^(\d+)-(\d+)$/);
  return range?[{name,m,start:Number(range[1]),end:Number(range[2])}]:[];
 }catch{return[]}
});
const manifests=allManifests.filter(x=>x.m?.state==='source_verified_independent_semantic_review_pending');
if(!manifests.length){console.log('No rolling batch manifest on this head; research infrastructure validation only.');process.exit(0)}

for(const {name,m} of manifests){
 const range=String(m.range||'').match(/^(\d+)-(\d+)$/);
 if(!range||Number(range[2])-Number(range[1])+1!==500)throw Error(name+': invalid 500 range');
 if(m.research_only!==true||m.fail_closed!==true||m.admission_policy?.runtime_admission!==false||
    m.admission_policy?.published_entities!==false||m.admission_policy?.recommendations!==false||
    m.admission_policy?.dosing_claims!==false)throw Error(name+': research-only admission boundary violated');

 const rows=[];
 for(const a of m.artifact_parts||[]){
  const p=a.path;
  if(!p?.startsWith(DIR+'/')||p.includes('..'))throw Error(name+': unsafe part');
  const part=read(p);
  if(part.rows?.length!==a.rows||part.exact_verified_rows!==a.rows||part.failures?.length)throw Error(name+': incomplete part');
  rows.push(...part.rows);
 }
 if(rows.length!==500)throw Error(name+': expected 500 rows');

 const pmids=new Set(),titles=new Set(),dois=new Set();
 for(const [i,r] of rows.entries()){
  if(r.wave!==Number(range[1])+i||!/^\d{5,10}$/.test(String(r.pmid))||r.research_only!==true||
     r.title_verified!==true||r.abstract_verified!==true||String(r.abstract||'').length<70)throw Error(name+': invalid row '+i);
  const t=normalizeTitle(r.title),d=normalizeDoi(r.doi||'');
  if(pmids.has(String(r.pmid))||titles.has(t)||(d&&dois.has(d)))throw Error(name+': duplicate identity');
  pmids.add(String(r.pmid));titles.add(t);if(d)dois.add(d);
 }

 const currentStart=Number(range[1]),currentEnd=Number(range[2]);
 const predecessor=allManifests.filter(x=>x.name!==name&&x.end===currentStart-1).sort((a,b)=>b.end-a.end)[0];
 if(!predecessor)throw Error(name+': predecessor batch is not merged into this head through wave '+(currentStart-1));
 const previousIndexPath=predecessor.m.cumulative_index||path.join(DIR,predecessor.name.replace(/-final-manifest\.json$/,'-pmid-index.json'));
 const currentIndexPath=m.cumulative_index||path.join(DIR,name.replace(/-final-manifest\.json$/,'-pmid-index.json'));
 const previousIndex=read(previousIndexPath),currentIndex=read(currentIndexPath);
 if(previousIndex.through_wave!==currentStart-1||currentIndex.through_wave!==currentEnd||
    currentIndex.previous_unique_pmids!==previousIndex.total_unique_pmids||
    currentIndex.total_unique_pmids!==previousIndex.total_unique_pmids+500)throw Error(name+': cumulative predecessor counts do not reconcile');
 const previousSet=new Set(previousIndex.pmids.map(String)),currentSet=new Set(currentIndex.pmids.map(String));
 if(currentSet.size!==currentIndex.total_unique_pmids||previousSet.size!==previousIndex.total_unique_pmids||
    [...previousSet].some(p=>!currentSet.has(p))||[...pmids].some(p=>previousSet.has(p)||!currentSet.has(p)))
   throw Error(name+': cumulative PMID index does not equal merged predecessor plus current 500');

 const contentHash=hash(rows);
 if(!m.batch_content_sha256||m.batch_content_sha256!==contentHash)throw Error(name+': immutable batch content hash mismatch');

 const reviewPath=path.join(REVIEW_DIR,name.replace(/-final-manifest\.json$/,'-independent-review.json'));
 if(!fs.existsSync(reviewPath))throw Error(name+': independent semantic review receipt missing');
 const review=read(reviewPath);
 if(review.schema_version!==1||review.batch_id!==m.batch_id||review.independent_semantic_review!==true||
    review.batch_content_sha256!==contentHash||review.reviewed_records!==500||review.accepted_records!==500||
    review.rejected_records!==0||!review.reviewer||!review.reviewed_at)throw Error(name+': invalid independent review receipt');
 for(const k of ['adverse_effects_reviewed','interactions_reviewed','limitations_reviewed','uncertainty_reviewed','overclaim_check'])
  if(review[k]!==true)throw Error(name+': review control missing '+k);

 if(!Array.isArray(review.record_reviews)||review.record_reviews.length!==500)throw Error(name+': expected 500 per-record independent reviews');
 const reviewedPmids=new Set();
 let semanticRelationships=0,contradictionFlags=0;
 for(const rr of review.record_reviews){
  const pmid=String(rr.pmid||'');
  if(!pmids.has(pmid)||reviewedPmids.has(pmid))throw Error(name+': review PMID coverage mismatch '+pmid);
  reviewedPmids.add(pmid);
  for(const k of ['accepted','source_identity_confirmed','evidence_class_confirmed','study_design_confirmed','adverse_effects_reviewed','interactions_reviewed','limitations_reviewed','uncertainty_reviewed','overclaim_check'])
   if(rr[k]!==true)throw Error(name+': per-record review control failed '+k+' for PMID '+pmid);
  if(!Array.isArray(rr.semantic_relationships)||!Array.isArray(rr.contradiction_flags))throw Error(name+': malformed semantic review for PMID '+pmid);
  for(const rel of rr.semantic_relationships){
   for(const k of ['subject','predicate','object','context','evidence_type','uncertainty'])if(!String(rel?.[k]||'').trim())throw Error(name+': incomplete semantic relation '+k+' for PMID '+pmid);
   semanticRelationships++;
  }
  contradictionFlags+=rr.contradiction_flags.length;
 }
 if(reviewedPmids.size!==500)throw Error(name+': independent review coverage incomplete');

 console.log(JSON.stringify({
  passed:true,range:m.range,reviewer:review.reviewer,reviewedRecords:500,
  semanticRelationships,contradictionFlags,predecessorThroughWave:currentStart-1,
  researchOnly:true,runtimeAdmission:false
 }));
}
