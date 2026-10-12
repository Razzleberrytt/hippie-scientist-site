import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const sha=v=>crypto.createHash('sha256').update(v).digest('hex')
const hex=v=>/^[a-f0-9]{64}$/.test(String(v??''))
export function r818FrameRecipeKey(recipe){
 const r=recipe??{}
 for(const k of ['rendererCodeSha256','sceneAssetSha256','approvedPlanSha256','voiceTimingSha256'])
  if(!hex(r[k]))throw Error('R8.18 resumable frame cache needs SHA-bound '+k)
 if(!Number.isInteger(r.width)||r.width<1||!Number.isInteger(r.height)||r.height<1||
    r.fps!==30||!Number.isInteger(r.frameCount)||r.frameCount<1||r.frameCount>1800)
  throw Error('R8.18 cache cannot accept invalid, low-resolution or unlimited render')
 return sha(JSON.stringify({schema:'r818-frame-cache-v1',...r}))
}
export async function r818RenderResumableFrames({recipe,cacheRoot,renderFrame}){
 if(typeof renderFrame!=='function'||!cacheRoot)throw Error('R8.18 needs locally implemented native renderer callback and cache directory')
 const key=r818FrameRecipeKey(recipe),dir=path.join(path.resolve(cacheRoot),key)
 fs.mkdirSync(dir,{recursive:true})
 const receiptPath=path.join(dir,'frames.receipt.json')
 let known={}
 if(fs.existsSync(receiptPath)){
  const old=JSON.parse(fs.readFileSync(receiptPath,'utf8'))
  if(old.key!==key||old.expectedFrames!==recipe.frameCount||old.recipeSha256!==sha(JSON.stringify(recipe)))
   throw Error('R8.18 stale cache receipt does not match approved recipe')
  known=Object.fromEntries(old.frames.map(item=>[item.frameIndex,item]))
 }
 const frames=[];let reused=0,rendered=0
 for(let i=0;i<recipe.frameCount;i++){
  const file=path.join(dir,'frame-'+String(i).padStart(5,'0')+'.png')
  let bytes=null
  const entry=known[i]
  if(entry&&fs.existsSync(file)){
   const prior=fs.readFileSync(file)
   if(sha(prior)===entry.sha256&&prior.length===entry.bytes&&prior.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))){
    bytes=prior;reused++
   }
  }
  if(!bytes){
   const fresh=await renderFrame({frameIndex:i,seconds:i/recipe.fps,outputWidth:recipe.width,outputHeight:recipe.height})
   if(!Buffer.isBuffer(fresh)||fresh.length<100||
      !fresh.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')))
    throw Error('R8.18 native render did not return actual PNG pixels for frame '+i)
   const temp=file+'.incomplete'
   fs.writeFileSync(temp,fresh);fs.renameSync(temp,file)
   bytes=fresh;rendered++
  }
  frames.push({frameIndex:i,file:path.basename(file),bytes:bytes.length,sha256:sha(bytes)})
  const record={schemaVersion:'ths-r818-cache-v1',key,recipeSha256:sha(JSON.stringify(recipe)),
    expectedFrames:recipe.frameCount,frames,status:i+1===recipe.frameCount?'complete':'checkpoint'}
  const part=receiptPath+'.tmp'
  fs.writeFileSync(part,JSON.stringify(record,null,2)+'\n')
  fs.renameSync(part,receiptPath)
 }
 return {directory:dir,key,expectedFrames:recipe.frameCount,reused,rendered,
    receiptSha256:sha(fs.readFileSync(receiptPath)),frames}
}
export function assertR818FrameSequenceReceipt(receipt,recipe){
 if(!receipt||receipt.key!==r818FrameRecipeKey(recipe)||
    receipt.expectedFrames!==recipe.frameCount||
    receipt.frames?.length!==recipe.frameCount||receipt.status!=='complete'||
    receipt.frames.some((f,i)=>f.frameIndex!==i||!hex(f.sha256)))
  throw Error('R8.18 cinematic sequence missing complete content-addressed frame evidence')
 return true
}
