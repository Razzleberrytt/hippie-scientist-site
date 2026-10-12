import { test, expect } from 'vitest'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { verifyR819Art, verifyR819Composition } from '../r819-art-quality.mjs'
import { evaluateR819Release, verifyR819OwnerReferenceShelf } from '../r819-brutal-bar.mjs'
const h='a'.repeat(64)
const obj=(id,kind,x,y=200,emphasis=0)=>({
 objectId:id,kind,bbox:[x,y,80,80],visible:true,opacity:1,emphasisLevel:emphasis
})
const beat=(id,start,end,kind)=>({id,start,end,
 ...(kind==='hook'?{hook:true,hookObjectId:'dial'}:{}),
 ...(kind==='hero'?{hero:true,heroObjectId:'receptor'}:{})
})
function setup(){
 const beats=[beat('hook',0,3,'hook'),beat('hero',3,6,'hero'),beat('reports',6,19,'reports')]
 beats[2].items=Array.from({length:6},(_,i)=>({objectId:'card'+i,cueSeconds:6.4+2*i}))
 const storyboard={schemaVersion:'ths-r819-storyboard-v1',heroBeatId:'hero',beats}
 const telemetry={schemaVersion:'ths-r819-object-telemetry-v1',origin:'compositor-object-coordinates',
  masterSourceSha256:h,canvas:{width:1080,height:1920},sampleFps:5,
  beats:beats.map(b=>({beatId:b.id,frames:Array.from({length:Math.round((b.end-b.start)*5)+1},(_,i)=>{
   const t=b.start+i*.2
   const cards=Array.from({length:6},(_,j)=>obj('card'+j,'experience-card',50+(j%3)*300,100+(j>2?250:0),t>=6.4&&t<18.4&&Math.min(5,Math.floor((t-6.4)/2))===j?1:0))
   return {time:t,objects:b.id==='hook'?[obj('dial','semantic-hook',100+i*7),obj('caption','karaoke-word',200+i*12)]:
    b.id==='hero'?[obj('receptor','hero-subject',100+i*7)]:cards.concat(obj('caption','karaoke-word',200+i*12))}
  })}))}
 return {storyboard,telemetry}
}
const shelf={videos:[1,2,3].map(i=>({title:'Owner benchmark '+i,url:'https://example.org/'+i,reason:'Craft standard',curatedBy:'owner'}))}
const correct=Object.fromEntries(['scienceSourcesVerified','attributionVerified','denominatorsVerified','symbolicLabelsVerified',
 'pmidFootersVerified','wordCaptionsVerified','factualGraphicsDeterministic'].map(x=>[x,true]))
const craft=Object.fromEntries(['heroVisualPresent','hookElementMoves','narrationCutTiming',
 'multiItemSequenceAligned','noStockTransitions','compositionPixelProof','premiumVisualQuality'].map(x=>[x,true]))
const tech={width:1080,height:1920,fps:30,masterSha256:h,artManifestSha256:h,audioTempoFactor:1,integratedLufs:-13.9,
 truePeakDbtp:-2.6,trustLayerAboveArt:true,artAssetPinsVerified:true,rendererTelemetryVerified:true,
 finalDecodedPixelReview:true,longestCompositionalDroughtSeconds:5.5,audioFilters:[]}
