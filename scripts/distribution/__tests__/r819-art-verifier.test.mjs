import { test, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {verifyR819ArtAssets,verifyR819WowGates} from '../r819-art-verifier.mjs'
const h='a'.repeat(64)
const object=(id,kind,bbox=[100,200,80,65],emphasisLevel=0)=>({objectId:id,kind,bbox,emphasisLevel,visible:true,opacity:1})
function fixture(){
 const board={schemaVersion:'ths-r819-storyboard-v1',heroBeatId:'hero',
 compositingOrder:['art','mechanism','trust'],beats:[
 {id:'hook',start:0,end:3,hook:true,hookObjectId:'dial',artAssetRefs:[{id:'cellular-organic-navy-teal',sha256:'f63b9207682e8d56d511603e6fa27859a013e9dfdbe71c66b9c8f5236cf12a6b'}]},
 {id:'hero',start:3,end:7,hero:true,heroObjectId:'receptor',artAssetRefs:[{id:'cellular-organic-navy-teal',sha256:'f63b9207682e8d56d511603e6fa27859a013e9dfdbe71c66b9c8f5236cf12a6b'}]},
 {id:'reports',start:7,end:20,artAssetRefs:[{id:'cellular-organic-navy-teal',sha256:'f63b9207682e8d56d511603e6fa27859a013e9dfdbe71c66b9c8f5236cf12a6b'}],alignmentReceiptSha256:h,
 items:Array.from({length:6},(_,i)=>({objectId:'card'+i,cueSeconds:7+i*2,wordId:'word'+i}))}]}
 const t={schemaVersion:'ths-r819-object-telemetry-v1',origin:'renderer-object-geometry',
 rendererSha256:h,sourceSha256:h,canvas:{width:1080,height:1920},sampleFps:5,beats:[
 {beatId:'hook',frames:Array.from({length:16},(_,i)=>({time:i*.2,objects:[object('dial','hero-dial',[150+i*16,400,80,65]),object('caption','karaoke-word',[200+i,1200,50,25])]}))},
 {beatId:'hero',frames:Array.from({length:21},(_,i)=>({time:3+i*.2,objects:[object('receptor','hero-object',[200+i*8,400,160,220])]}))},
 {beatId:'reports',frames:Array.from({length:66},(_,i)=>({time:7+i*.2,objects:[
   ...Array.from({length:6},(_,j)=>object('card'+j,'experience-card',[200+(j%3)*250,600+Math.floor(j/3)*200,210,180],i>=j*10&&i<(j+1)*10?1:0)),
   object('caption','karaoke-word',[100+i,1200,65,25])]}))}
 ]}
 return {board,t}
}
test('pinned repo artwork is byte-for-byte verified; mutated digest fails closed',()=>{
 const root=path.resolve(new URL('../',import.meta.url).pathname)
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/r819/art-manifest.json')))
 const {board}=fixture()
 expect(verifyR819ArtAssets(root,manifest,board).status).toBe('PINNED_ART_VERIFIED_NOT_VIDEO_PIXELS')
 const bad=structuredClone(manifest);bad.assets[0].sha256=h
 expect(()=>verifyR819ArtAssets(root,bad,board)).toThrow(/SHA mismatch/)
})
test('rendered hook, hero and six speech-cued highlights satisfy geometry contract',()=>{
 const {board,t}=fixture()
 expect(verifyR819WowGates(board,t).perBeat[2].narrationCuedItems).toBe(6)
})
test('word-changing captions do not rescue 13 seconds of stationary report cards',()=>{
 const {board,t}=fixture()
 for(const f of t.beats[2].frames)for(const o of f.objects)
  if(o.kind==='experience-card')o.emphasisLevel=0
 expect(()=>verifyR819WowGates(board,t)).toThrow(/6s without/)
})
test('stationary hook fails even when subtitles move',()=>{
 const {board,t}=fixture()
 for(const f of t.beats[0].frames)f.objects[0].bbox=[150,400,80,65]
 expect(()=>verifyR819WowGates(board,t)).toThrow(/opening twist/)
})
test('multi-item cues lacking canonical acoustic hash fail',()=>{
 const {board,t}=fixture();board.beats[2].alignmentReceiptSha256='no'
 expect(()=>verifyR819WowGates(board,t)).toThrow(/alignment SHA/)
})

test('real needle rotation counts; moving karaoke alone does not',()=>{
 const {board,t}=fixture()
 for(let i=0;i<t.beats[0].frames.length;i++){
  t.beats[0].frames[i].objects[0].bbox=[150,400,80,65]
  t.beats[0].frames[i].objects[0].rotationDeg=i*9
 }
 expect(verifyR819WowGates(board,t).perBeat[0].semanticChangeEvents).toBeGreaterThan(0)
})

test('storyboard asset reference with swapped SHA is rejected even when manifest bytes are pinned',()=>{
 const root=path.resolve(new URL('../',import.meta.url).pathname)
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/r819/art-manifest.json')))
 const {board}=fixture();board.beats[1].artAssetRefs[0].sha256=h
 expect(()=>verifyR819ArtAssets(root,manifest,board)).toThrow(/art ID and SHA binding/)
})
