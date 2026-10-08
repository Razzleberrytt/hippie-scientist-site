import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {identityKeys,normalizeTitle,normalizeDoi,validateSnapshot} from './rolling-coordinator.mjs';
import {review,priority} from './evidence-pipeline.mjs';
import {withRecovery,classifyFailure} from './failure-controller.mjs';
import {summarizeRegistry,renderSummaryMarkdown} from './research-observatory.mjs';

const API=process.env.GITHUB_API_URL||'https://api.github.com';
const repo=process.env.GITHUB_REPOSITORY||'';
const token=process.env.GITHUB_TOKEN||'';
const registryBranch='research/coordination-registry';
const registryPath='ops/research-coordinator/live-registry.json';
const intakeRoot='ops/research-intake/';
const researchPrefixes=['ops/enrichment-submissions/reconciliation/','ops/research-coordinator/batches/'];

function required(v,n){if(!v)throw Error('missing '+n);return v}
async function api(url,{method='GET',body}={}){
 const r=await fetch(API+url,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+required(token,'GITHUB_TOKEN'),'X-GitHub-Api-Version':'2022-11-28','User-Agent':'ths-research-reservation-controller'},body:body===undefined?undefined:JSON.stringify(body)});
 if(!r.ok){const e=new Error(method+' '+url+' failed '+r.status+': '+(await r.text()).slice(0,1000));e.status=r.status;throw e}
 if(r.status===204)return null;const t=await r.text();return t?JSON.parse(t):null;
}
function b64(s){return Buffer.from(s,'utf8').toString('base64')}
function unb64(s){return Buffer.from(s,'base64').toString('utf8')}
function walk(value,out=[]){
 if(Array.isArray(value)){for(const x of value)walk(x,out);return out}
 if(!value||typeof value!=='object')return out;
 if(value.pmid&&value.title)out.push({pmid:String(value.pmid),title:String(value.title),doi:value.doi?String(value.doi):''});
 for(const v of Object.values(value))walk(v,out);
 return out;
}
function scanLocal(root){
 const out=[];const seen=new Set();
 function visit(p){if(!fs.existsSync(p))return;for(const d of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,d.name);if(d.isDirectory())visit(f);else if(d.name.endsWith('.json')){try{for(const r of walk(JSON.parse(fs.readFileSync(f,'utf8')))){const k=identityKeys(r).join('|');if(!seen.has(k)){seen.add(k);out.push(r)}}}catch{}}}}
 for(const prefix of researchPrefixes)visit(path.join(root,prefix));return out;
}

function reconcileBaseline(records){
 const byPmid=new Map(),byTitle=new Map(),byDoi=new Map(),out=[];
 for(const r of records){
  const pmid=String(r.pmid||''),title=normalizeTitle(r.title),doi=normalizeDoi(r.doi||'');
  const prior=byPmid.get(pmid);
  if(prior){
   const sameTitle=prior.title===title,sameDoi=!doi||!prior.doi||prior.doi===doi;
   if(!sameTitle||!sameDoi)throw Error('conflicting existing PMID identity '+pmid);
   continue;
  }
  if(byTitle.has(title)&&byTitle.get(title)!==pmid)throw Error('conflicting existing normalized title '+title);
  if(doi&&byDoi.has(doi)&&byDoi.get(doi)!==pmid)throw Error('conflicting existing DOI '+doi);
  byPmid.set(pmid,{title,doi});byTitle.set(title,pmid);if(doi)byDoi.set(doi,pmid);out.push(r);
 }
 return out;
}

