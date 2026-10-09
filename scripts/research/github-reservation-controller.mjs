import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {normalizeTitle,normalizeDoi,validateSnapshot} from './rolling-coordinator.mjs';
import {review,priority} from './evidence-pipeline.mjs';
import {withRecovery,classifyFailure} from './failure-controller.mjs';
import {summarizeRegistry,renderSummaryMarkdown} from './research-observatory.mjs';
import {hydrateIntakeEnvelope} from './pubmed-intake-hydrator.mjs';

const API=process.env.GITHUB_API_URL||'https://api.github.com';
const repo=process.env.GITHUB_REPOSITORY||'';
const token=process.env.GITHUB_TOKEN||'';
const registryBranch='research-coordination-registry';
const registryPath='ops/research-coordinator/live-registry.json';
const intakeRoot='ops/research-intake/';

function required(v,n){if(!v)throw Error('missing '+n);return v}
async function api(url,{method='GET',body}={}){
 for(let attempt=1;attempt<=3;attempt++){
  const r=await fetch(API+url,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+required(token,'GITHUB_TOKEN'),'X-GitHub-Api-Version':'2022-11-28','User-Agent':'ths-research-reservation-controller'},body:body===undefined?undefined:JSON.stringify(body)});
  if(!r.ok){const e=new Error(method+' '+url+' failed '+r.status+': '+(await r.text()).slice(0,1000));e.status=r.status;throw e}
  if(r.status===204)return null;
  const t=await r.text();
  if(!t)return null;
  try{return JSON.parse(t)}catch(error){
   if(method!=='GET'||attempt===3||!(error instanceof SyntaxError))throw error;
   await new Promise(resolve=>setTimeout(resolve,attempt*250));
  }
 }
}
function b64(s){return Buffer.from(s,'utf8').toString('base64')}
function unb64(s){return Buffer.from(s,'base64').toString('utf8')}
async function upsertBranchJson(branch,file,value,message){
 const text=JSON.stringify(value,null,2)+'\n';let existing=null;
 try{existing=await api('/repos/'+repo+'/contents/'+encodeURIComponent(file).replaceAll('%2F','/')+'?ref='+encodeURIComponent(branch))}
 catch(e){if(Number(e.status)!==404)throw e}
 if(existing&&unb64(existing.content)===text)return {content:{sha:existing.sha},unchanged:true};
 const body={message,content:b64(text),branch};if(existing?.sha)body.sha=existing.sha;
 return api('/repos/'+repo+'/contents/'+encodeURIComponent(file).replaceAll('%2F','/'),{method:'PUT',body});
}
function walk(value,out=[]){
 if(Array.isArray(value)){for(const x of value)walk(x,out);return out}
 if(!value||typeof value!=='object')return out;
 if(value.pmid&&value.title)out.push({pmid:String(value.pmid),title:String(value.title),doi:value.doi?String(value.doi):''});
 for(const v of Object.values(value))walk(v,out);
 return out;
}
export function reconcileBaseline(records){
 const byPmid=new Map(),byTitle=new Map(),byDoi=new Map(),out=[],position=new Map();
 const placeholder=(pmid,title)=>title===normalizeTitle('historical PMID '+pmid);
 for(const r of records){
  const pmid=String(r.pmid||''),title=normalizeTitle(r.title),doi=normalizeDoi(r.doi||'');
  const prior=byPmid.get(pmid);
  if(prior){
   const priorPlaceholder=placeholder(pmid,prior.title),currentPlaceholder=placeholder(pmid,title);
   if(priorPlaceholder&&!currentPlaceholder){
     byTitle.delete(prior.title);if(prior.doi)byDoi.delete(prior.doi);
     if(byTitle.has(title)&&byTitle.get(title)!==pmid)throw Error('conflicting existing normalized title '+title);
     if(doi&&byDoi.has(doi)&&byDoi.get(doi)!==pmid)throw Error('conflicting existing DOI '+doi);
     byPmid.set(pmid,{title,doi});byTitle.set(title,pmid);if(doi)byDoi.set(doi,pmid);
     out[position.get(pmid)]={...r};continue;
   }
   if(currentPlaceholder)continue;
   const sameTitle=prior.title===title,sameDoi=!doi||!prior.doi||prior.doi===doi;
   if(!sameTitle||!sameDoi)throw Error('conflicting existing PMID identity '+pmid);
   continue;
  }
  if(byTitle.has(title)&&byTitle.get(title)!==pmid)throw Error('conflicting existing normalized title '+title);
  if(doi&&byDoi.has(doi)&&byDoi.get(doi)!==pmid)throw Error('conflicting existing DOI '+doi);
  byPmid.set(pmid,{title,doi});byTitle.set(title,pmid);if(doi)byDoi.set(doi,pmid);position.set(pmid,out.length);out.push(r);
 }
 return out;
}

