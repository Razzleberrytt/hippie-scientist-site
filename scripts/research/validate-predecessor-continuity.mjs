import fs from 'node:fs';import path from 'node:path';
const DIR='ops/enrichment-submissions/reconciliation',API=process.env.GITHUB_API_URL||'https://api.github.com';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifests=fs.readdirSync(DIR).filter(n=>n.endsWith('-final-manifest.json')).flatMap(name=>{try{const m=read(path.join(DIR,name));return m?.state==='source_verified_independent_semantic_review_pending'?[{name,m}]:[]}catch{return[]}});
const withDeps=manifests.filter(x=>(x.m.predecessor_snapshots||[]).length);
if(!withDeps.length){console.log('PASS: no pending predecessor snapshots on this head');process.exit(0)}
const repo=process.env.GITHUB_REPOSITORY,token=process.env.GITHUB_TOKEN;
if(!repo||!token)throw Error('GITHUB_REPOSITORY and GITHUB_TOKEN required for predecessor validation');
async function api(url){const r=await fetch(API+url,{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'ths-research-predecessor-gate'}});if(!r.ok)throw Error('GitHub '+url+' failed '+r.status+': '+(await r.text()).slice(0,500));return r.json()}
for(const {name,m} of withDeps){
 for(const dep of m.predecessor_snapshots){
  const pr=await api('/repos/'+repo+'/pulls/'+dep.pr_number);
  if(pr.merged!==true)throw Error(name+': predecessor PR #'+dep.pr_number+' is not merged');
  if(pr.head?.sha!==dep.head_sha)throw Error(name+': predecessor PR #'+dep.pr_number+' head changed from frozen snapshot');
  const title=String(pr.title||''),match=title.match(/waves\s+(\d+)[–-](\d+)/i);
  if(!match||Number(match[1])!==Number(dep.wave_start)||Number(match[2])!==Number(dep.wave_end))throw Error(name+': predecessor wave identity changed for PR #'+dep.pr_number);
  const comparison=await api('/repos/'+repo+'/compare/'+dep.head_sha+'...main');
  if(!['ahead','identical'].includes(comparison.status))throw Error(name+': main does not contain predecessor head '+dep.head_sha);
  console.log('PASS predecessor #'+dep.pr_number+' '+dep.wave_start+'-'+dep.wave_end+' @ '+dep.head_sha.slice(0,12));
 }
}
