import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'

const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const isHex=s=>/^[a-f0-9]{64}$/.test(String(s??''))
const PNG=Buffer.from('89504e470d0a1a0a','hex')
const kinds=['art','mechanism','trust']
function readLayer(root,item,beatId,index,kind){
 const expected=kind==='art'?'r819-layers/'+beatId+'/art-base.png':
   'r819-layers/'+beatId+'/f'+String(index).padStart(5,'0')+'-'+kind+'.png'
 if(item?.file!==expected||!isHex(item.sha256))throw Error('R8.19 missing/unpinned '+kind+' layer at '+beatId+'/'+index)
 const file=path.resolve(root,item.file)
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()||
    !fs.realpathSync(file).startsWith(root+path.sep))
  throw Error('R8.19 illegal or absent '+kind+' layer path')
 const bytes=fs.readFileSync(file)
 if(bytes.length<100||!bytes.subarray(0,8).equals(PNG)||bytes.readUInt32BE(16)!==1080||
   bytes.readUInt32BE(20)!==1920||sha(bytes)!==item.sha256)
  throw Error('R8.19 mutated/incorrect '+kind+' layer pixels')
 return bytes
}
export function verifyR819LayerInventory(packageDir, meta, nativeSequence) {
 const root=path.resolve(packageDir)
 if(meta?.file!=='r819-layer-sequence.json'||!isHex(meta.sha256))
  throw Error('R8.19 layer sequence has no SHA-pinned inventory')
 const file=path.resolve(root,meta.file)
 if(!file.startsWith(root+path.sep))throw Error('R8.19 layer inventory outside package')
 const bytes=fs.readFileSync(file)
 if(sha(bytes)!==meta.sha256)throw Error('R8.19 layer inventory was changed after binding')
 const sequence=JSON.parse(bytes.toString('utf8'))
 if(sequence.schemaVersion!=='ths-r819-layer-sequence-v1'||
   sequence.layerOrder?.join('/')!=='art/mechanism/trust'||
   sequence.width!==1080||sequence.height!==1920||sequence.fps!==30||
   !Array.isArray(sequence.beats)||sequence.beats.length!==nativeSequence.beats.length)
  throw Error('R8.19 source-separated native layer sequence missing/malformed')
 const used=new Set()
 for(let j=0;j<sequence.beats.length;j++){
  const b=sequence.beats[j],ref=nativeSequence.beats[j]
  if(b.beatId!==ref.beatId||!/^[a-zA-Z0-9_-]+$/.test(b.beatId)||
     !Array.isArray(b.frames)||b.frames.length!==ref.frames.length)
    throw Error('R8.19 beat/voice-timed native sequence mismatch')
  for(let i=0;i<b.frames.length;i++){
   const frame=b.frames[i]
   if(frame.frameIndex!==i||!frame.layers||Object.keys(frame.layers).sort().join(',')!=='art,mechanism,trust')
    throw Error('R8.19 frame must declare three exclusive ordered layer references')
   for(const kind of kinds){
    const layer=frame.layers[kind]
    if(kind!=='art'&&used.has(layer?.file))throw Error('R8.19 duplicate mutable layer reference')
    used.add(layer?.file)
    // Fail closed on all source layer bytes before rendering can begin.
    readLayer(root,layer,b.beatId,i,kind)
   }
  }
 }
 return {sequence,sha256:sha(bytes),totalFrames:nativeSequence.frameCount}
}
async function rawRGBA(bytes){
 const {data,info}=await sharp(bytes,{failOn:'error'}).ensureAlpha().raw()
   .toBuffer({resolveWithObject:true})
 if(info.width!==1080||info.height!==1920||info.channels!==4||info.depth!=='uchar')
  throw Error('R8.19 layer must decode to native 8-bit RGBA')
 return data
}
export async function compositeR819Frame(packageDir,layerBeat,frame,originalFrame,outputPath){
 const root=path.resolve(packageDir)
 const layers=kinds.map(kind=>readLayer(root,frame.layers[kind],layerBeat.beatId,frame.frameIndex,kind))
 for(let i=1;i<3;i++){
  const m=await sharp(layers[i]).metadata()
  if(m.format!=='png'||!m.hasAlpha)throw Error('R8.19 mechanism/trust layers require alpha channels')
 }
 const trust=await sharp(layers[2]).extractChannel('alpha').stats()
 if(trust.channels[0].max===0)throw Error('R8.19 invisible/empty trust layer cannot certify labels')
 const composed=await sharp(layers[0]).ensureAlpha()
  .composite([{input:layers[1],blend:'over'},{input:layers[2],blend:'over'}])
  .png({compressionLevel:9,adaptiveFiltering:false}).toBuffer()
 const expectedFile=path.resolve(root,originalFrame.file)
 if(!expectedFile.startsWith(root+path.sep))throw Error('R8.19 native expected path invalid')
 const expected=fs.readFileSync(expectedFile)
 if(sha(expected)!==originalFrame.sha256)throw Error('R8.19 previously reviewed R8.18 native-frame SHA drift')
 const decodedFinal=await rawRGBA(composed),decodedSource=await rawRGBA(expected)
 if(!decodedFinal.equals(decodedSource))
  throw Error('R8.19 source art/mechanism/trust differs from native encoded-frame input')
 fs.writeFileSync(outputPath,composed)
 return {beatId:layerBeat.beatId,frameIndex:frame.frameIndex,
   outputSha256:sha(composed),approvedNativeSha256:sha(expected),
   layerSha256:kinds.map(kind=>frame.layers[kind].sha256)}
}