async function listOpenPrRecords(){
 const pulls=await api('/repos/'+repo+'/pulls?state=open&per_page=100');const out=[];const heads={};
 for(const pr of pulls){heads[String(pr.number)]=pr.head.sha;let page=1;for(;;page++){const files=await api('/repos/'+repo+'/pulls/'+pr.number+'/files?per_page=100&page='+page);for(const file of files){if(!file.filename.startsWith('ops/enrichment-submissions/reconciliation/')||!/(?:efetch-verified-part|source-verified-part|final-part)-[0-9]+\.json$/.test(file.filename))continue;try{const c=await api('/repos/'+repo+'/contents/'+encodeURIComponent(file.filename).replaceAll('%2F','/')+'?ref='+pr.head.sha);for(const r of walk(JSON.parse(unb64(c.content))))out.push({...r,batch:'PR-'+pr.number})}catch(e){if(Number(e.status)!==404)throw e}}if(files.length<100)break}}
 return {records:out,heads,pulls:pulls.map(p=>({number:p.number,head_sha:p.head.sha,head_ref:p.head.ref,title:p.title,draft:p.draft,state:p.state}))};
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
 const result=await api('/repos/'+repo+'/contents/'+registryPath,{method:'PUT',body});
 const publicPath='ops/research-coordinator/public-observatory.json';
 let publicSha=null;
 try{publicSha=(await api('/repos/'+repo+'/contents/'+publicPath+'?ref='+encodeURIComponent(registryBranch))).sha}catch(e){if(Number(e.status)!==404)throw e}
 const publicBody={message:'research: update sanitized operations observatory',content:b64(JSON.stringify(value.observatory,null,2)+'\n'),branch:registryBranch};
 if(publicSha)publicBody.sha=publicSha;
 await api('/repos/'+repo+'/contents/'+publicPath,{method:'PUT',body:publicBody});
 return result;
}
function nextBatch(reg){
 reg.active_batch_counter=(reg.active_batch_counter??1)+1;reg.active_batch_id='rolling-'+String(reg.active_batch_counter).padStart(4,'0');reg.batches.push({id:reg.active_batch_id,state:'ACTIVE',created_at:new Date().toISOString()});return reg.active_batch_id;
}
const laneFocus={1:'sleep-stress-mood',2:'cognition-metabolic',3:'botanical-pharmacology-safety',4:'withdrawal-dependence-nps',5:'contradictions-replication'};
export function validateManifest(m){
 if(m?.schema_version!==1||!Number.isInteger(Number(m.lane))||Number(m.lane)<1||Number(m.lane)>5)throw Error('invalid lane manifest');
 if(m.research_only!==true)throw Error('research_only must be true');
 if(m.lane_focus!==laneFocus[Number(m.lane)])throw Error('lane_focus does not match lane '+m.lane);
 if(!Array.isArray(m.records)||m.records.length<1||m.records.length>25)throw Error('manifest must contain 1..25 records');
 for(const r of m.records){
  if(r.research_domain!==m.lane_focus)throw Error('record '+(r.pmid??'?')+' research_domain does not match lane focus');
  const x=review(r);if(!x.accepted)throw Error('record '+(r.pmid??'?')+' review failed: '+(x.reason||x.flags.join('; ')));
  const sig=r.signals;if(!sig||['safety','evidence_gap','contradiction','novelty','graph_connectivity'].some(k=>typeof sig[k]!=='number'||sig[k]<0||sig[k]>1))throw Error('record '+(r.pmid??'?')+' missing valid priority signals');
 }
 return m;
}
function reserveInto(reg,manifest,baseline){
 const global={baseline:reconcileBaseline([...baseline,...reg.reservations.filter(r=>r.state!=='RELEASED')]),reservations:[]};validateSnapshot(global);
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
 const dir='ops/enrichment-submissions/reconciliation';
 const batches=fs.readdirSync(dir,{withFileTypes:true}).filter(p=>p.isFile()&&p.name.endsWith('-final-manifest.json')).flatMap(p=>{try{
   const m=JSON.parse(fs.readFileSync(path.join(dir,p.name),'utf8')),range=String(m.range||'').match(/^(\d+)-(\d+)$/);
   if(!range||Number(range[2])-Number(range[1])+1!==500||m.research_only!==true||m.accepted_new_unique_pmids!==500)return[];
   const idxName=m.cumulative_index?path.basename(m.cumulative_index):p.name.replace(/-final-manifest\.json$/,'-pmid-index.json');
   const index=JSON.parse(fs.readFileSync(path.join(dir,idxName),'utf8'));
   if(index.through_wave!==Number(range[2])||index.total_unique_pmids!==m.cumulative_unique_pmids||!Array.isArray(index.pmids)||index.pmids.length!==index.total_unique_pmids)return[];
   return[{m,index,end:Number(range[2])}]
  }catch{return[]}}).sort((a,b)=>b.end-a.end);
 if(!batches.length)throw Error('authoritative main research PMID index unavailable');
 const latest=batches[0],authoritativePmids=new Set(latest.index.pmids.map(String));
 const byPmid=new Map(latest.index.pmids.map(pmid=>[String(pmid),{pmid:String(pmid),title:'historical PMID '+String(pmid),doi:''}]));
 // Recover real title/DOI identities only from finalized canonical batch artifacts, never scratch selections.
 for(const batch of batches)for(const a of batch.m.artifact_parts||[]){
   if(!a.path?.startsWith(dir+'/'))continue;
   try{
     const part=JSON.parse(fs.readFileSync(a.path,'utf8'));
     for(const r of part.rows||[])if(r.pmid&&r.title&&authoritativePmids.has(String(r.pmid)))
       byPmid.set(String(r.pmid),{pmid:String(r.pmid),title:String(r.title),doi:r.doi?String(r.doi):''});
   }catch(error){if(process.env.RESEARCH_DEBUG)console.warn('research artifact skipped:',error.message)}
 }
 return {max:latest.end,pmids:latest.index.pmids.map(String),records:[...byPmid.values()]};
}
async function allocateFrozenRanges(){
 const main=await findMainThroughWave();
 const pending=await listOpenPrRecords();
 const pendingEnds=pending.pulls.flatMap(p=>{
   const match=String(p.title||'').match(/waves\s+(\d+)[–-](\d+)/i);
   return match?[Number(match[2])]:[];
 });
 return commitRegistryMutation(async reg=>{
   let cursor=Math.max(main.max,0,...pendingEnds,...reg.batches.map(b=>Number(b.wave_end)||0));
   const waiting=reg.batches
     .filter(b=>b.state==='FREEZE_PENDING'&&!Number(b.wave_start))
     .sort((a,b)=>String(a.frozen_at||a.created_at||'').localeCompare(String(b.frozen_at||b.created_at||''))||String(a.id).localeCompare(String(b.id)));
   for(const batch of waiting){
     const start=cursor+1,end=start+499;
     batch.wave_start=start;
     batch.wave_end=end;
     batch.branch='research/enrichment-waves-'+start+'-'+end+'-rolling';
     batch.artifact_prefix=new Date().toISOString().slice(0,10)+'-enrichment-waves-'+start+'-'+end;
     batch.allocated_at=new Date().toISOString();
     cursor=end;
   }
 },'research: allocate atomic rolling wave ranges');
}

