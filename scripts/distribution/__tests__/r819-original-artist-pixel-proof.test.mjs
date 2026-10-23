import {test,expect} from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import {authorR819OriginalArtistPixelProof} from '../r819-original-artist-pixel-proof.mjs'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
async function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ths-r819-original-artist-'))
 const id='hero',base='r819-layers/'+id,stem=base+'/f00000'
 fs.mkdirSync(path.join(root,base),{recursive:true})
 fs.mkdirSync(path.join(root,'r818-frames',id),{recursive:true})
 const art=await sharp({create:{width:1080,height:1920,channels:4,
  background:{r:12,g:22,b:37,alpha:1}}}).png().toBuffer()
 const mechanism=await sharp({create:{width:1080,height:1920,channels:4,background:'#00000000'}})
   .composite([{input:Buffer.from('<svg width="1080" height="1920"><ellipse cx="540" cy="950" rx="175" ry="340" fill="#4dc9b6"/></svg>')}])
   .png().toBuffer()
 const trust=await sharp({create:{width:1080,height:1920,channels:4,background:'#00000000'}})
   .composite([{input:Buffer.from('<svg width="1080" height="1920"><rect x="110" y="1610" width="480" height="50" fill="#eef8ff"/></svg>')}])
   .png().toBuffer()
 const relative={art:base+'/art-base.png',mechanism:stem+'-mechanism.png',
  trust:stem+'-trust.png'}
 for(const [key,bytes] of Object.entries({art,mechanism,trust}))
  fs.writeFileSync(path.join(root,relative[key]),bytes)
 const pixels=await sharp(art).composite([{input:mechanism,blend:'over'},
  {input:trust,blend:'over'}]).png({compressionLevel:9,adaptiveFiltering:false}).toBuffer()
 const nativeName='r818-frames/'+id+'/f00000.png'
 fs.writeFileSync(path.join(root,nativeName),pixels)
 const nativeSequence={frameCount:1,beats:[{beatId:id,frames:[{
  frameIndex:0,file:nativeName,sha256:sha(pixels)}]}]}
 const source={schemaVersion:'ths-r819-original-artist-role-ledger-v1',
  status:'REVIEW_ONLY',sourceUrl:'https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/',
  artistGeneratorSha256:sha('source-author-hash'),sourceContentSha256:sha('source-snapshot'),
  beats:[{beatId:id,claimId:'ods-vitc-collagen',factualTextLocation:'trust-only',
    r819BackgroundEligible:true,art:{file:relative.art,sha256:sha(art)},
    frames:[{frameIndex:0,mechanism:{file:relative.mechanism,sha256:sha(mechanism)},
      trust:{file:relative.trust,sha256:sha(trust)}}]}]}
 return {root,source,nativeSequence,bytes:{art,mechanism,trust},relative}
}
const plan={beats:[{id:'hero',physicalArt:{primary:{}}}]}
test('original-artist 3-source review handoff produces exact pinned pixel proof without granting publication',async()=>{
 const f=await fixture()
 try{
  const result=await authorR819OriginalArtistPixelProof(f.root,{nativeSequence:f.nativeSequence,plan,source:f.source})
  expect(result.status).toBe('SOURCE_SEPARATED_PIXEL_MATCH_REVIEW_ONLY')
  expect(result.frameCount).toBe(1)
  expect(result.publicationApproved).toBe(false)
  expect(result.authenticR810WordAlignmentVerified).toBe(false)
  expect(fs.existsSync(path.join(f.root,'r819-artist-pixel-proofs/hero-f00000.png'))).toBe(true)
  await expect(authorR819OriginalArtistPixelProof(f.root,
    {nativeSequence:f.nativeSequence,plan,source:f.source})).rejects.toThrow(/create-only/)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})
test('a text-bearing flattened artist plate is not allowed to impersonate R8.19 art',async()=>{
 const f=await fixture()
 try{
  await expect(authorR819OriginalArtistPixelProof(f.root,{nativeSequence:f.nativeSequence,
   plan:{beats:[{id:'hero',physicalArt:{plate:{file:'fake.png'}}}]},source:f.source}))
   .rejects.toThrow(/original teaching plate contains/)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})
test('the artwork identity must not be re-signed with an altered file',async()=>{
 const f=await fixture()
 try{
  const file=path.join(f.root,f.relative.art)
  fs.appendFileSync(file,'corrupt')
  await expect(authorR819OriginalArtistPixelProof(f.root,
   {nativeSequence:f.nativeSequence,plan,source:f.source})).rejects.toThrow(/source layer SHA/)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})
test('an opaque trust screenshot is rejected even if its hash matches',async()=>{
 const f=await fixture()
 try{
  const opaque=await sharp({create:{width:1080,height:1920,channels:4,
   background:{r:10,g:20,b:35,alpha:1}}}).png().toBuffer()
  fs.writeFileSync(path.join(f.root,f.relative.trust),opaque)
  f.source.beats[0].frames[0].trust.sha256=sha(opaque)
  await expect(authorR819OriginalArtistPixelProof(f.root,
   {nativeSequence:f.nativeSequence,plan,source:f.source})).rejects.toThrow(/genuinely transparent/)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})
test('a re-signed visually changed trust layer fails exact decoded pixel equality',async()=>{
 const f=await fixture()
 try{
  const changed=await sharp({create:{width:1080,height:1920,channels:4,background:'#00000000'}})
   .composite([{input:Buffer.from('<svg width="1080" height="1920"><rect x="110" y="1590" width="480" height="50" fill="#eef8ff"/></svg>')}])
   .png().toBuffer()
  fs.writeFileSync(path.join(f.root,f.relative.trust),changed)
  f.source.beats[0].frames[0].trust.sha256=sha(changed)
  await expect(authorR819OriginalArtistPixelProof(f.root,
   {nativeSequence:f.nativeSequence,plan,source:f.source})).rejects.toThrow(/differs from native/)
  expect(fs.existsSync(path.join(f.root,'r819-original-artist-pixel-proof.json'))).toBe(false)
 }finally{fs.rmSync(f.root,{recursive:true,force:true})}
})
