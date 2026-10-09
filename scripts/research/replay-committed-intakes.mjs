/**
 * Bounded recovery for committed research/intake/* PMID seed manifests missed by
 * push triggers. Reuses the existing global reservation controller exclusively.
 * Research-only: no evidence review, publishing or clinical promotion authority.
 */
import fs from 'node:fs'
import {spawnSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {resolve} from 'node:path'

const PREFIX='ops/research-intake/'
const BRANCH_PREFIX='research/intake/'
const VALID_PMID=/^\d{5,10}$/
const VALID_SEED=/^lane[1-5][\w.-]*\.json$/

export function selectReplaySeed(seed,occupied=new Set()){
  if(!seed||seed.seed_only!==true)return {state:'not-pmid-seed',pmids:[]}
  if(!Array.isArray(seed.pmids)||seed.pmids.length<1||seed.pmids.length>25)
    throw Error('seed must contain 1..25 PMIDs')
  if(!Number.isInteger(Number(seed.lane))||Number(seed.lane)<1||Number(seed.lane)>5)
    throw Error('seed lane must be 1..5')
  const pmids=seed.pmids.map(String)
  if(pmids.some(p=>!VALID_PMID.test(p)))throw Error('seed has invalid PMID identity')
  if(new Set(pmids).size!==pmids.length)throw Error('seed contains duplicate PMIDs')
  const remaining=pmids.filter(p=>!occupied.has(p))
  if(remaining.length===0)return {state:'already-reserved',pmids:[]}
  // Never alter a source-authored batch silently: a partial overlap may also
  // mean another active lane owns source provenance. Review/reseed explicitly.
  if(remaining.length!==pmids.length)return {state:'partial-reservation-hold',pmids:remaining}
  return {state:'ready',pmids}
}

export function parseReservationReceipt(stdout,expectedCount){
  const lines=String(stdout||'').split(/\r?\n/).reverse()
  for(const line of lines){
    let payload
    try{payload=JSON.parse(line)}catch{continue}
    if(payload&&Number.isInteger(payload.reserved)&&
       payload.reserved===expectedCount && Array.isArray(payload.batches) &&
       Number.isInteger(Number(payload.lane)))return payload
    if(payload&&Object.hasOwn(payload,'reserved'))
      throw Error('reservation controller returned an invalid or partial receipt')
  }
  throw Error('reservation controller returned no exact reservation receipt')
}

const requireInteger=(name,def,min,max)=>{
  const n=Number(process.env[name]??def)
  if(!Number.isInteger(n)||n<min||n>max)throw Error(name+' outside '+min+'..'+max)
  return n
}

export async function runReplay(){
  const repo=process.env.GITHUB_REPOSITORY
  const token=process.env.GITHUB_TOKEN
  if(!repo||!token||!/^[-\w.]+\/[-\w.]+$/.test(repo))
    throw Error('GitHub reservation recovery requires authorized repository/token')
  const maxFiles=requireInteger('RESEARCH_REPLAY_MAX_FILES',1,1,5)
  const maxBranches=requireInteger('RESEARCH_REPLAY_MAX_BRANCHES',500,1,500)
  const root=process.env.GITHUB_API_URL||'https://api.github.com'
  const headers={
    Authorization:'Bearer '+token,Accept:'application/vnd.github+json',
    'X-GitHub-Api-Version':'2022-11-28','User-Agent':'ths-research-intake-replay',
  }
  async function api(path){
    const response=await fetch(root+path,{headers,signal:AbortSignal.timeout(30000)})
    if(!response.ok){const err=new Error('GitHub '+response.status+' '+path);err.status=response.status;throw err}
    return response.json()
  }
  const decode=value=>Buffer.from(value.replace(/\s/g,''),'base64').toString('utf8')
  async function readJson(path,ref){
    const entry=await api('/repos/'+repo+'/contents/'+path+'?ref='+encodeURIComponent(ref))
    if(typeof entry?.content==='string')return JSON.parse(decode(entry.content))
    if(!/^[a-f0-9]{40}$/.test(entry?.sha||''))throw Error('Missing pinned blob identity: '+path)
    const blob=await api('/repos/'+repo+'/git/blobs/'+entry.sha)
    if(blob?.encoding!=='base64'||typeof blob.content!=='string')
      throw Error('Unsupported encoded blob: '+path)
    return JSON.parse(decode(blob.content))
  }
  const all=[]
  for(let page=1;all.length<maxBranches;page++){
    const rows=await api('/repos/'+repo+'/branches?per_page=100&page='+page)
    if(!Array.isArray(rows))throw Error('Invalid GitHub branch response')
    all.push(...rows)
    if(rows.length<100)break
  }
  // A truncated page can permanently starve later branches. Fail closed.
  if(all.length>=maxBranches)throw Error('Branch scan cap reached; widen scoped review before replay')
  const branches=all.filter(b=>b.name?.startsWith(BRANCH_PREFIX)&&
    /^[a-f0-9]{40}$/.test(b.commit?.sha||''))
    .sort((a,b)=>a.name.localeCompare(b.name))
  const registry=await readJson('ops/research-coordinator/live-registry.json','research-coordination-registry')
  if(!Array.isArray(registry?.reservations))throw Error('Live reservation registry unavailable')
  const seen=new Set(registry.reservations.filter(r=>r.state!=='RELEASED').map(r=>String(r.pmid)))
  const result={inspected:0,attempted:0,reserved:0,skipped:0,held:0,failed:0,branchCount:branches.length}
  for(const branch of branches){
    if(result.attempted>=maxFiles)break
    let files
    try{
      files=await api('/repos/'+repo+'/contents/'+PREFIX.replace(/\/$/,'')+'?ref='+encodeURIComponent(branch.commit.sha))
    }catch(e){if(e.status===404)continue;throw e}
    if(!Array.isArray(files))throw Error('Unexpected intake directory response for '+branch.name)
    const candidates=files.filter(f=>f.type==='file'&&VALID_SEED.test(f.name||'')&&
      f.path===PREFIX+f.name).sort((a,b)=>a.name.localeCompare(b.name))
    for(const entry of candidates){
      if(result.attempted>=maxFiles)break
      result.inspected++
      let seed,selection
      try{
        seed=await readJson(entry.path,branch.commit.sha)
        selection=selectReplaySeed(seed,seen)
      }catch(error){
        result.failed++;console.error('REPLAY_SOURCE_BLOCKED '+branch.name+' '+entry.name+' '+error.message)
        continue
      }
      if(selection.state==='not-pmid-seed'||selection.state==='already-reserved'){result.skipped++;continue}
      if(selection.state!=='ready'){
        result.held++
        console.warn('REPLAY_PARTIAL_HELD '+branch.name+' '+entry.name+' remaining='+selection.pmids.length)
        continue
      }
      const local=PREFIX+'.replay-'+process.pid+'-'+result.attempted+'.json'
      result.attempted++
      try{
        fs.writeFileSync(local,JSON.stringify({...seed,pmids:selection.pmids})+'\n',{flag:'wx'})
        const cmd=spawnSync(process.execPath,['scripts/research/github-reservation-controller.mjs','reserve'],{
          env:{...process.env,CANDIDATE_PATH:local},
          encoding:'utf8',timeout:15*60*1000,maxBuffer:4*1024*1024,
        })
        if(cmd.error||cmd.status!==0)throw Error(
          'reserve failed: '+(cmd.error?.message||String(cmd.stderr||cmd.stdout).slice(-800)))
        const receipt=parseReservationReceipt(cmd.stdout,selection.pmids.length)
        result.reserved+=receipt.reserved
        for(const pmid of selection.pmids)seen.add(pmid)
        console.log('REPLAY_RESERVED '+branch.name+' '+entry.name+' count='+receipt.reserved)
      }catch(error){
        result.failed++
        console.error('REPLAY_RESERVE_BLOCKED '+branch.name+' '+entry.name+' '+error.message)
      }finally{
        fs.rmSync(local,{force:true})
      }
    }
  }
  console.log(JSON.stringify(result))
  if(result.failed||result.held)process.exitCode=1
  return result
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  runReplay().catch(error=>{console.error('REPLAY_BLOCKED '+error.message);process.exitCode=1})
}