async function materializeBatch(reg,batch){
 if(batch.state!=='FREEZE_PENDING')return;
 const rows=reg.reservations.filter(r=>r.batch_id===batch.id&&r.state!=='RELEASED');
 if(rows.length!==500)throw Error('freeze pending batch '+batch.id+' has '+rows.length+' active records');
 const start=Number(batch.wave_start),end=Number(batch.wave_end),branch=String(batch.branch||''),prefix=String(batch.artifact_prefix||'');
 if(!start||end!==start+499||!branch||!prefix)throw Error('batch '+batch.id+' has no atomic wave allocation');

 const prInventory=await listOpenPrRecords(),local=await findMainThroughWave();
 const owner=repo.split('/')[0];
 let branchExists=true;
 try{await api('/repos/'+repo+'/git/ref/heads/'+encodeURIComponent(branch))}
 catch(e){if(Number(e.status)!==404)throw e;branchExists=false}
 if(!branchExists){
   const main=await api('/repos/'+repo+'/git/ref/heads/main');
   await api('/repos/'+repo+'/git/refs',{method:'POST',body:{ref:'refs/heads/'+branch,sha:main.object.sha}});
 }

 const assigned=rows.map((r,i)=>({...r,wave:start+i,state:'exact_source_verified_pending_semantic_final_review'}));
 const parts=[];
 for(let i=0;i<5;i++){
   const subset=assigned.slice(i*100,(i+1)*100),name=prefix+'-efetch-verified-part-0'+(i+1)+'.json',file='ops/enrichment-submissions/reconciliation/'+name;
   const payload={schema_version:1,range:(start+i*100)+'-'+(start+i*100+99),state:'verified_pending_semantic_final_review',exact_verified_rows:100,unverified_rows:0,rows:subset,failures:[]};
   const created=await upsertBranchJson(branch,file,payload,'research: freeze '+batch.id+' part '+(i+1));
   parts.push({path:file,blob_sha:created.content.sha,rows:100});
 }

 const predecessorPrs=prInventory.pulls.flatMap(p=>{const m=String(p.title).match(/waves\s+(\d+)[–-](\d+)/i);if(!m)return[];const a=Number(m[1]),z=Number(m[2]);return a>local.max&&z<start?[{...p,wave_start:a,wave_end:z}]:[]});
 const predecessorRows=predecessorPrs.flatMap(p=>prInventory.records.filter(r=>r.batch==='PR-'+p.number));
 const predictedBaseline=reconcileBaseline([...local.records,...predecessorRows]);
 const previousPmids=[...new Set(predictedBaseline.map(r=>String(r.pmid)))],newPmids=assigned.map(r=>String(r.pmid));
 if(new Set([...previousPmids,...newPmids]).size!==previousPmids.length+500)throw Error('predicted cumulative PMID collision');
 const index={schema_version:1,through_wave:end,total_unique_pmids:previousPmids.length+500,previous_unique_pmids:previousPmids.length,pmids:[...previousPmids,...newPmids]};
 const idxPath='ops/enrichment-submissions/reconciliation/'+prefix+'-pmid-index.json';
 await upsertBranchJson(branch,idxPath,index,'research: freeze '+batch.id+' cumulative index');

 const batchHash=crypto.createHash('sha256').update(JSON.stringify(assigned)).digest('hex');
 const manifest={schema_version:1,batch_id:prefix+'-final',rolling_batch_id:batch.id,range:start+'-'+end,state:'source_verified_independent_semantic_review_pending',research_only:true,fail_closed:true,previous_unique_pmids:previousPmids.length,accepted_new_unique_pmids:500,cumulative_unique_pmids:index.total_unique_pmids,exact_title_verified:500,abstract_verified:500,admission_policy:{published_entities:false,recommendations:false,dosing_claims:false,runtime_admission:false,clinical_claims_require_separate_review:true},artifact_parts:parts,cumulative_index:idxPath,independent_semantic_review:false,batch_content_sha256:batchHash,predecessor_snapshots:predecessorPrs.map(p=>({pr_number:p.number,head_sha:p.head_sha,wave_start:p.wave_start,wave_end:p.wave_end,pmid_sha256:crypto.createHash('sha256').update(JSON.stringify([...new Set(prInventory.records.filter(r=>r.batch==='PR-'+p.number).map(r=>String(r.pmid)))].sort())).digest('hex')}))};
 const manifestPath='ops/enrichment-submissions/reconciliation/'+prefix+'-final-manifest.json';
 await upsertBranchJson(branch,manifestPath,manifest,'research: freeze '+batch.id+' manifest');

 const status={schema_version:1,batch_id:prefix+'-final-status',rolling_batch_id:batch.id,range:start+'-'+end,state:'source_verified_independent_semantic_review_pending',verified_rows:500,exact_verified_rows:500,previous_unique_pmids:previousPmids.length,new_unique_pmids:500,total_unique_pmids:index.total_unique_pmids,duplicate_pmids:0,duplicate_normalized_dois:0,duplicate_normalized_titles:0,predecessor_pmid_collisions:0,research_only:true,published:false,admission:'fail_closed_no_recommendations',merge_gate:'Independent semantic review, predecessor continuity, and exact-head repository validation required',artifacts:{manifest:manifestPath,index:idxPath}};
 await upsertBranchJson(branch,'ops/enrichment-submissions/reconciliation/'+prefix+'-final-status.json',status,'research: freeze '+batch.id+' status');

 const archive={schema_version:1,through_wave:start-1,inventory_only:true,prior_unique_pmids:previousPmids.length,pmids:previousPmids};
 await upsertBranchJson(branch,'public/data/research/pmid-register-through-'+(start-1)+'.json',archive,'research: add historical PMID inventory through '+(start-1));

 const reviewQueuePath='ops/research-coordinator/review-queues/'+prefix+'-review-queue.json';
 const reviewQueue={schema_version:1,batch_id:manifest.batch_id,rolling_batch_id:batch.id,batch_content_sha256:batchHash,research_only:true,required_checks:['source_identity','relevance','evidence_class','study_design','population','intervention','outcomes','conclusion_direction','adverse_effects','interactions','limitations','uncertainty','overclaim','semantic_relationships','contradictions'],records:assigned.map((r,i)=>({pmid:String(r.pmid),wave:r.wave,priority_score:r.priority_score??0,category:r.category,relevance_reason:r.relevance_reason,evidence_class:r.evidence_class,study_design:r.study_design,population:r.population,intervention:r.intervention,outcomes:r.outcomes,conclusion_direction:r.conclusion_direction,interaction_evidence_level:r.interaction_evidence_level,signals:r.signals,source_artifact:parts[Math.floor(i/100)].path}))};
 await upsertBranchJson(branch,reviewQueuePath,reviewQueue,'research: add independent review queue for '+batch.id);

 const history=await api('/repos/'+repo+'/pulls?state=all&head='+encodeURIComponent(owner+':'+branch)+'&per_page=10');
 let pr=history.find(p=>p.head?.ref===branch&&p.state==='open');
 const priorClosed=history.find(p=>p.head?.ref===branch&&p.state==='closed');
 if(!pr&&priorClosed?.merged){
   batch.state='MERGED';batch.pr_number=priorClosed.number;batch.merged_at=priorClosed.merged_at;batch.blocker=null;
   for(const r of reg.reservations.filter(r=>r.batch_id===batch.id))r.state='MERGED';
   return;
 }
 if(!pr&&priorClosed&&!priorClosed.merged){
   batch.state='ABANDONED';batch.pr_number=priorClosed.number;batch.blocker='PR closed without merge';
   for(const r of reg.reservations.filter(r=>r.batch_id===batch.id))r.state='RELEASED';
   return;
 }
 if(!pr)pr=await api('/repos/'+repo+'/pulls',{method:'POST',body:{title:'data: rolling enrichment waves '+start+'–'+end+' (500 source-verified; semantic review pending)',head:branch,base:'main',draft:true,body:'Rolling batch '+batch.id+'. 500 source-verified research-only records. Independent semantic review is REQUIRED before merge. No clinical/public evidence admission. Predecessor continuity and exact-head Research rolling gate must pass. Review queue: '+reviewQueuePath+'. Related #6411.'}});
 batch.state=pr.draft?'DRAFT_PR':'MERGE_TRAIN';batch.pr_number=pr.number;batch.branch=branch;batch.review_queue=reviewQueuePath;batch.blocker=pr.draft?'independent semantic review pending':'exact-head merge train pending';
}
async function reconcileBatchPrStates(reg){
 for(const b of reg.batches.filter(x=>x.pr_number&&['DRAFT_PR','MERGE_TRAIN'].includes(x.state))){
   try{
     const pr=await api('/repos/'+repo+'/pulls/'+b.pr_number);
     if(pr.merged){
       b.state='MERGED';b.merged_at=pr.merged_at;b.blocker=null;
       for(const r of reg.reservations.filter(r=>r.batch_id===b.id))r.state='MERGED';
       continue;
     }
     if(pr.state==='closed'){
       b.state='ABANDONED';b.closed_at=pr.closed_at;b.blocker='PR closed without merge';
       for(const r of reg.reservations.filter(r=>r.batch_id===b.id))r.state='RELEASED';
       continue;
     }
     const runs=await api('/repos/'+repo+'/actions/runs?head_sha='+encodeURIComponent(pr.head.sha)+'&per_page=100');
     const gate=(runs.workflow_runs||[]).filter(r=>r.name==='Research rolling gate').sort((a,b)=>Number(b.run_number)-Number(a.run_number))[0];
     b.state=pr.draft?'DRAFT_PR':'MERGE_TRAIN';
