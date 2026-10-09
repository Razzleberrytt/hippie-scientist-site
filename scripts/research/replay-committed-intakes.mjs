import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const repo=process.env.GITHUB_REPOSITORY;
const token=process.env.GITHUB_TOKEN;
const apiRoot=process.env.GITHUB_API_URL||'https://api.github.com';
if(!repo||!token)throw Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required');
const maxFiles=Number(process.env.RESEARCH_REPLAY_MAX_FILES||25);
const maxBranches=Number(process.env.RESEARCH_REPLAY_MAX_BRANCHES||500);
const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'ths-research-intake-replay'};
async function api(path){
 const response=await fetch(apiRoot+path,{headers});
 if(!response.ok){const err=new Error('GitHub '+response.status+' '+path);err.status=response.status;throw err}
 return response.json();
}
const decode=data=>Buffer.from(data.replace(/\s/g,''),'base64').toString('utf8');
async function readFile(path,ref){
 const x=await api('/repos/'+repo+'/contents/'+path+'?ref='+encodeURIComponent(ref));
 if(x.content)return JSON.parse(decode(x.content));
 if(!x.sha)throw Error('GitHub content lacks SHA '+path);
 const blob=await api('/repos/'+repo+'/git/blobs/'+x.sha);
 if(blob.encoding!=='base64')throw Error('Unsupported blob encoding '+path);
 return JSON.parse(decode(blob.content));
}
const branchList=[];
for(let page=1;branchList.length<maxBranches;page++){
 const rows=await api('/repos/'+repo+'/branches?per_page=100&page='+page);
 branchList.push(...rows);
 if(rows.length<100)break;
}
const branches=branchList.filter(b=>b.name.startsWith('research/intake/')).sort((a,b)=>a.name.localeCompare(b.name));
const registry=await readFile('ops/research-coordinator/live-registry.json','research-coordination-registry');
const seen=new Set((registry.reservations||[]).filter(r=>r.state!=='RELEASED').map(r=>String(r.pmid)));
let inspected=0,attempted=0,reserved=0,skipped=0,failed=0;
for(const branch of branches){
 if(attempted>=maxFiles)break;
 let files;
 try{files=await api('/repos/'+repo+'/contents/ops/research-intake?ref='+encodeURIComponent(branch.name))}
 catch(e){if(e.status===404)continue;throw e}
 if(!Array.isArray(files))continue;
 for(const f of files.filter(x=>x.type==='file'&&/^lane[1-5].*\.json$/.test(x.name))){
  if(attempted>=maxFiles)break;
  inspected++;
  let seed;
  try{seed=await readFile(f.path,branch.name)}catch(e){failed++;console.error('REPLAY_READ_FAILED '+f.path+' '+e.message);continue}
  if(seed.seed_only!==true||!Array.isArray(seed.pmids))continue;
  const pmids=[...new Set(seed.pmids.map(String))].filter(p=>!seen.has(p));
  if(pmids.length===0){skipped++;continue}
  if(pmids.length!==seed.pmids.length)console.log('REPLAY_PARTIAL '+f.path+' remaining='+pmids.length);
  const file='ops/research-intake/.replay-'+process.pid+'-'+attempted+'.json';
  fs.writeFileSync(file,JSON.stringify({...seed,pmids})+'\n');
  attempted++;
  try{
   const run=spawnSync(process.execPath,['scripts/research/github-reservation-controller.mjs','reserve'],{
    env:{...process.env,CANDIDATE_PATH:file},encoding:'utf8',timeout:15*60*1000,maxBuffer:4*1024*1024
   });
   if(run.status!==0){failed++;console.error('REPLAY_RESERVE_FAILED '+f.path+' '+(run.stderr||run.stdout||'').slice(-1000))}
   else{
    const match=(run.stdout||'').match(/"reserved":(\d+)/);
    const count=match?Number(match[1]):pmids.length;
    reserved+=count;pmids.forEach(p=>seen.add(p));
    console.log('REPLAY_RESERVED '+f.path+' count='+count);
   }
  }finally{fs.rmSync(file,{force:true})}
 }
}
console.log(JSON.stringify({inspected,attempted,reserved,skipped,failed,branch_count:branches.length,branch_limit_reached:branchList.length>=maxBranches}));
if(failed)process.exitCode=1;
