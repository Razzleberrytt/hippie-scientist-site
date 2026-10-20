#!/usr/bin/env node
// Review-only R8.14 cinematic art proof. Produces 14 raster frames + contact
// sheet; never publishes or represents a reviewed scientific video.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { renderR809VisualActor, R809_VISUAL_STAGES } from './r809-visual-actors.mjs'
import { directR814Shot, auditR814ShotVariety } from './r814-cinematic-director.mjs'
import { assertNoDecorativeVideoChrome } from './evidencemotion-delivery-guardrails.mjs'

const output=path.resolve(process.argv[2] || 'artifacts/evidencemotion/r814-cinematic-proof')
fs.mkdirSync(output,{recursive:true})
const stageTitles={
  person:['WHO IS AFFECTED?','Human-centered visual metaphor'],
  compare:['FREQUENCY vs AMOUNT','Contrasting evidence variables'],
  molecule:['MOLECULAR CONTEXT','Symbolic network, not chemical geometry'],
  evidence:['INSIDE THE STUDY','Traceable sources and methods'],
  uncertainty:['ASSOCIATION ≠ CAUSATION','Evidence limits must stay visible'],
  safety:['KNOW THE LIMITATIONS','Visual warning, not clinical instruction'],
  outro:['READ THE RESEARCH','A source-first closing reveal'],
}
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
const scenes=R809_VISUAL_STAGES.map((visualScene,i)=>({
 visualScene,beatId:'visual-proof-'+i,role:visualScene,
 onScreenText:stageTitles[visualScene][0],compositionFamily: ['hero-object','split-compare','diagram-flow','evidence-focus'][i%4],
 visualAction:'Reveal source-anchored visual concept without adding factual claims',
}))
const shotAudit=auditR814ShotVariety(scenes)
const files=[]
for(const scene of scenes){
  const shot=directR814Shot(scene)
  for(const phase of ['pre','post']){
    const visual=renderR809VisualActor(scene,{
      x:80,y:480,width:560,height:490,foreground:'#e9fff8',background:'#082336',motionPhase:phase,
    })
    const [head,sub]=stageTitles[scene.visualScene]
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
      <defs><linearGradient id="plate" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="#071a2a"/><stop offset=".58" stop-color="#0b3142"/><stop offset="1" stop-color="#08212b"/></linearGradient></defs>
      <rect width="720" height="1280" fill="url(#plate)"/>
      <ellipse cx="470" cy="690" rx="330" ry="320" fill="${shot.light.flare}" fill-opacity=".08"/>
      <text x="74" y="165" font-family="sans-serif" font-size="24" letter-spacing="3" font-weight="700" fill="#b6f2df">THE HIPPIE SCIENTIST</text>
      <text x="74" y="275" font-family="sans-serif" font-size="${head.length>20?40:head.length>16?46:51}" font-weight="800" fill="#f0fff9">${esc(head)}</text>
      <text x="74" y="342" font-family="sans-serif" font-size="23" fill="#c2dfdf">${esc(sub)}</text>
      ${visual}
      <path d="M 74 1090 H 646" stroke="#a3eadc" stroke-opacity=".26" stroke-width="3"/>
      <text x="74" y="1133" font-family="sans-serif" font-size="21" fill="#c6e1e2">PROOF-OF-STYLE ONLY · REVIEW REQUIRED</text>
      <text x="74" y="1172" font-family="sans-serif" font-size="17" fill="#8ebfc0">No research findings added by illustration</text>
    </svg>`
    assertNoDecorativeVideoChrome(svg)
    const filename=`${scene.visualScene}-${phase}.png`
    await sharp(Buffer.from(svg)).png().toFile(path.join(output,filename))
    const bytes=fs.readFileSync(path.join(output,filename))
    files.push({filename,stage:scene.visualScene,phase,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
      camera:shot.camera, material:shot.material, composition:shot.composition, shotId:shot.id})
  }
}
const thumbs=files.filter(f=>f.phase==='post')
const tileW=360,tileH=640
const sheetWidth=tileW*4,sheetHeight=tileH*2
const composites=[]
for(let i=0;i<thumbs.length;i++) {
 const t=thumbs[i]
 const thumbnail=await sharp(path.join(output,t.filename)).resize(tileW,tileH).png().toBuffer()
 composites.push({input:thumbnail,left:i%4*tileW,top:Math.floor(i/4)*tileH})
}
await sharp({create:{width:sheetWidth,height:sheetHeight,channels:4,background:'#06121d'}})
  .composite(composites).png().toFile(path.join(output,'cinematic-contact-sheet.png'))
fs.writeFileSync(path.join(output,'visual-proof-receipt.json'),
 JSON.stringify({schemaVersion:'ths-r814-cinematic-proof-v1',status:'REVIEW_ONLY',
   noScientificAuthority:true, noPublicationAuthority:true, actualOwnerVisualApproval:false,
   renderer:'R8.14 CinematicDNA SVG/Sharp',shotAudit,files},null,2)+'\n')
console.log('Rendered',files.length,'authored cinematic pre/post frames and a 7-style contact sheet at',output)
