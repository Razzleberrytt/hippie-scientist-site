import {test,expect} from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import {r818FrameRecipeKey,r818RenderResumableFrames,assertR818FrameSequenceReceipt} from '../r818-frame-cache.mjs'
import {r818ReviewFrameTimes,renderR818ContactSheet} from '../r818-render-contact-sheet.mjs'
const h=n=>n.repeat(64)
const recipe=()=>({rendererCodeSha256:h('a'),sceneAssetSha256:h('b'),
 approvedPlanSha256:h('c'),voiceTimingSha256:h('d'),width:1080,height:1920,fps:30,frameCount:4})
test('resumable native frames reuse verified cache, rebuild corrupt frame and isolate recipe change',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'r818-frames-test-'))
 try{
  const input=recipe(),calls=[]
  const renderFrame=async ({frameIndex})=>{
   calls.push(frameIndex)
   const pixels=Buffer.alloc(48*48*3)
   for(let i=0;i<pixels.length;i++)pixels[i]=(i*43+frameIndex*19)%256
   return sharp(pixels,{raw:{width:48,height:48,channels:3}}).png().toBuffer()
  }
  const first=await r818RenderResumableFrames({recipe:input,cacheRoot:dir,renderFrame})
  expect(first.rendered).toBe(4);expect(first.reused).toBe(0)
  const prior=JSON.parse(fs.readFileSync(path.join(first.directory,'frames.receipt.json'),'utf8'))
  expect(assertR818FrameSequenceReceipt(prior,input)).toBe(true)
  const second=await r818RenderResumableFrames({recipe:input,cacheRoot:dir,renderFrame})
  expect(second.reused).toBe(4)
  expect(calls).toHaveLength(4)
  fs.writeFileSync(path.join(first.directory,'frame-00002.png'),'tampered')
  const third=await r818RenderResumableFrames({recipe:input,cacheRoot:dir,renderFrame})
  expect(third.rendered).toBe(1);expect(third.reused).toBe(3)
  expect(calls).toHaveLength(5)
  const changed={...input,rendererCodeSha256:h('f')}
  expect(r818FrameRecipeKey(changed)).not.toBe(r818FrameRecipeKey(input))
  expect(()=>r818FrameRecipeKey({...input,fps:15})).toThrow()
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})
test('contact sheet samples start/mid/end for every scene without asserting pixel approval',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'r818-contact-test-'))
 try{
  const mp4=path.join(dir,'input.mp4');fs.writeFileSync(mp4,'fake-master-for-mocked-decoder')
  const beats=[{id:'hook',start:0,end:2},{id:'mechanism',start:2,end:5}]
  const times=r818ReviewFrameTimes(beats)
  expect(times.map(x=>x.phase)).toEqual(['start','mid','end','start','mid','end'])
  const png=await sharp({create:{width:1080,height:1920,channels:3,
    background:{r:44,g:78,b:105}}}).png().toBuffer()
  const result=await renderR818ContactSheet({masterMp4:mp4,beats,outputDir:dir,
    frameDecoder:async()=>png})
  expect(result.proof.allBeatsThreeFrames).toBe(true)
  expect(result.proof.samples).toHaveLength(6)
  expect(result.proof.pixelSemanticsCertified).toBe(false)
  expect(fs.existsSync(result.sheetFile)).toBe(true)
  await expect(sharp(result.sheetFile).metadata()).resolves.toMatchObject({width:768})
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})
