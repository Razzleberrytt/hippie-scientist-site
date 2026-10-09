/**
 * GitHub-native, bounded Lane 4 PubMed source discovery. Research-only seeds
 * are hydrated and reserved by the existing globally serialized controller.
 */
import fs from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {readGithubContent} from './github-reservation-controller.mjs'

const ROOT='https://api.github.com'
const VALID_PMID=/^\d{5,10}$/
export const LANE4_QUERY='(opioid withdrawal OR fentanyl dependence OR nitazene OR xylazine OR medetomidine) AND (2025:2026[dp])'

export function selectLane4Candidates(result,reservations,limit=2){
  if(!Number.isInteger(limit)||limit<1||limit>2)throw Error('Lane 4 discovery cap must be 1..2')
  if(!Array.isArray(reservations))throw Error('Canonical reservation list missing')
  if(!result||!Array.isArray(result.idlist))throw Error('Malformed PubMed ESearch response')
  const occupied=new Set()
  for(const r of reservations){
    const id=String(r?.pmid??'')
    if(!VALID_PMID.test(id))throw Error('Invalid PMID in canonical reservations')
    if(r.state!=='RELEASED')occupied.add(id)
  }
  const seen=new Set()
  const picked=[]
  for(const value of result.idlist){
    const id=String(value)
    if(!VALID_PMID.test(id))throw Error('Malformed PMID returned by PubMed')
    if(seen.has(id))continue
    seen.add(id)
    if(!occupied.has(id))picked.push(id)
    if(picked.length>=limit)break
  }
  return picked
}

export function createLane4Seed(pmids){
  if(!Array.isArray(pmids)||pmids.length<1||pmids.length>2||
     pmids.some(p=>typeof p!=='string'||!VALID_PMID.test(p))||
     new Set(pmids).size!==pmids.length)throw Error('Invalid source-only Lane 4 seed')
  return {
    schema_version:1,seed_only:true,lane:4,
    lane_focus:'withdrawal-dependence-nps',research_only:true,
    pmids,
    relevance_reason:'PubMed identity-only source candidates; independent semantic review, clinical interpretation, DOI/title deduplication and source hydration remain under existing governance.'
  }
}

export async function discoverLane4({repo,token,fetchImpl=fetch}={}){
  if(!/^[\w.-]+\/[\w.-]+$/.test(String(repo||''))||!token)throw Error('Missing authorized GitHub repository/token')
  const headers={
    Authorization:'Bearer '+token,Accept:'application/vnd.github+json',
    'X-GitHub-Api-Version':'2022-11-28','User-Agent':'ths-lane4-source-identity'
  }
  async function github(path){
    const response=await fetchImpl(ROOT+path,{headers,signal:AbortSignal.timeout(30000)})
    if(!response.ok)throw Error('GitHub '+response.status+' '+path)
    return response.json()
  }
  const meta=await github('/repos/'+repo+'/contents/ops/research-coordinator/live-registry.json?ref=research-coordination-registry')
  // GitHub Contents omits inline base64 beyond 1 MiB. Pin fallback to its
  // exact blob SHA. Never infer an empty registry from missing inline bytes.
  const registryText=await readGithubContent(meta,sha=>github('/repos/'+repo+'/git/blobs/'+sha))
  let registry
  try{registry=JSON.parse(registryText)}catch(e){throw Error('Pinned registry JSON invalid: '+e.message)}
  if(registry?.schema_version!==1||!Array.isArray(registry.reservations)||!Array.isArray(registry.batches))
    throw Error('Canonical reservation registry invalid')
  const params=new URLSearchParams({db:'pubmed',term:LANE4_QUERY,retmode:'json',retmax:'40',sort:'pub date'})
  const response=await fetchImpl('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?'+params,{
    headers:{'User-Agent':'ths-lane4-source-identity/1.0'},signal:AbortSignal.timeout(30000)
  })
  if(!response.ok)throw Error('PubMed ESearch HTTP '+response.status)
  const result=await response.json()
  const pmids=selectLane4Candidates(result?.esearchresult,registry.reservations)
  return pmids.length?{state:'candidates',seed:createLane4Seed(pmids)}:{state:'no-new-pmids'}
}

async function main(){
  const result=await discoverLane4({repo:process.env.GITHUB_REPOSITORY,token:process.env.GITHUB_TOKEN})
  if(result.state==='no-new-pmids'){
    console.log('NO_NEW_PMIDS; no reservation requested')
    return
  }
  const stamp=new Date().toISOString().replace(/\D/g,'').slice(0,14)
  const runId=String(process.env.GITHUB_RUN_ID||process.pid)
  if(!/^\d+$/.test(runId))throw Error('Invalid run identity')
  const path='ops/research-intake/lane4-'+stamp+'-'+runId+'-native-seed.json'
  fs.writeFileSync(path,JSON.stringify(result.seed,null,2)+'\n',{flag:'wx'})
  console.log('SEED_PATH='+path)
  console.log('CANDIDATES='+result.seed.pmids.length+' (source-only; no clinical approval)')
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  main().catch(error=>{console.error('LANE4_DISCOVERY_BLOCKED '+error.message);process.exitCode=1})
}
