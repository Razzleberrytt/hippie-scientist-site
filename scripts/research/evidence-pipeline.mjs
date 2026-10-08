import crypto from 'node:crypto';
export const LANES={1:'sleep-stress-mood',2:'cognition-metabolic',3:'botanical-pharmacology-safety',4:'withdrawal-dependence-nps',5:'contradictions-replication'};
export const STATES=['DISCOVERED','SOURCE_VERIFIED','SCIENTIFIC_REVIEWED','RESERVED','STAGED','MERGED','SEMANTIC_INTEGRATED','PUBLISHED'];
const EVIDENCE_CLASSES=new Set(['human','animal','in-vitro','mixed','review']);
const CONCLUSIONS=new Set(['positive','negative','null','mixed','not_applicable']);
const INTERACTION_LEVELS=new Set(['none','mechanistic','preclinical','human_pk','clinical_signal','clinical_outcome']);
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const present=v=>v!==undefined&&v!==null&&v!==''&&(!Array.isArray(v)||v.length>0);
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();

export function scientificStages(record){
 const sourceIdentity=Boolean(/^\d{5,10}$/.test(String(record.pmid??''))&&present(record.title)&&present(record.source_title)&&norm(record.title)===norm(record.source_title)&&present(record.source_url)&&present(record.abstract));
 const relevance=Boolean(present(record.category)&&String(record.relevance_reason??'').trim().length>=12);
 const classification=Boolean(EVIDENCE_CLASSES.has(record.evidence_class)&&present(record.study_design)&&present(record.study_details)&&present(record.population)&&present(record.intervention)&&Array.isArray(record.outcomes)&&record.outcomes.length>0);
 const safety=Boolean(present(record.adverse_effects)&&present(record.interactions)&&present(record.limitations)&&present(record.uncertainty));
 const semantics=Boolean(CONCLUSIONS.has(record.conclusion_direction)&&INTERACTION_LEVELS.has(record.interaction_evidence_level));
 return {source_identity:sourceIdentity,relevance_screen:relevance,study_classification:classification,safety_characterization:safety,semantic_extraction:semantics};
}

export function adversarialReview(record){
 const flags=[];
 if(record.clinical_claim&&record.evidence_class!=='human')flags.push('non-human clinical extrapolation');
 if(record.causal_claim&&/observational|cross-sectional|case-control|cohort/i.test(String(record.study_design)))flags.push('causal language from observational design');
 if(record.positive_claim&&record.conclusion_direction==='null')flags.push('positive claim conflicts with null result');
 if(record.single_ingredient_claim&&/[+,]|\band\b/i.test(String(record.intervention)))flags.push('single-ingredient attribution from combined intervention');
 if(record.interaction_claim&&['none','mechanistic','preclinical'].includes(record.interaction_evidence_level)&&/clinical|clinically|contraindicat/i.test(String(record.interaction_claim)))flags.push('clinical interaction language exceeds interaction evidence');
 if(record.evidence_class==='review'&&record.study_details?.primary_data===true)flags.push('review misclassified as primary study');
 return flags;
}

export function review(record){
 const required=['pmid','title','abstract','source_title','source_url','category','relevance_reason','evidence_class','study_design','study_details','population','intervention','outcomes','conclusion_direction','interaction_evidence_level','adverse_effects','interactions','limitations','uncertainty','provenance','signals'];
 const missing=required.filter(k=>!present(record[k]));
 if(missing.length)return {accepted:false,reason:'missing '+missing.join(', '),stages:scientificStages(record),flags:[]};
 const stages=scientificStages(record),failed=Object.entries(stages).filter(([,ok])=>!ok).map(([name])=>name);
 if(failed.length)return {accepted:false,reason:'failed '+failed.join(', '),stages,flags:[]};
 const flags=adversarialReview(record);
 return {accepted:flags.length===0,flags,stages,review_hash:hash(record)};
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
 if(record.state!=='MERGED'&&record.state!=='SEMANTIC_INTEGRATED')throw Error('not merged');
 if(!record.compound||!Array.isArray(record.relationships))throw Error('missing semantic mapping');
 return record.relationships.map(r=>{
  if(!r.target||!r.predicate||!r.context||!r.evidence_type)throw Error('incomplete edge');
  return {subject:record.compound,predicate:r.predicate,object:r.target,context:r.context,evidence_type:r.evidence_type,source_pmid:String(record.pmid),provenance:record.provenance,uncertainty:record.uncertainty,review_hash:hash(record)};
 });
}
export function priority(r){const f=r.signals??{};return 4*(f.safety??0)+3*(f.evidence_gap??0)+2*(f.contradiction??0)+2*(f.novelty??0)+(f.graph_connectivity??0)}
export function dashboard(records){return {counts:Object.fromEntries(STATES.map(s=>[s,records.filter(r=>r.state===s).length])),blocked:records.filter(r=>r.blocker).map(r=>({pmid:r.pmid,blocker:r.blocker})),total:records.length}}
