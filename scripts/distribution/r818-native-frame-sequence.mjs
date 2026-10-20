import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const hex=s=>/^[a-f0-9]{64}$/.test(String(s??''))
const pngSignature=Buffer.from('89504e470d0a1a0a','hex')
export function verifyR818NativeFrames(packageDir,sequence,scenes){
 if(sequence?.schemaVersion!=='ths-r818-native-frames-v1'||
    sequence.fps!==30||sequence.width!==1080||sequence.height!==1920||
    !Array.isArray(sequence.beats)||sequence.beats.length!==scenes.length)
  throw Error('R8.18 native final composition must cover ALL planned beats at actual 1080x1920 30fps')
 const root=path.resolve(packageDir),accepted=[],used=new Set()
 for(let i=0;i<scenes.length;i++){
  const plan=scenes[i],beat=sequence.beats[i]
  if(beat.beatId!==(plan.beatId||plan.id)||!Array.isArray(beat.frames))
   throw Error('R8.18 native frame beat inventory does not match voice-timed scenes')
  const expected=Math.round((Number(plan.end)-Number(plan.start))*30)
  if(expected<1||beat.frames.length!==expected||beat.frames.length>1800)
   throw Error('R8.18 native frame count does not match exact 30fps narration beat duration')
  const verified=[]
  for(let j=0;j<beat.frames.length;j++){
   const item=beat.frames[j]
   if(item.frameIndex!==j||!/^r818-frames\/[a-zA-Z0-9_-]+\/f\d{5}\.png$/.test(item.file)||
     !hex(item.sha256)||used.has(item.file))
    throw Error('R8.18 invalid/duplicate native 30fps frame reference')
   used.add(item.file)
   const file=path.resolve(root,item.file)
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file))
    throw Error('R8.18 native frame is missing or outside package')
   const bytes=fs.readFileSync(file)
   if(bytes.length<100||!bytes.subarray(0,8).equals(pngSignature)||
      bytes.readUInt32BE(16)!==1080||bytes.readUInt32BE(20)!==1920||sha(bytes)!==item.sha256)
    throw Error('R8.18 incorrect 1080p PNG dimensions or mutated frame pixels')
   verified.push({frameIndex:j,file:item.file,sha256:item.sha256})
  }
  accepted.push({beatId:beat.beatId,frames:verified})
 }
 return {status:'NATIVE_30FPS_PIXELS_VERIFIED',beats:accepted,frameCount:accepted.reduce((s,b)=>s+b.frames.length,0),
  fullSequenceSha256:sha(JSON.stringify(sequence)),onlyNativeCompositedFrames:true}
}
