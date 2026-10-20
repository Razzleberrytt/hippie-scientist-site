#!/usr/bin/env node
// Real full-resolution production entry point. Unlike r818-physical-smoke,
// this requires a governed native-frame + original Kokoro + offline MFA package.
// No fake voice, proportional caption timing, review bypass, or autopublishing.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import crypto from 'node:crypto'
import { renderVerticalVideoMp4 } from './render-vertical-video-mp4.mjs'
import { renderR818ContactSheet } from './r818-render-contact-sheet.mjs'
import { assertR818VoicedReviewHandoff } from './r818-voiced-review-qa.mjs'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'))

export async function createR818VoicedReviewHandoff(packageDir, outputDir) {
  const dir=path.resolve(packageDir),output=path.resolve(outputDir)
  const manifest=read(path.join(dir,'video-asset-manifest.json'))
  if(manifest.canonicalFirstPassRelease!=='R8.17'||
     manifest.creativeMethodRelease!=='R8.10'||
     manifest.r818Telemetry?.file!=='r818-telemetry.json')
    throw Error('R8.18 full pilot requires governed R8.17 plan, R8.10 MFA and R8.18 native telemetry')
  // Never reuse the silent smoke demo; require a separately governed full video.
  if(!Array.isArray(manifest.assets)||manifest.assets.length<3)
    throw Error('R8.18 final video needs approved beat inventory')
  fs.mkdirSync(output,{recursive:true})
  const masterFile=path.join(output,'r818-full-pilot_REVIEW_ONLY.mp4')
  const master=await renderVerticalVideoMp4({packageDir:dir,outputFile:masterFile})
  const beats=manifest.assets.map(b=>({id:b.beatId,start:Number(b.start),end:Number(b.end)}))
  const contactResult=await renderR818ContactSheet({masterMp4:masterFile,beats,outputDir:output})
  const narration=read(path.join(dir,'narration.wav.receipt.json'))
  const alignment=read(path.join(dir,'word-alignment.receipt.json'))
  const handoff=assertR818VoicedReviewHandoff({master,narration,alignment,contact:contactResult.proof})
  const meta={...handoff,masterFile:path.basename(masterFile),
    masterReceiptFile:path.basename(masterFile)+'.receipt.json',
    contactSheetFile:path.basename(contactResult.sheetFile),
    sourceUrl:manifest.sourceUrl,
    sourceManifestSha256:sha(fs.readFileSync(path.join(dir,'video-asset-manifest.json')))}
  fs.writeFileSync(path.join(output,'r818-voiced-review-handoff.json'),JSON.stringify(meta,null,2)+'\n')
  return meta
}
if(process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url) {
  const [, , input, destination]=process.argv
  if(!input||!destination){console.error('Usage: node r818-voiced-review-handoff.mjs <governed-package-dir> <review-output-dir>');process.exitCode=2}
  else createR818VoicedReviewHandoff(input,destination).then(r=>console.log(JSON.stringify(r,null,2)))
    .catch(e=>{console.error('FAIL_CLOSED_R818: '+e.message);process.exitCode=1})
}
