#!/usr/bin/env node
/**
 * Zero-credit cinematic art contact sheet and per-stage PNG proof.
 * Uses the EXACT governed EvidenceMotion SVG renderer, not mockups.
 * Outputs are REVIEW ONLY. No narration/science approval is implied.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { renderVerticalVideoSceneSvg } from './render-vertical-video-package.mjs'
import { directR814Shot, auditR814ShotVariety } from './r814-cinematic-director.mjs'
const out=path.resolve(process.argv[2] || 'artifacts/evidencemotion-r814-visual-proof')
fs.mkdirSync(out,{recursive:true})
const sourceUrl='https://pubmed.ncbi.nlm.nih.gov/38788532/'
const contentHash='ART-DIRECTION-REVIEW-NOT-SCIENTIFIC-APPROVAL'
const scenes=[
  {role:'hook',visualScene:'person',beatId:'human',onScreenText:'THE HUMAN STORY',compositionFamily:'hero-object',motionType:'highlight',colorTreatment:'primaryDark'},
  {role:'finding',visualScene:'compare',beatId:'comparison',onScreenText:'FREQUENCY VS AMOUNT',compositionFamily:'split-compare',motionType:'highlight',colorTreatment:'primaryDark'},
  {role:'context',visualScene:'molecule',beatId:'compound',onScreenText:'MITRAGYNINE',compositionFamily:'diagram-flow',motionType:'highlight',colorTreatment:'primaryDark'},
  {role:'evidence',visualScene:'evidence',beatId:'source',onScreenText:'READ THE STUDY',compositionFamily:'evidence-focus',motionType:'highlight',colorTreatment:'primaryDark'},
  {role:'limitation',visualScene:'uncertainty',beatId:'limits',onScreenText:'ASSOCIATION IS NOT CAUSATION',compositionFamily:'macro-detail',motionType:'highlight',colorTreatment:'primaryDark'},
  {role:'limitation',visualScene:'safety',beatId:'safety',onScreenText:'WHAT ARE THE RISKS?',compositionFamily:'process-flow',motionType:'highlight',colorTreatment:'primaryDark'},
  {role:'cta',visualScene:'outro',beatId:'outro',onScreenText:'FOLLOW THE EVIDENCE',compositionFamily:'kinetic-type',motionType:'highlight',colorTreatment:'primaryDark'},
].map(s=>({...s,factualAuthority:'art-direction-preview-not-research-claim',motifId:'cinematic-thread',patternInterrupt:false,visualAction:'approved-directional-semantic-preview'}))
const novelty=auditR814ShotVariety(scenes)
const items=[]
for(let i=0;i<scenes.length;i++){
  const scene=scenes[i]
  const filename=String(i+1).padStart(2,'0')+'-'+scene.visualScene+'.png'
  const file=path.join(out,filename)
  const svg=renderVerticalVideoSceneSvg(scene,{
    creativeMethodRelease:'R8.09', motionPhase:'post',sourceUrl,contentHash,
    disclosure:'VISUAL DRAFT - NOT FOR PUBLICATION',
  }).svg
  if(!svg.includes('data-depth-plane="far"')||!svg.includes('data-depth-plane="mid"')||!svg.includes('data-depth-plane="near"')) {
    throw Error('Rendered 2.5D scene missing depth planes: '+scene.visualScene)
  }
  await sharp(Buffer.from(svg)).png().toFile(file)
  const buf=fs.readFileSync(file)
  const shot=directR814Shot(scene)
  items.push({file:filename,sha256:crypto.createHash('sha256').update(buf).digest('hex'),
    beatId:scene.beatId,sceneType:scene.visualScene,shotDna:shot.id,material:shot.material,
    camera:shot.camera,composition:shot.composition,light:shot.light.id,
    dimensions:'1080x1920',reviewOnly:true})
}
const tiles=[]
for(let i=0;i<items.length;i++){
  const p=path.join(out,items[i].file)
  const tile=await sharp(p).resize({width:270,height:480,fit:'contain',background:'#071b27'}).png().toBuffer()
  tiles.push({input:tile,left:(i%4)*286+24,top:Math.floor(i/4)*520+24})
}
const sheet=path.join(out,'r814-cinematic-seven-look-contact-sheet.png')
await sharp({create:{width:1200,height:1090,channels:4,background:'#07121f'}})
  .composite(tiles).png().toFile(sheet)
const manifest={version:'ths-evidencemotion-r814-art-preview-v1',status:'review-only',
  scientificApproval:false,auditoryAcceptance:false,sourceUrl,
  stageCount:items.length,novelty,items}
fs.writeFileSync(path.join(out,'visual-proof-receipt.json'),JSON.stringify(manifest,null,2)+'\n')
console.log(JSON.stringify({sheet,visualCount:items.length,novelty:novelty.uniqueLooks},null,2))
