// Research-only reservation and rolling batch coordinator. Node 20+, no dependencies.
// Usage: node scripts/research/rolling-coordinator.mjs check <snapshot.json>
//        node scripts/research/rolling-coordinator.mjs reserve <snapshot.json> <lane> <batch> <records.json>
//        node scripts/research/rolling-coordinator.mjs freeze <snapshot.json> <batch> <out.json>
// Snapshot is a single-writer artifact: serialize writes through one CI coordinator job.
// Do not allow five independent jobs to write the snapshot concurrently.
import fs from 'node:fs';
import crypto from 'node:crypto';
const normalize = s => String(s??'').normalize('NFKC').toLowerCase().replace(/[^\\p{L}\\p{N}]+/gu,' ').trim().replace(/\\s+/g,' ');
const doi = s => normalize(String(s??'').replace(/^https?:\\/\\/(dx\\.)?doi\\.org\\//i,'').replace(/^doi:\\s*/i,''));
const keys = r => {
  if(!/^\\d+$/.test(String(r.pmid??''))) throw Error('missing/invalid PMID');
  if(!normalize(r.title)) throw Error('missing title');
  return ['pmid:'+r.pmid,'title:'+normalize(r.title),...(r.doi?['doi:'+doi(r.doi)]:[])];
};
const read = p => JSON.parse(fs.readFileSync(p,'utf8'));
const write = (p,v) => {const temp=p+'.tmp-'+process.pid;fs.writeFileSync(temp,JSON.stringify(v,null,2)+'\\n',{flag:'wx'});fs.renameSync(temp,p)};
export function validateSnapshot(s) {
  if(!Array.isArray(s.baseline)||!Array.isArray(s.reservations))throw Error('invalid snapshot');
  const seen=new Map();
  for(const r of [...s.baseline,...s.reservations]){
    for(const k of keys(r)){if(seen.has(k))throw Error('collision '+k+' between '+seen.get(k)+' and '+(r.batch??'baseline'));seen.set(k,r.batch??'baseline')}
  }
  return seen;
}
export function reserve(s,lane,batch,records){
  if(!/^([1-5])$/.test(String(lane)))throw Error('lane must be 1..5');
  if(!batch||s.reservations.some(r=>r.batch===batch))throw Error('batch already reserved');
  if(!Array.isArray(records)||records.length<1||records.length>25)throw Error('reserve 1..25 records');
  const seen=validateSnapshot(s);
  for(const r of records)for(const k of keys(r)){if(seen.has(k))throw Error('collision '+k);seen.set(k,batch)}
  const stamp=new Date().toISOString();
  s.reservations.push(...records.map(r=>({...r,lane:String(lane),batch,state:'RESERVED',reserved_at:stamp})));
  return s;
}
export function freeze(s,batch){
  validateSnapshot(s);
  const rows=s.reservations.filter(r=>r.batch===batch);
  if(rows.length!==500)throw Error('freeze requires exactly 500 unique records; got '+rows.length);
  if(rows.some(r=>r.state!=='VERIFIED'||!r.source_title||!r.abstract||!r.evidence_class||!r.provenance))throw Error('unverified records');
  const hash=crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex');
  return {schema_version:1,batch,records:500,sha256:hash,research_only:true,clinical_admission:false,rows};
}
if(process.argv[1]?.endsWith('rolling-coordinator.mjs')){
 const [cmd,path,a,b,c]=process.argv.slice(2);
 try{
  const s=read(path);if(cmd==='check'){validateSnapshot(s);console.log('PASS '+s.baseline.length+' baseline '+s.reservations.length+' reserved')}
  else if(cmd==='reserve'){reserve(s,a,b,read(c));write(path,s);console.log('RESERVED '+b)}
  else if(cmd==='freeze'){write(b,freeze(s,a));console.log('FROZEN '+a)}
  else throw Error('unknown command');
 }catch(e){console.error('BLOCKED '+e.message);process.exitCode=1}
}