const signs={ownerNativePhoneViewed:true,ownerFullNarrationListened:true,vIndependentCraftApproval:true,finalMasterHash:h}
const verdict=(over={})=>evaluateR819Release({correctness:correct,craft,technical:tech,referenceShelf:shelf,signoffs:signs,...over})
test('real semantic object movement, moving hook, hero and six narration-cued highlights',()=>{
 const {storyboard,telemetry}=setup()
 expect(verifyR819Composition(storyboard,telemetry).reports[2].items).toBe(6)
})
test('subtitle-only motion fails hook gate',()=>{
 const {storyboard,telemetry}=setup()
 for(const f of telemetry.beats[0].frames)f.objects[0].bbox[0]=100
 expect(()=>verifyR819Composition(storyboard,telemetry)).toThrow(/hook twist/)
})
test('an unspecified hero visual fails closed',()=>{
 const {storyboard,telemetry}=setup()
 storyboard.heroBeatId='nonexistent'
 expect(()=>verifyR819Composition(storyboard,telemetry)).toThrow(/hero/)
})
test('a missing user report highlight is an actual failure',()=>{
 const {storyboard,telemetry}=setup()
 for(const f of telemetry.beats[2].frames)f.objects.find(x=>x.objectId==='card4').emphasisLevel=0
 expect(()=>verifyR819Composition(storyboard,telemetry)).toThrow(/item missing/)
})
test('12s of stationary cards and caption movement is rejected',()=>{
 const {storyboard,telemetry}=setup()
 for(const f of telemetry.beats[2].frames)for(const o of f.objects)
  if(o.kind==='experience-card')o.emphasisLevel=0
 expect(()=>verifyR819Composition(storyboard,telemetry)).toThrow(/drought/)
})
test('static background must match the SHA used by storyboard',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'r819-art-'))
 try {
  fs.writeFileSync(path.join(dir,'art.svg'),'<svg><rect width="2" height="2"/></svg>')
  const sha=crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,'art.svg'))).digest('hex')
  const manifest={schemaVersion:'ths-r819-art-v1',style:'dark-cellular-organic',
   assets:[{id:'art',file:'art.svg',sha256:sha,purpose:'static-background',factsLayer:false}]}
  const {storyboard}=setup()
  storyboard.layerOrder=['art','mechanism','trust']
  for(const b of storyboard.beats)b.artAssetRefs=[{id:'art',sha256:sha}]
  expect(verifyR819Art(dir,manifest,storyboard).status).toBe('HASH_VERIFIED_NONFACTUAL_ART')
  storyboard.beats[0].artAssetRefs[0].sha256=h
  expect(()=>verifyR819Art(dir,manifest,storyboard)).toThrow(/asset SHA/)
  storyboard.beats[0].artAssetRefs[0].sha256=sha
  fs.writeFileSync(path.join(dir,'art.svg'),'<svg><text>100mg</text></svg>')
  expect(()=>verifyR819Art(dir,manifest,storyboard)).toThrow(/bytes changed/)
 } finally {fs.rmSync(dir,{recursive:true,force:true})}
})
test('nonfactual SVG rejects embedded text even if hash matches',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'r819-art-'))
 try {
  const bytes='<svg><text>wrong PMID</text></svg>',file='art.svg'
  fs.writeFileSync(path.join(dir,file),bytes)
  const sha=crypto.createHash('sha256').update(bytes).digest('hex')
  const {storyboard}=setup()
  storyboard.layerOrder=['art','mechanism','trust']
  for(const b of storyboard.beats)b.artAssetRefs=[{id:'art',sha256:sha}]
  expect(()=>verifyR819Art(dir,{schemaVersion:'ths-r819-art-v1',style:'dark-cellular-organic',assets:[
   {id:'art',file,sha256:sha,factsLayer:false,purpose:'static-background'}]},storyboard)).toThrow(/text, scripts/)
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})
test('correctness can pass and static template craft must still fail',()=>{
 const x=verdict({craft:{...craft,staticTemplateLayout:true}})
 expect(x.correctness.verdict).toBe('PASS')
 expect(x.craft.verdict).toBe('FAIL')
})
test('narration stretch is fatal; clip art remains independently fatal',()=>{
 expect(verdict({technical:{...tech,audioTempoFactor:.83}}).craft.verdict).toBe('FAIL')
 expect(verdict({craft:{...craft,stockFeelOrClipArt:true}}).craft.verdict).toBe('FAIL')
})
test('more than six seconds without composition change is fatal',()=>{
 expect(verdict({technical:{...tech,longestCompositionalDroughtSeconds:6.2}}).craft.killCriteria)
  .toContain('compositional-drought-over-six-seconds')
})
test('unspecified reference shelf keeps craft PENDING, not a fabricated score',()=>{
 expect(verifyR819OwnerReferenceShelf(null).valid).toBe(false)
 expect(verdict({referenceShelf:null}).craft.verdict).toBe('PENDING')
})
test('missing independent V approval cannot be inferred from passing tests',()=>{
 expect(verdict({signoffs:{...signs,vIndependentCraftApproval:false}}).releaseEligible).toBe(false)
})
test('bad PMID attribution vetoes even beautiful visuals',()=>{
 expect(verdict({correctness:{...correct,attributionVerified:false}}).releaseEligible).toBe(false)
})
test('post-encode -15.6 LUFS fails the enforced audio spec',()=>{
 expect(verdict({technical:{...tech,integratedLufs:-15.6}}).releaseEligible).toBe(false)
})
