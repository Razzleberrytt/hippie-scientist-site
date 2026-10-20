import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {verifyR819LayerInventory} from './r819-native-layer-compositor.mjs'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const PNG=Buffer.from('89504e470d0a1a0a','hex')
function pinnedPng(root,file){
 const pathToPng=path.resolve(root,file)
 if(!pathToPng.startsWith(root+path.sep)||!fs.existsSync(pathToPng)||
  !fs.statSync(pathToPng).isFile()||!fs.realpathSync(pathToPng).startsWith(root+path.sep))
  throw Error('R8.19 source layer missing, escaping root or symlink to outside')
 const bytes=fs.readFileSync(pathToPng)
 if(bytes.length<100||bytes.length>16000000||!bytes.subarray(0,8).equals(PNG)||
   bytes.readUInt32BE(16)!==1080||bytes.readUInt32BE(20)!==1920)
  throw Error('R8.19 source layer must be valid bounded 1080x1920 PNG')
 return {file,sha256:sha(bytes)}
}
// Inventory emission is opt-in and CREATE-ONLY: no silent mutation of a pinned
// timeline, subtitle, trust object or already approved layer inventory.
export function authorR819LayerInventory(packageDir,nativeSequence){
 const root=path.resolve(packageDir)
 if(!Array.isArray(nativeSequence?.beats)||!nativeSequence.beats.length||
   nativeSequence.frameCount!==nativeSequence.beats.reduce((s,b)=>s+b.frames.length,0))
  throw Error('R8.19 verified R8.18 native scene/frame inventory required')
 const target=path.join(root,'r819-layer-sequence.json')
 if(fs.existsSync(target))throw Error('R8.19 previously pinned layer inventory cannot be overwritten')
 const beats=nativeSequence.beats.map(beat=>{
  if(!/^[a-zA-Z0-9_-]+$/.test(beat.beatId)||!beat.frames?.length||beat.frames.length>1800)
   throw Error('R8.19 unexpected beat ID/native frame count')
  const art=pinnedPng(root,'r819-layers/'+beat.beatId+'/art-base.png')
  return {beatId:beat.beatId,frames:beat.frames.map((frame,index)=>{
   if(frame.frameIndex!==index)throw Error('R8.19 native frame sequence is not contiguous')
   const prefix='r819-layers/'+beat.beatId+'/f'+String(index).padStart(5,'0')
   return {frameIndex:index,layers:{art,
     mechanism:pinnedPng(root,prefix+'-mechanism.png'),
     trust:pinnedPng(root,prefix+'-trust.png')}}
  })}
 })
 const sequence={schemaVersion:'ths-r819-layer-sequence-v1',
   layerOrder:['art','mechanism','trust'],width:1080,height:1920,fps:30,beats}
 const bytes=Buffer.from(JSON.stringify(sequence,null,2)+'\n')
 fs.writeFileSync(target,bytes,{flag:'wx'})
 const metadata={file:'r819-layer-sequence.json',sha256:sha(bytes)}
 // Immediately read back every pin, ref and byte via the independent verifier.
 verifyR819LayerInventory(root,metadata,nativeSequence)
 return {status:'CREATE_ONLY_SHA_PINNED_LAYER_INVENTORY',...metadata,
    frameCount:nativeSequence.frameCount,beatCount:beats.length}
}
