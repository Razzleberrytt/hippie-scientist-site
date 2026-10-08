import crypto from 'node:crypto';
export const LANES={1:'sleep-stress-mood',2:'cognition-metabolic',3:'botanical-pharmacology-safety',4:'withdrawal-dependence-nps',5:'contradictions-replication'};
export const STATES=['DISCOVERED','SOURCE_VERIFIED','SCIENTIFIC_REVIEWED','RESERVED','STAGED','MERGED','SEMANTIC_INTEGRATED','PUBLISHED'];
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function review(record){
 const missing=['pmid','title','abstract','source_title','source_url','evidence_class','study_design','limitations','provenance'].filter(k=>!record[k]);
 if(missing.length)return {accepted:false,reason:'missing '+missing.join(', ')};
 if(!['human','animal','in-vitro','mixed','review'].includes(record.evidence_class))return {accepted:false,reason:'invalid evidence class'};
 if(record.source_title.trim().toLowerCase()!==record.title.trim().toLowerCase())return {accepted:false,reason:'source title mismatch'};
 const flags=[];
 if(record.interaction_claim&&!record.interaction_evidence)flags.push('interaction lacks evidence');
 if(record.clinical_claim&&record.evidence_class!=='human')flags.push('non-human clinical extrapolation');
 if(record.adverse_effects===undefined)flags.push('adverse effects not assessed');
 if(record.uncertainty===undefined)flags.push('uncertainty not assessed');
 return {accepted:flags.length===0,flags,review_hash:hash(record)};
}
export function transition(record,to,receipt){
 const from=record.state??'DISCOVERED',a=STATES.indexOf(from),b=STATES.indexOf(to);
 if(a<0||b!==a+1)throw Error('invalid state transition '+from+' -> '+to);
 if(!receipt?.actor||!receipt?.source_sha)throw Error('missing transition receipt');
 if(['SCIENTIFIC_REVIEWED','SEMANTIC_INTEGRATED','PUBLISHED'].includes(to)&&!receipt.independent_review)throw Error('independent review required');
 if(to==='PUBLISHED'&&!receipt.editorial_approval)throw Error('editorial approval required');
 return {...record,state:to,history:[...(record.history??[]),{from,to,receipt}]};
}
export function semanticEdges(record){
 if(record.state!=='MERGED'&&!record.state!=='SEMANTIC_INTEGRATED')throw Error('not merged');
 if(!record.compound||!Array.isArray(record.relationships))throw Error('missing semantic mapping');
 return record.relationships.map(r=>{
  if(!r.target||!r.predicate||!r.context||!r.evidence_type)throw Error('incomplete edge');
  return {subject:record.compound,predicate:r.predicate,object:r.target,context:r.context,evidence_type:r.evidence_type,source_pmid:String(record.pmid),provenance:record.provenance,uncertainty:record.uncertainty,review_hash:hash(record)};
 });
}
export function priority(r){const f=r.signals??{};return 4*(f.safety??0)+3*(f.evidence_gap??0)+2*(f.contradiction??0)+2*(f.novelty??0)+(f.graph_connectivity??0)}
export function dashboard(records){return {counts:Object.fromEntries(STATES.map(s=>[s,records.filter(r=>r.state===s).length])),blocked:records.filter(r=>r.blocker).map(r=>({pmid:r.pmid,blocker:r.blocker})),total:records.length}}
