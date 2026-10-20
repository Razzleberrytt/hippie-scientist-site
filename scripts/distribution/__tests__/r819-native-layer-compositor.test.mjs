import {test,expect} from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import {verifyR819LayerInventory,compositeR819Frame} from '../r819-native-layer-compositor.mjs'
import {authorR819LayerInventory} from '../r819-layer-inventory-writer.mjs'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
async function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'r819-native-composite-'))
 const beatId='hero',layerDir=path.join(root,'r819-layers',beatId)
 fs.mkdirSync(layerDir,{recursive:true})
 const W=1080,H=1920
 const art=await sharp({create:{width:W,height:H,channels:4,background:'#071a29'}}).png().toBuffer()
 const mechanism=await sharp({create:{width:W,height:H,channels:4,background:'#00000000'}})
  .composite([{input:Buffer.from('<svg width="1080" height="1920"><circle cx="540" cy="900" r="125" fill="#25e3c5"/></svg>')}]).png().toBuffer()
 const trust=await sharp({create:{width:W,height:H,channels:4,background:'#00000000'}})
  .composite([{input:Buffer.from('<svg width="1080" height="1920"><rect x="130" y="160" width="540" height="42" fill="#fefefe"/></svg>')}]).png().toBuffer()
 const assets={art:'r819-layers/hero/art-base.png',mechanism:'r819-layers/hero/f00000-mechanism.png',
  trust:'r819-layers/hero/f00000-trust.png'}
 const bytes={art,mechanism,trust}
 for(const k of Object.keys(bytes)){const file=path.join(root,assets[k]);fs.writeFileSync(file,bytes[k])}
 const composed=await sharp(art).ensureAlpha().composite([{input:mechanism},{input:trust}])
  .png({compressionLevel:9,adaptiveFiltering:false}).toBuffer()
 const original='r818-frames/hero/f00000.png'
 fs.mkdirSync(path.join(root,'r818-frames/hero'),{recursive:true})
 fs.writeFileSync(path.join(root,original),composed)
 const native={frameCount:1,beats:[{beatId,frames:[{file:original,frameIndex:0,sha256:sha(composed)}]}]}
 const frame={frameIndex:0,layers:Object.fromEntries(Object.keys(bytes).map(k=>[k,{file:assets[k],sha256:sha(bytes[k])}]))}
 const sequence={schemaVersion:'ths-r819-layer-sequence-v1',layerOrder:['art','mechanism','trust'],
  width:W,height:H,fps:30,beats:[{beatId,frames:[frame]}]}
 const manifestBytes=Buffer.from(JSON.stringify(sequence))
 fs.writeFileSync(path.join(root,'r819-layer-sequence.json'),manifestBytes)
 return {root,sequence,frame,native,meta:{file:'r819-layer-sequence.json',sha256:sha(manifestBytes)}}
}
test('real native three-layer compositing matches approved R8.18 pixels',async()=>{
 const f=await fixture()
 try{
  expect(verifyR819LayerInventory(f.root,f.meta,f.native).totalFrames).toBe(1)
  const out=path.join(f.root,'recomposed.png')
  const proof=await compositeR819Frame(f.root,f.sequence.beats[0],f.frame,f.native.beats[0].frames[0],out)
  expect(fs.existsSync(out)).toBe(true)
  expect(proof.layerSha256.length).toBe(3)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})
test('corrupted trust pixels cannot pass SHA even when R8.18 final file is untouched',async()=>{
 const f=await fixture()
 try{
  fs.writeFileSync(path.join(f.root,f.frame.layers.trust.file),Buffer.from('changed'))
  expect(()=>verifyR819LayerInventory(f.root,f.meta,f.native)).toThrow(/mutated\/incorrect/)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})
test('a composited image differing from approved R8.18 pixels blocks encoding',async()=>{
 const f=await fixture()
 try{
  const trustPath=path.join(f.root,f.frame.layers.trust.file)
  const bytes=await sharp({create:{width:1080,height:1920,channels:4,background:'#00000000'}})
   .composite([{input:Buffer.from('<svg width="1080" height="1920"><rect x="130" y="180" width="540" height="42" fill="#fefefe"/></svg>')}]).png().toBuffer()
  fs.writeFileSync(trustPath,bytes)
  f.frame.layers.trust.sha256=sha(bytes)
  await expect(compositeR819Frame(f.root,f.sequence.beats[0],f.frame,f.native.beats[0].frames[0],
    path.join(f.root,'bad.png'))).rejects.toThrow(/differs from native/)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})
test('R8.19 fails closed when the trust layer is removed even with a recomputed manifest SHA',async()=>{
 const f=await fixture()
 try{
  delete f.sequence.beats[0].frames[0].layers.trust
  const bytes=Buffer.from(JSON.stringify(f.sequence))
  fs.writeFileSync(path.join(f.root,'r819-layer-sequence.json'),bytes)
  expect(()=>verifyR819LayerInventory(f.root,{file:'r819-layer-sequence.json',sha256:sha(bytes)},f.native))
   .toThrow(/three exclusive ordered layer references/)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})

test('producer emits pinned complete frame inventory once and refuses silent re-signing',async()=>{
 const f=await fixture()
 try{
  const expectedTrustSha=f.frame.layers.trust.sha256
  fs.unlinkSync(path.join(f.root,'r819-layer-sequence.json'))
  const receipt=authorR819LayerInventory(f.root,f.native)
  expect(receipt.sha256).toMatch(/^[a-f0-9]{64}$/)
  const authored=JSON.parse(fs.readFileSync(path.join(f.root,receipt.file),'utf8'))
  expect(authored.beats[0].frames[0].layers.trust.sha256).toBe(expectedTrustSha)
  expect(verifyR819LayerInventory(f.root,receipt,f.native).totalFrames).toBe(1)
  expect(()=>authorR819LayerInventory(f.root,f.native)).toThrow(/cannot be overwritten/)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})
test('inventory author refuses a missing source trust layer',async()=>{
 const f=await fixture()
 try{
  fs.unlinkSync(path.join(f.root,'r819-layer-sequence.json'))
  fs.unlinkSync(path.join(f.root,f.frame.layers.trust.file))
  expect(()=>authorR819LayerInventory(f.root,f.native)).toThrow(/source layer missing/)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})