async function listOpenPrRecords(){
 const pulls=await api('/repos/'+repo+'/pulls?state=open&per_page=100');const out=[];const heads={};
 for(const pr of pulls){heads[String(pr.number)]=pr.head.sha;let page=1;for(;;page++){const files=await api('/repos/'+repo+'/pulls/'+pr.number+'/files?per_page=100&page='+page);for(const file of files){if(!researchPrefixes.some(p=>file.filename.startsWith(p))||!file.filename.endsWith('.json'))continue;try{const c=await api('/repos/'+repo+'/contents/'+encodeURIComponent(file.filename).replaceAll('%2F','/')+'?ref='+pr.head.sha);for(const r of walk(JSON.parse(unb64(c.content))))out.push({...r,batch:'PR-'+pr.number})}catch(e){if(Number(e.status)!==404)throw e}}if(files.length<100)break}}
 return {records:out,heads,pulls:pulls.map(p=>({number:p.number,head_sha:p.head.sha,title:p.title}))};
}
async function ensureRegistryBranch(){
 try{return await api('/repos/'+repo+'/git/ref/heads/'+encodeURIComponent(registryBranch))}
 catch(e){if(Number(e.status)!==404)throw e}
 const main=await api('/repos/'+repo+'/git/ref/heads/main');
 return api('/repos/'+repo+'/git/refs',{method:'POST',body:{ref:'refs/heads/'+registryBranch,sha:main.object.sha}});
}
async function getRegistry(){
 await ensureRegistryBranch();
 try{const f=await api('/repos/'+repo+'/contents/'+registryPath+'?ref='+encodeURIComponent(registryBranch));return {sha:f.sha,value:JSON.parse(unb64(f.content))}}
 catch(e){if(Number(e.status)!==404)throw e;return {sha:null,value:{schema_version:1,active_batch_counter:1,active_batch_id:'rolling-0001',reservations:[],batches:[{id:'rolling-0001',state:'ACTIVE',created_at:new Date().toISOString()}],incidents:[]}}}
}
async function putRegistry(current,value,message){
 value.observatory=summarizeRegistry(value);
 const body={message,content:b64(JSON.stringify(value,null,2)+'\n'),branch:registryBranch};if(current.sha)body.sha=current.sha;
 return api('/repos/'+repo+'/contents/'+registryPath,{method:'PUT',body});
}
function nextBatch(reg){
 reg.active_batch_counter=(reg.active_batch_counter??1)+1;reg.active_batch_id='rolling-'+String(reg.active_batch_counter).padStart(4,'0');reg.batches.push({id:reg.active_batch_id,state:'ACTIVE',created_at:new Date().toISOString()});return reg.active_batch_id;
}
function validateManifest(m){
 if(m?.schema_version!==1||!Number.isInteger(Number(m.lane))||Number(m.lane)<1||Number(m.lane)>5)throw Error('invalid lane manifest');
 if(m.research_only!==true)throw Error('research_only must be true');
 if(!Array.isArray(m.records)||m.records.length<1||m.records.length>25)throw Error('manifest must contain 1..25 records');
 for(const r of m.records){
  const x=review(r);if(!x.accepted)throw Error('record '+(r.pmid??'?')+' review failed: '+(x.reason||x.flags.join('; ')));
  const sig=r.signals;if(!sig||['safety','evidence_gap','contradiction','novelty','graph_connectivity'].some(k=>typeof sig[k]!=='number'||sig[k]<0||sig[k]>1))throw Error('record '+(r.pmid??'?')+' missing valid priority signals');
 }
 return m;
}
function reserveInto(reg,manifest,baseline){
 const global={baseline:reconcileBaseline([...baseline,...reg.reservations]),reservations:[]};validateSnapshot(global);
 const candidate={baseline:global.baseline,reservations:manifest.records};validateSnapshot(candidate);
 const stamp=new Date().toISOString();const reserved=[];
 for(const original of manifest.records){
   let batch=reg.batches.find(b=>b.id===reg.active_batch_id);if(!batch){reg.batches.push(batch={id:reg.active_batch_id,state:'ACTIVE',created_at:stamp})}
   if(reg.reservations.filter(r=>r.batch_id===batch.id).length>=500){batch.state='FREEZE_PENDING';nextBatch(reg);batch=reg.batches.find(b=>b.id===reg.active_batch_id)}
   const record={...original,priority_score:priority(original),lane:String(manifest.lane),batch_id:batch.id,state:'SOURCE_VERIFIED',research_only:true,reservation_id:crypto.createHash('sha256').update(String(original.pmid)+'\0'+batch.id).digest('hex').slice(0,20),reserved_at:stamp,source_branch:process.env.GITHUB_REF_NAME||null};
   reg.reservations.push(record);reserved.push(record);
   if(reg.reservations.filter(r=>r.batch_id===batch.id).length===500){batch.state='FREEZE_PENDING';batch.frozen_at=stamp;nextBatch(reg)}
 }
 return reserved;
}
async function findMainThroughWave(){
 const tree=scanLocal(process.cwd());let best={max:0,pmids:[]};
 for(const p of fs.readdirSync('ops/enrichment-submissions/reconciliation',{withFileTypes:true})){
  if(!p.isFile()||!p.name.endsWith('-final-manifest.json'))continue;
  try{
   const m=JSON.parse(fs.readFileSync(path.join('ops/enrichment-submissions/reconciliation',p.name),'utf8')),n=Number(String(m.range||'').split('-')[1]);
   if(!Number.isFinite(n)||n<=best.max)continue;
   const indexPath=m.cumulative_index||path.join('ops/enrichment-submissions/reconciliation',p.name.replace(/-final-manifest\.json$/,'-pmid-index.json'));
   const idx=JSON.parse(fs.readFileSync(indexPath,'utf8'));
   if(idx.through_wave!==n||!Array.isArray(idx.pmids)||idx.pmids.length!==idx.total_unique_pmids)continue;
   best={max:n,pmids:idx.pmids.map(String)};
  }catch{}
 }
 if(!best.max||!best.pmids.length)throw Error('authoritative main research PMID index unavailable');
 return {max:best.max,pmids:best.pmids,records:tree};
}
async function materializeBatch(reg,batch){
 if(batch.state!=='FREEZE_PENDING')return;
 const rows=reg.reservations.filter(r=>r.batch_id===batch.id);if(rows.length!==500)throw Error('freeze pending batch '+batch.id+' has '+rows.length+' records');
 const prInventory=await listOpenPrRecords();let maxPending=0;
 for(const p of prInventory.pulls){const m=String(p.title).match(/waves\s+(\d+)[–-](\d+)/i);if(m)maxPending=Math.max(maxPending,Number(m[2]))}
 const local=await findMainThroughWave();const start=Math.max(local.max,maxPending,...reg.batches.map(b=>Number(b.wave_end)||0))+1,end=start+499;
 const branch='research/enrichment-waves-'+start+'-'+end+'-rolling';const main=await api('/repos/'+repo+'/git/ref/heads/main');
 try{await api('/repos/'+repo+'/git/refs',{method:'POST',body:{ref:'refs/heads/'+branch,sha:main.object.sha}})}catch(e){if(Number(e.status)!==422)throw e}
 const prefix=new Date().toISOString().slice(0,10)+'-enrichment-waves-'+start+'-'+end;
 const assigned=rows.map((r,i)=>({...r,wave:start+i,state:'exact_source_verified_pending_semantic_final_review'}));
 const parts=[];
 for(let i=0;i<5;i++){const subset=assigned.slice(i*100,(i+1)*100),name=prefix+'-efetch-verified-part-0'+(i+1)+'.json',file='ops/enrichment-submissions/reconciliation/'+name;const payload={schema_version:1,range:(start+i*100)+'-'+(start+i*100+99),state:'verified_pending_semantic_final_review',exact_verified_rows:100,unverified_rows:0,rows:subset,failures:[]};const created=await api('/repos/'+repo+'/contents/'+file,{method:'PUT',body:{message:'research: freeze '+batch.id+' part '+(i+1),content:b64(JSON.stringify(payload,null,2)+'\n'),branch}});parts.push({path:file,blob_sha:created.content.sha,rows:100})}
 const predecessorPrs=prInventory.pulls.flatMap(p=>{const m=String(p.title).match(/waves\s+(\d+)[–-](\d+)/i);if(!m)return[];const a=Number(m[1]),z=Number(m[2]);return a>local.max&&z<start?[{...p,wave_start:a,wave_end:z}]:[]});
 const predecessorPmids=predecessorPrs.flatMap(p=>prInventory.records.filter(r=>r.batch==='PR-'+p.number).map(r=>String(r.pmid)));
 const previousPmids=[...new Set([...local.pmids.map(String),...predecessorPmids])];const newPmids=assigned.map(r=>String(r.pmid));const index={schema_version:1,through_wave:end,total_unique_pmids:previousPmids.length+500,previous_unique_pmids:previousPmids.length,pmids:[...previousPmids,...newPmids]};
 const idxPath='ops/enrichment-submissions/reconciliation/'+prefix+'-pmid-index.json';await api('/repos/'+repo+'/contents/'+idxPath,{method:'PUT',body:{message:'research: freeze '+batch.id+' cumulative index',content:b64(JSON.stringify(index,null,2)+'\n'),branch}});
 const manifest={schema_version:1,batch_id:prefix+'-final',range:start+'-'+end,state:'source_verified_independent_semantic_review_pending',research_only:true,fail_closed:true,previous_unique_pmids:previousPmids.length,accepted_new_unique_pmids:500,cumulative_unique_pmids:index.total_unique_pmids,exact_title_verified:500,abstract_verified:500,admission_policy:{published_entities:false,recommendations:false,dosing_claims:false,runtime_admission:false,clinical_claims_require_separate_review:true},artifact_parts:parts,cumulative_index:idxPath,independent_semantic_review:false,batch_content_sha256:crypto.createHash('sha256').update(JSON.stringify(assigned)).digest('hex'),predecessor_snapshots:predecessorPrs.map(p=>({pr_number:p.number,head_sha:p.head_sha,wave_start:p.wave_start,wave_end:p.wave_end,pmid_sha256:crypto.createHash('sha256').update(JSON.stringify([...new Set(prInventory.records.filter(r=>r.batch==='PR-'+p.number).map(r=>String(r.pmid))).values()].sort())).digest('hex')}))};
 const manifestPath='ops/enrichment-submissions/reconciliation/'+prefix+'-final-manifest.json';await api('/repos/'+repo+'/contents/'+manifestPath,{method:'PUT',body:{message:'research: freeze '+batch.id+' manifest',content:b64(JSON.stringify(manifest,null,2)+'\n'),branch}});
 const status={schema_version:1,batch_id:prefix+'-final-status',range:start+'-'+end,state:'source_verified_independent_semantic_review_pending',verified_rows:500,exact_verified_rows:500,previous_unique_pmids:previousPmids.length,new_unique_pmids:500,total_unique_pmids:index.total_unique_pmids,duplicate_pmids:0,duplicate_normalized_dois:0,duplicate_normalized_titles:0,predecessor_pmid_collisions:0,research_only:true,published:false,admission:'fail_closed_no_recommendations',merge_gate:'Independent semantic review plus exact-head repository validation required',artifacts:{manifest:manifestPath,index:idxPath}};
 await api('/repos/'+repo+'/contents/ops/enrichment-submissions/reconciliation/'+prefix+'-final-status.json',{method:'PUT',body:{message:'research: freeze '+batch.id+' status',content:b64(JSON.stringify(status,null,2)+'\n'),branch}});
 const archive={schema_version:1,through_wave:start-1,inventory_only:true,prior_unique_pmids:previousPmids.length,pmids:previousPmids};await api('/repos/'+repo+'/contents/public/data/research/pmid-register-through-'+(start-1)+'.json',{method:'PUT',body:{message:'research: add historical PMID inventory through '+(start-1),content:b64(JSON.stringify(archive,null,2)+'\n'),branch}});
 const pr=await api('/repos/'+repo+'/pulls',{method:'POST',body:{title:'data: rolling enrichment waves '+start+'–'+end+' (500 source-verified; semantic review pending)',head:branch,base:'main',draft:true,body:'Rolling batch '+batch.id+'. 500 source-verified research-only records. Independent semantic review is REQUIRED before merge. No clinical/public evidence admission. Predecessor continuity and exact-head Research rolling gate must pass. Related #6411.'}});
 batch.state='DRAFT_PR';batch.wave_start=start;batch.wave_end=end;batch.pr_number=pr.number;batch.branch=branch;batch.blocker='independent semantic review pending';
}
async function commitRegistryMutation(mutator,message){
 return withRecovery(async()=>{const current=await getRegistry(),reg=current.value;await mutator(reg);const saved=await putRegistry(current,reg,message);return {reg,saved}},{});
}
function appendSummary(reg){const file=process.env.GITHUB_STEP_SUMMARY;if(file)fs.appendFileSync(file,renderSummaryMarkdown(summarizeRegistry(reg)))}
async function run(){
 required(repo,'GITHUB_REPOSITORY');const mode=process.argv[2]||'reserve';
 if(mode==='reserve'){
   const p=required(process.env.CANDIDATE_PATH,'CANDIDATE_PATH');if(!p.startsWith(intakeRoot)||!p.endsWith('.json'))throw Error('unsafe candidate path');
   const manifest=validateManifest(JSON.parse(fs.readFileSync(p,'utf8')));const main=await findMainThroughWave();const pending=await listOpenPrRecords();let reserved=[];
   const {reg}=await commitRegistryMutation(async reg=>{reserved=reserveInto(reg,manifest,[...main.records,...pending.records])},'research: reserve lane '+manifest.lane+' intake');
   for(const b of reg.batches.filter(x=>x.state==='FREEZE_PENDING')){try{await materializeBatch(reg,b)}catch(e){b.blocker=classifyFailure(e).action+': '+e.message;reg.incidents.push({at:new Date().toISOString(),batch:b.id,error:e.message,class:classifyFailure(e)})}}
   await commitRegistryMutation(async latest=>{for(const b of reg.batches){const x=latest.batches.find(y=>y.id===b.id);if(x)Object.assign(x,b)};latest.incidents=[...(latest.incidents||[]),...(reg.incidents||[]).slice(-(reg.incidents?.length||0))]},'research: reconcile freeze/PR state');
   appendSummary(reg);console.log(JSON.stringify({reserved:reserved.length,lane:manifest.lane,batches:[...new Set(reserved.map(r=>r.batch_id))]}));
 }else if(mode==='recover'){
   const {reg}=await commitRegistryMutation(async reg=>{for(const b of reg.batches.filter(x=>x.state==='FREEZE_PENDING')){try{await materializeBatch(reg,b)}catch(e){b.blocker=classifyFailure(e).action+': '+e.message;reg.incidents.push({at:new Date().toISOString(),batch:b.id,error:e.message,class:classifyFailure(e)})}}},'research: recover rolling batch freezes');
   appendSummary(reg);
 }else throw Error('unknown mode');
}
run().catch(e=>{console.error('BLOCKED '+e.message);console.error(JSON.stringify(classifyFailure(e)));process.exitCode=1});
