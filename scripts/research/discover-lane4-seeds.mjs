/**
 * GitHub-native, bounded Lane 4 PMID discovery. Identity is reverified by the
 * existing PubMed hydrator and global reservation controller; no publication.
 */
import fs from 'node:fs'
const token=process.env.GITHUB_TOKEN
const repo=process.env.GITHUB_REPOSITORY
if(!token||!repo)throw Error('Missing GitHub context')
const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}
async function json(url,options={}){
 const response=await fetch(url,{...options,signal:AbortSignal.timeout(30000)})
 if(!response.ok)throw Error('HTTP '+response.status+' '+new URL(url).pathname)
 return response.json()
}
const registryMeta=await json('https://api.github.com/repos/'+repo+'/contents/ops/research-coordinator/live-registry.json?ref=research-coordination-registry',{headers})
if(!registryMeta.sha)throw Error('Missing registry SHA; fail closed')
const blob=registryMeta.encoding==='base64'&&registryMeta.content
 ?registryMeta:await json('https://api.github.com/repos/'+repo+'/git/blobs/'+registryMeta.sha,{headers})
if(blob.encoding!=='base64'||!blob.content)throw Error('Cannot decode registry')
const registry=JSON.parse(Buffer.from(blob.content.replace(/\s/g,''),'base64').toString('utf8'))
if(!Array.isArray(registry.reservations))throw Error('Invalid reservation registry')
const occupied=new Set(registry.reservations.filter(r=>r.state!=='RELEASED').map(r=>String(r.pmid)))
const terms='(opioid withdrawal OR fentanyl dependence OR nitazene OR xylazine OR medetomidine) AND (2025:2026[dp])'
const params=new URLSearchParams({db:'pubmed',term:terms,retmode:'json',retmax:'40',sort:'pub date'})
const search=await json('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?'+params)
const candidates=(search.esearchresult?.idlist||[]).filter(p=>/^\d{5,10}$/.test(p)&&!occupied.has(p)).slice(0,2)
if(!candidates.length){console.log('NO_NEW_PMIDS');process.exit(0)}
const name='lane4-'+new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)+'-native-seed.json'
const path='ops/research-intake/'+name
const seed={schema_version:1,seed_only:true,lane:4,lane_focus:'withdrawal-dependence-nps',research_only:true,pmids:candidates,relevance_reason:'PubMed discovery seeds; source identity and global DOI/title collisions require controller verification; no clinical claims.'}
fs.writeFileSync(path,JSON.stringify(seed,null,2)+'\n',{flag:'wx'})
console.log('SEED_PATH='+path)
console.log('CANDIDATES='+candidates.length)
