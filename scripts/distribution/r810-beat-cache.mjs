import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const sha=(x)=>crypto.createHash('sha256').update(x).digest('hex')
const safeHex=/^[a-f0-9]{64}$/
export function r810BeatCacheKey(inputs) {
  // Include exact source bytes, not just a human version label.
  const required=['rendererCodeSha256','sourceContentHash','creativeBriefSha256','sceneReceiptSha256']
  if(required.some(k=>!String(inputs?.[k]||'').trim()))throw Error('R8.10 beat cache lacks exact input authority')
  if(!safeHex.test(inputs.rendererCodeSha256)||!safeHex.test(inputs.creativeBriefSha256)||!safeHex.test(inputs.sceneReceiptSha256)){
    throw Error('R8.10 beat cache inputs require content-addressed SHA-256')
  }
  return sha(JSON.stringify({...inputs,cacheFormat:'ths-r810-beat-cache-v1'}))
}
export function cachedR810BeatSvg(cacheRoot,inputs,render) {
  const key=r810BeatCacheKey(inputs)
  const dir=path.resolve(cacheRoot)
  const file=path.join(dir,key+'.svg'),meta=path.join(dir,key+'.json')
  if(fs.existsSync(file)||fs.existsSync(meta)){
    if(!fs.existsSync(file)||!fs.existsSync(meta))throw Error('R8.10 beat cache incomplete; refuse stale intermediate')
    const content=fs.readFileSync(file,'utf8')
    const metadata=JSON.parse(fs.readFileSync(meta,'utf8'))
    if(metadata.schemaVersion!=='ths-r810-beat-cache-v1'||metadata.key!==key||
      metadata.svgSha256!==sha(content))throw Error('R8.10 beat cache corrupted; refuse stale intermediate')
    return {svg:content,cacheHit:true,key,sha256:sha(content)}
  }
  const svg=String(render())
  if(!svg.startsWith('<svg')||!svg.includes('</svg>'))throw Error('R8.10 beat cache renderer did not return SVG')
  const metadata={schemaVersion:'ths-r810-beat-cache-v1',key,svgSha256:sha(svg),inputHashes:inputs}
  fs.mkdirSync(dir,{recursive:true})
  const suffix='.'+process.pid+'-'+crypto.randomBytes(6).toString('hex')+'.tmp'
  const svgTemp=file+suffix,jsonTemp=meta+suffix
  try{
    fs.writeFileSync(svgTemp,svg,{flag:'wx'})
    fs.writeFileSync(jsonTemp,JSON.stringify(metadata,null,2)+'\n',{flag:'wx'})
    fs.renameSync(svgTemp,file)
    fs.renameSync(jsonTemp,meta)
  }finally{
    for(const tmp of [svgTemp,jsonTemp])if(fs.existsSync(tmp))fs.unlinkSync(tmp)
  }
  return {svg,cacheHit:false,key,sha256:sha(svg)}
}
export function pruneR810BeatCache(cacheRoot,{maxAgeDays=30,maxBytes=2*1024*1024*1024,now=Date.now()}={}){
  if(!Number.isFinite(maxAgeDays)||maxAgeDays<1||!Number.isFinite(maxBytes)||maxBytes<1)throw Error('R8.10 cache prune needs positive limits')
  const dir=path.resolve(cacheRoot)
  if(!fs.existsSync(dir))return {removed:0,bytesAfter:0}
  const files=fs.readdirSync(dir).filter(x=>safeHex.test(x.slice(0,64))&&/^[a-f0-9]{64}\.(?:svg|json)$/.test(x))
  const entries=[]
  for(const name of files.filter(x=>x.endsWith('.svg'))){
    const key=name.slice(0,64),svgPath=path.join(dir,name),metaPath=path.join(dir,key+'.json')
    if(!fs.existsSync(metaPath))throw Error('R8.10 cache orphaned asset; explicit repair required')
    const stats=fs.statSync(svgPath),ms=stats.mtimeMs,bytes=stats.size+fs.statSync(metaPath).size
    entries.push({key,svgPath,metaPath,ms,bytes})
  }
  entries.sort((a,b)=>b.ms-a.ms)
  let total=entries.reduce((sum,x)=>sum+x.bytes,0),removed=0
  for(const entry of entries.slice().reverse()){
    if(now-entry.ms>maxAgeDays*86400000||total>maxBytes){
      for(const f of [entry.svgPath,entry.metaPath])fs.unlinkSync(f)
      total-=entry.bytes
      removed++
    }
  }
  return {removed,bytesAfter:total,kept:entries.length-removed}
}
export const defaultR810CacheRoot=()=>path.join(process.cwd(),'ops/evidencemotion/.cache/beat-svg')
